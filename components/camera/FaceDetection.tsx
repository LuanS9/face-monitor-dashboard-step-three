"use client";

import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { loadModels } from "@/lib/face-api";

interface FaceToSave {
    descriptor: number[];
    distance: string;
    expression: string;
    age: number;
    gender: string;
}

export default function FaceDetection() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isProcessingRef = useRef<boolean>(false);
    const recentDescriptorsRef = useRef<{ descriptor: number[]; timestamp: number }[]>([]);

    const LOCAL_THRESHOLD = 0.6;
    const GLOBAL_THRESHOLD = 0.6;
    const COOLDOWN_MS = 10000;

    const euclideanDistance = (d1: number[], d2: number[]) => {
        return Math.sqrt(d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0));
    };

    const isRecent = (descriptor: number[]) => {
        const now = Date.now();
        return recentDescriptorsRef.current.some(({ descriptor: saved, timestamp }) => {
            const dist = euclideanDistance(saved, descriptor);
            return dist < LOCAL_THRESHOLD && now - timestamp < COOLDOWN_MS;
        });
    };

    const estimateDistance = (faceWidth: number): string => {
        return Math.round(100 / (faceWidth / 100)).toString();
    };

    const getDominantExpression = (expressions: faceapi.FaceExpressions): string => {
        return Object.entries(expressions)
            .reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];
    };

    const isDuplicateFace = async (descriptor: number[]) => {
        const snapshot = await getDocs(collection(db, "faceDetections"));
        return snapshot.docs.some((doc) => {
            const savedDescriptor = doc.data().descriptor;
            const dist = euclideanDistance(savedDescriptor, descriptor);
            return dist < GLOBAL_THRESHOLD;
        });
    };

    const saveFace = async (newFace: FaceToSave) => {
        const descriptorArray = Array.from(newFace.descriptor);

        if (isRecent(descriptorArray)) {
            return false;
        }

        const duplicate = await isDuplicateFace(descriptorArray);
        if (duplicate) {
            return false;
        }

        const newFacePayload = {
            descriptor: descriptorArray,
            timestamp: Date.now(),
            age: newFace.age,
            gender: newFace.gender,
            expression: newFace.expression
        }

        await addDoc(collection(db, "faceDetections"), newFacePayload);

        recentDescriptorsRef.current.push({
            descriptor: descriptorArray,
            timestamp: Date.now(),
        });

        recentDescriptorsRef.current = recentDescriptorsRef.current.filter(
            ({ timestamp }) => Date.now() - timestamp < COOLDOWN_MS
        );

        return true;
    };

    useEffect(() => {
        const startVideo = () => {
            navigator.mediaDevices
                .getUserMedia({ video: {} })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => console.error("Erro ao acessar webcam:", err));
        };


        const detect = async () => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
                if (!videoRef.current || !canvasRef.current) return;

                const video = videoRef.current;
                const canvas = canvasRef.current;
                const displaySize = { width: video.width, height: video.height };
                faceapi.matchDimensions(canvas, displaySize);

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions()
                    .withAgeAndGender()
                    .withFaceDescriptors();

                const resized = faceapi.resizeResults(detections, displaySize);
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    faceapi.draw.drawDetections(canvas, resized);

                    for (const detection of resized) {
                        const box = detection.detection.box;
                        const distance = estimateDistance(box.width);
                        const expression = getDominantExpression(detection.expressions || {});
                        const age = detection.age ? detection.age.toFixed(2) : "-";
                        const gender = detection.gender || "-";

                        const textLines: string[] = [
                            `Distância: ${distance ?? "-"} cm`,
                            `Idade: ${age} anos`,
                            `Gênero: ${gender}`,
                            `Humor: ${expression}`,
                        ];

                        const drawBox = new faceapi.draw.DrawTextField(
                            textLines,
                            box.bottomLeft
                        );
                        drawBox.draw(canvas);
                    }
                }

                for (const detection of detections) {
                    if (detection.descriptor) {
                        const newFaceData: FaceToSave = {
                            descriptor: Array.from(detection.descriptor),
                            distance: estimateDistance(detection.detection.box.width),
                            expression: getDominantExpression(detection.expressions || {}),
                            age: detection.age,
                            gender: detection.gender,
                        };
                        await saveFace(newFaceData);
                    }
                }
            } catch (err) {
                console.error("Erro ao detectar faces:", err);
            } finally {
                isProcessingRef.current = false;
            }
        };

        loadModels().then(() => {
            startVideo();
            const interval = setInterval(detect, 3000);
            return () => clearInterval(interval);
        });
    }, []);

    return (
        <div className="relative w-full h-96">
            <video
                ref={videoRef}
                width={640}
                height={480}
                autoPlay
                muted
                className="w-full h-full object-cover rounded-lg"
            />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute top-0 left-0 w-full h-full"
            />
        </div>
    );
}
