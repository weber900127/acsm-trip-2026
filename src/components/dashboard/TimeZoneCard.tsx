import { useState, useEffect } from 'react';
import { Clock, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

interface TimeZoneCardProps {
    className?: string;
}

export default function TimeZoneCard({ className }: TimeZoneCardProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date, timeZone: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: timeZone
        }).format(date);
    };

    const getHour = (date: Date, timeZone: string) => {
        return parseInt(new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timeZone
        }).format(date));
    };

    const isDaytime = (hour: number) => hour >= 6 && hour < 18;

    const zones = [
        { label: '台北 (Home)', zone: 'Asia/Taipei', code: 'TPE' },
        { label: '美西 (Trip)', zone: 'America/Los_Angeles', code: 'PDT' }
    ];

    return (
        <div className={clsx("bg-white rounded-xl shadow-sm border border-gray-200 p-4", className)}>
            <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold border-b pb-2">
                <Clock size={18} className="text-indigo-600" />
                <h3 className="text-sm">時區儀表板</h3>
            </div>

            <div className="space-y-3">
                {zones.map((z) => {
                    const timeStr = formatTime(currentTime, z.zone);
                    const hour = getHour(currentTime, z.zone);
                    const isDay = isDaytime(hour);

                    return (
                        <div key={z.code} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={clsx(
                                    "p-1.5 rounded-full",
                                    isDay ? "bg-orange-100 text-orange-500" : "bg-indigo-100 text-indigo-500"
                                )}>
                                    {isDay ? <Sun size={14} /> : <Moon size={14} />}
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">{z.code}</div>
                                    <div className="text-sm font-bold text-gray-800">{z.label}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-mono font-bold text-gray-800 tracking-tight">
                                    {timeStr}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {isDay ? 'Daytime' : 'Night'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Business Hours Overlap Indicator */}
            <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>聯絡最佳時間 (Overlap):</span>
                    <span className="font-medium text-green-600">09:00 - 11:00 TPE</span>
                </div>
            </div>
        </div>
    );
}
