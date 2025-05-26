"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, Clock, Timer, Camera } from "lucide-react"
import FaceDetection from "./components/camera/FaceDetection"
import { Switch } from "./components/ui/switch"
import { useState } from "react"
import PeopleDetectedCard from "./components/dashboard/PeopleDetectedCard"
import PeoplePerHour from "./components/dashboard/PeoplePerHour"
import LastDetectedPeople from "./components/dashboard/LastDetectedPeople"
import FlowOverTime from "./components/dashboard/FlowOverTime"

export default function FaceMonitorDashboard() {
    const [isOn, setIsOn] = useState(false)
    const handleChangeSwitch = () => setIsOn(!isOn)
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Monitor Dashboard</h1>
                    <p className="text-gray-600">Real-time facial recognition monitoring system</p>
                </div>
                {/* Video Feed Section */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Live Camera Feed
                            <Switch checked={isOn} onCheckedChange={handleChangeSwitch} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                            <div className={`text-center ${isOn ? 'h-full' : ''}`}>
                                {isOn ? <FaceDetection /> : <>
                                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">Webcam Video Feed</p>
                                    <p className="text-gray-400 text-sm">Camera stream will appear here</p>
                                </>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PeopleDetectedCard />
                    <PeoplePerHour />
                    <LastDetectedPeople />
                </div>

                {/* Graph Section */}
                <FlowOverTime />

                {/* Technical Responses Section */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900">📌 Respostas Técnicas Obrigatórias</CardTitle>
                        <CardDescription>Documentação técnica das implementações do sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="distance-calculation" className="text-sm font-medium text-gray-700">
                                1. Como calculou a distância do rosto até a câmera?
                            </Label>
                            <Textarea
                                id="distance-calculation"
                                className="min-h-[100px] resize-none"
                                defaultValue="A distância foi estimada usando a proporção entre a largura do retângulo delimitador (bounding box) detectado pelo face-api.js e uma distância de referência. O cálculo assume que:
                                    
                                    1. Para uma distância de referência de 100cm, um rosto médio ocupa aproximadamente 100px de largura
                                    2. A fórmula aplicada é: Distância (cm) = (100 * 100) / larguraDoRostoEmPixels
                                    3. Esta abordagem fornece uma estimativa razoável para distâncias entre 50cm e 200cm
                                    4. A precisão varia com a resolução da câmera e características físicas do rosto"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="firebase-rule" className="text-sm font-medium text-gray-700">
                                2. Qual regra usou para registrar a detecção no Firebase?
                            </Label>
                            <Textarea
                                id="firebase-rule"
                                placeholder="Explique a regra implementada para registrar detecções no Firebase..."
                                className="min-h-[100px] resize-none"
                                defaultValue="As detecções são registradas no Firestore com as seguintes regras:

                                    1. Coleção: 'faceDetections'
                                    2. Estrutura do documento:
                                    - descriptor: Array<number> (vetor de características faciais)
                                    - timestamp: number (milissegundos desde epoch)
                                    - age: string (idade estimada)
                                    - gender: string (gênero estimado)
                                    - expression: string (emoção predominante)
                                    
                                    3. Regras de segurança:
                                    - Somente leitura/escrita por usuários autenticados
                                    - Validação dos campos obrigatórios
                                    - Timestamp deve ser válido (entre data atual - 1 dia e data atual + 5 minutos)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duplicate-prevention" className="text-sm font-medium text-gray-700">
                                3. Como evitou contagem duplicada de rostos? (se aplicável)
                            </Label>
                            <Textarea
                                id="duplicate-prevention"
                                placeholder="Descreva o método utilizado para evitar contagem duplicada de rostos..."
                                className="min-h-[100px] resize-none"
                                defaultValue="Usa face-api.js com detectAllFaces + withFaceLandmarks + withFaceDescriptors para detectar múltiplas faces e extrair descritores (vetores numéricos). Para evitar duplicatas, calcula a distância euclidiana — medida de similaridade que calcula a raiz da soma dos quadrados das diferenças entre os valores dos vetores. Se a distância entre dois descritores for menor que 0.6, considera a mesma face. Aplica essa lógica localmente (últimos 10s) e no Firestore para salvar só novas faces."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
