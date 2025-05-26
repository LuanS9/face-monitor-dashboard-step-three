import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function PeoplePerHour() {
    const [average, setAverage] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const qToday = query(
            collection(db, 'faceDetections'),
            where('timestamp', '>=', todayStart.getTime())
        );

        const unsubscribe = onSnapshot(qToday, (snapshot) => {
            setLoading(true);

            if (snapshot.empty) {
                setAverage(0);
                setLoading(false);
                return;
            }

            const hourlyCounts: Record<number, number> = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const detectionDate = new Date(data.timestamp);
                const hour = detectionDate.getHours();
                hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
            });

            const currentHour = new Date().getHours();

            if (hourlyCounts[currentHour] !== undefined) {
                setAverage(hourlyCounts[currentHour]);
            } else {
                const hoursWithData = Object.keys(hourlyCounts).length;
                const totalDetections = Object.values(hourlyCounts).reduce((sum, count) => sum + count, 0);
                setAverage(Math.round(totalDetections / Math.max(1, hoursWithData)));
            }

            setLoading(false);
        }, (error) => {
            console.error("Error in real-time listener:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">People Per Hour</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold text-gray-900">{average}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date().getHours() === 0
                                ? "Starting new day"
                                : "Current hour average"}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}