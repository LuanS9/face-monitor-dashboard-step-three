import { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "../ui/card";
import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";

export default function FlowOverTime() {
    const [data, setData] = useState<{ hour: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const q = query(
            collection(db, "faceDetections"),
            where("timestamp", ">=", yesterday.getTime())
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const detections = querySnapshot.docs.map((doc) => ({
                timestamp: new Date(doc.data().timestamp)
            }));

            const hourlyData: Record<number, number> = {};
            detections.forEach((detection) => {
                const hour = detection.timestamp.getHours();
                hourlyData[hour] = (hourlyData[hour] || 0) + 1;
            });

            const chartData = Array.from({ length: 24 }, (_, i) => {
                const date = new Date();
                date.setHours(i, 0, 0, 0);
                return {
                    hour: format(date, "HH:00"),
                    count: hourlyData[i] || 0
                };
            });

            setData(chartData);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to data for chart:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Flow of people over time</CardTitle>
                <CardDescription>
                    {loading
                        ? "Loading data..."
                        : "Real-time visualization of people detection throughout the day"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full h-80">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-pulse text-gray-500">
                                Loading chart data...
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fill: "#6b7280" }}
                                    tickLine={{ stroke: "#6b7280" }}
                                />
                                <YAxis
                                    tick={{ fill: "#6b7280" }}
                                    tickLine={{ stroke: "#6b7280" }}
                                    label={{
                                        value: "People Count",
                                        angle: -90,
                                        position: "insideLeft",
                                        fill: "#6b7280"
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        borderColor: "#374151",
                                        borderRadius: "0.5rem"
                                    }}
                                    itemStyle={{ color: "#f3f4f6" }}
                                    labelStyle={{ color: "#9ca3af", fontWeight: "bold" }}
                                    formatter={(value) => [`${value} people`, "Count"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}