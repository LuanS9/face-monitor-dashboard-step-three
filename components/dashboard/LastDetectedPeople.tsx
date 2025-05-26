import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function LastDetectedPeople() {
    const [lastDetectionTime, setLastDetectionTime] = useState<string>('--:--:--');
    const [timeAgo, setTimeAgo] = useState<string>('No data yet');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'faceDetections'),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setLoading(true);
            if (!querySnapshot.empty) {
                const lastDoc = querySnapshot.docs[0];
                const timestamp = lastDoc.data().timestamp;
                const detectionDate = new Date(timestamp);

                const hours = detectionDate.getHours().toString().padStart(2, '0');
                const minutes = detectionDate.getMinutes().toString().padStart(2, '0');
                const seconds = detectionDate.getSeconds().toString().padStart(2, '0');
                setLastDetectionTime(`${hours}:${minutes}:${seconds}`);

                updateTimeAgo(detectionDate);
            } else {
                setLastDetectionTime('--:--:--');
                setTimeAgo('No data yet');
            }
            setLoading(false);
        });

        const updateTimeAgo = (detectionDate: Date) => {
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - detectionDate.getTime()) / 1000);

            if (diffInSeconds < 60) {
                setTimeAgo(`${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`);
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                setTimeAgo(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                setTimeAgo(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                setTimeAgo(`${days} day${days !== 1 ? 's' : ''} ago`);
            }
        };

        return () => unsubscribe();
    }, []);

    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Last Detection Time</CardTitle>
                <Timer className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold text-gray-900">{lastDetectionTime}</div>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}