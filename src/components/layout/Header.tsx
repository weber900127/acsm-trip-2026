import { useState, useEffect, useRef } from 'react';
import { Plane, Calendar, Download, Upload, CreditCard, LogOut, Shield } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { User } from 'firebase/auth';

interface HeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
    onExport?: () => void;
    onImport?: (file: File) => void;
    onOpenWallet?: () => void;
    onOpenSettings?: () => void;
    user: User | null;
    isAdmin?: boolean;
    onLogin: () => void;
    onLogout: () => void;
}

export default function Header({ isEditing, onToggleEdit, onExport, onImport, onOpenWallet, onOpenSettings, user, isAdmin, onLogin, onLogout }: HeaderProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [startDate, setStartDate] = useState<Date>(new Date('2026-05-20T00:00:00'));
    const [endDate, setEndDate] = useState<Date>(new Date('2026-06-04T00:00:00'));

    useEffect(() => {
        // Fetch start date from settings
        const fetchSettings = async () => {
            try {
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../../lib/firebase');
                const snap = await getDoc(doc(db, "trips", "settings"));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.startDate) {
                        setStartDate(new Date(data.startDate + 'T00:00:00'));
                    }
                    if (data.endDate) {
                        setEndDate(new Date(data.endDate + 'T00:00:00'));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();

            setTimeLeft({
                days: differenceInDays(startDate, now),
                hours: differenceInHours(startDate, now) % 24,
                minutes: differenceInMinutes(startDate, now) % 60
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);

        return () => clearInterval(timer);
    }, [startDate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImport) {
            onImport(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <header className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-8 pb-16 px-4 shadow-lg overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <Plane className="absolute top-10 right-10 w-24 h-24 rotate-12" />
                <Calendar className="absolute bottom-4 left-10 w-32 h-32 -rotate-12" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6 md:gap-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-2 py-1 rounded">Trip Plan</span>
                            <span className="text-xs">
                                {startDate.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')} -
                                {endDate.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold mb-1 tracking-tight">ACSM Annual Meeting</h1>
                        <div className="flex items-center gap-2 text-indigo-100 text-sm">
                            <span>SF</span>
                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                            <span>SLC</span>
                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                            <span>SAN</span>
                            <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                            <span>LA</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-center min-w-[120px] border border-white/30 shadow-xl">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-100 mb-0.5">出發倒數</div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl font-bold">{timeLeft.days}</span>
                                <span className="text-[10px] opacity-80">天</span>
                                <span className="text-lg font-bold">{timeLeft.hours}</span>
                                <span className="text-[10px] opacity-80">時</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* User Badge */}
                            {user ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mr-2">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-4 h-4 rounded-full" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-indigo-400" />
                                    )}
                                    <span className="text-xs font-medium">{user.displayName || user.email}</span>
                                    <button onClick={onLogout} className="ml-1 hover:text-red-200 transition-colors" title="登出">
                                        <LogOut size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onLogin}
                                    className="px-3 py-1.5 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-all shadow-md mr-2"
                                >
                                    Google 登入
                                </button>
                            )}

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />

                            <div className="flex bg-black/20 rounded-full p-1 backdrop-blur-sm">
                                <button
                                    onClick={onExport}
                                    className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                                    title="匯出行程"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                                    title="匯入行程"
                                >
                                    <Upload size={16} />
                                </button>
                            </div>

                            <button
                                onClick={onOpenWallet}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                            >
                                <CreditCard size={16} />
                                <span className="text-xs font-medium">錢包</span>
                            </button>

                            {isAdmin && (
                                <>
                                    <button
                                        onClick={onOpenSettings}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                                        title="團隊權限管理"
                                    >
                                        <Shield size={16} />
                                    </button>

                                    <button
                                        onClick={onToggleEdit}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-lg ${isEditing
                                            ? 'bg-amber-400 text-amber-900 ring-2 ring-amber-200'
                                            : 'bg-white text-indigo-600 hover:bg-indigo-50'
                                            }`}
                                    >
                                        {isEditing ? '完成' : '編輯'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
