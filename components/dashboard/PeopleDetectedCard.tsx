import { useEffect, useState } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PeopleDetectedCard() {
    const [todayCount, setTodayCount] = useState(0);
    const [yesterdayCount, setYesterdayCount] = useState(0);
    const [percentageChange, setPercentageChange] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

        const qToday = query(
            collection(db, 'faceDetections'),
            where('timestamp', '>=', todayStart.getTime()),
            where('timestamp', '<', todayEnd.getTime())
        );

        const qYesterday = query(
            collection(db, 'faceDetections'),
            where('timestamp', '>=', yesterdayStart.getTime()),
            where('timestamp', '<', yesterdayEnd.getTime())
        );

        const unsubscribeToday = onSnapshot(qToday, (snapshot: QuerySnapshot<DocumentData>) => {
            const newTodayCount = snapshot.size;
            setTodayCount(newTodayCount);
            setLoading(false);

            if (yesterdayCount > 0) {
                const change = ((newTodayCount - yesterdayCount) / yesterdayCount) * 100;
                setPercentageChange(parseFloat(change.toFixed(1)));
            } else if (newTodayCount > 0) {
                setPercentageChange(100);
            } else {
                setPercentageChange(null);
            }
        });

        const unsubscribeYesterday = onSnapshot(qYesterday, (snapshot: QuerySnapshot<DocumentData>) => {
            const newYesterdayCount = snapshot.size;
            setYesterdayCount(newYesterdayCount);

            if (newYesterdayCount > 0) {
                const change = ((todayCount - newYesterdayCount) / newYesterdayCount) * 100;
                setPercentageChange(parseFloat(change.toFixed(1)));
            } else if (todayCount > 0) {
                setPercentageChange(100);
            } else {
                setPercentageChange(null);
            }
        });

        return () => {
            unsubscribeToday();
            unsubscribeYesterday();
        };
    }, [todayCount, yesterdayCount]);

    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    Total People Detected
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold text-gray-900">{todayCount}</div>
                        <p className={`text-xs mt-1 ${percentageChange === null
                            ? 'text-gray-500'
                            : percentageChange >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}>
                            {percentageChange === null
                                ? "No previous data"
                                : `${percentageChange >= 0 ? '+' : ''}${percentageChange}% from yesterday`}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}