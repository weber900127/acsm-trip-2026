import { useState, useEffect } from 'react';
import { Plane, Download, CreditCard, LogOut, Shield, Lightbulb, RotateCcw } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { User } from 'firebase/auth';

interface HeaderProps {
    isEditing?: boolean;
    onToggleEdit?: () => void;
    onExport?: () => void;
    onImport?: (file: File) => void;
    onOpenWallet?: () => void;
    onOpenSettings?: () => void;
    onOpenIdeaPool?: () => void;
    user: User | null;
    isAdmin?: boolean;
    onLogin: () => void;
    onLogout: () => void;
    onUndo?: () => void;
    canUndo?: boolean;
}

export default function Header({ isEditing, onToggleEdit, onExport, onOpenWallet, onOpenSettings, onOpenIdeaPool, user, isAdmin, onLogin, onLogout, onUndo, canUndo }: HeaderProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

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



    return (
        <header className="relative pt-8 pb-12 px-4 overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Ticket Container */}
                <div className="bg-white p-6 md:p-8 shadow-lg transform rotate-1 border-2 border-gray-200 relative mx-4 md:mx-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    {/* Washi Tape Decoration */}
                    <div className="washi-tape"></div>

                    {/* Ticket Perforation Line */}
                    <div className="absolute left-0 right-0 top-1/2 border-b-2 border-dashed border-gray-300 -z-10 hidden md:block"></div>
                    <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[var(--paper-bg)] rounded-full -translate-y-1/2 hidden md:block shadow-inner"></div>
                    <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[var(--paper-bg)] rounded-full -translate-y-1/2 hidden md:block shadow-inner"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12">
                        {/* Left Side: Trip Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-block border-2 border-gray-800 px-3 py-1 mb-3 transform -rotate-2">
                                <span className="font-heading font-bold tracking-widest uppercase text-xs">Boarding Pass</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2 text-gray-800 leading-tight">
                                ACSM <span className="text-gray-400 italic font-serif">2026</span>
                            </h1>

                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold tracking-wider text-gray-600 font-mono">
                                <span>SF</span>
                                <Plane size={16} className="text-gray-400" />
                                <span>SLC</span>
                                <Plane size={16} className="text-gray-400" />
                                <span>SAN</span>
                                <Plane size={16} className="text-gray-400" />
                                <span>LA</span>
                            </div>
                        </div>

                        {/* Right Side: Date & Actions */}
                        <div className="flex flex-col items-center md:items-end gap-4">
                            <div className="text-center md:text-right">
                                <div className="font-hand text-2xl text-gray-500 transform -rotate-3 mb-1">Save the date!</div>
                                <div className="font-heading text-xl font-bold border-b-2 border-gray-800 inline-block pb-1">
                                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    <span className="mx-2 text-gray-400">&mdash;</span>
                                    {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                {/* User Avatar Stamp */}
                                {user ? (
                                    <div className="relative group cursor-pointer" title={user.displayName || user.email || ''}>
                                        <div className="w-12 h-12 rounded-full border-4 border-gray-200 overflow-hidden shadow-sm transition-all">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover grayscale-0" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold">
                                                    {user.displayName?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={onLogout} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <LogOut size={10} />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={onLogin} className="sticker px-4 py-2 font-hand text-lg font-bold hover:scale-105 transition-transform">
                                        Sign In
                                    </button>
                                )}

                                {/* Action Stamps */}
                                <div className="flex gap-2">
                                    {/* Undo Button */}
                                    {isAdmin && (
                                        <button
                                            onClick={onUndo}
                                            disabled={!canUndo}
                                            className={`w-10 h-10 border-2 rounded-full flex items-center justify-center transition-colors ${canUndo ? 'border-gray-300 text-gray-500 hover:border-indigo-500 hover:text-indigo-600' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                                            title="復原 (Undo)"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    )}

                                    <button onClick={onExport} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors" title="Export">
                                        <Download size={18} />
                                    </button>
                                    <button onClick={onOpenWallet} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors" title="Wallet">
                                        <CreditCard size={18} />
                                    </button>
                                    <button onClick={onOpenIdeaPool} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:border-amber-400 hover:text-amber-500 transition-colors" title="Idea Pool">
                                        <Lightbulb size={18} />
                                    </button>
                                    {isAdmin && (
                                        <>
                                            <button onClick={onToggleEdit} className={`w-10 h-10 border-2 rounded-full flex items-center justify-center transition-colors ${isEditing ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:border-gray-800 hover:text-gray-800'}`} title="Toggle Edit Mode">
                                                <div className="relative">
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 transition-opacity" style={{ opacity: isEditing ? 1 : 0 }}></div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </div>
                                            </button>
                                            <button onClick={onOpenSettings} className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors" title="Admin Settings">
                                                <Shield size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Countdown Post-it - Moved to top-center to utilize empty space */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 -rotate-2 paper-note p-3 w-28 text-center z-20 hidden md:block shadow-md">
                    <div className="w-2 h-2 rounded-full bg-red-400 mx-auto mb-1 shadow-sm"></div>
                    <div className="font-hand text-lg leading-none mb-0.5 text-gray-600">Countdown</div>
                    <div className="font-heading text-2xl font-bold text-gray-800">{timeLeft.days}<span className="text-xs font-sans font-normal text-gray-500 ml-1">days</span></div>
                </div>
            </div>
        </header>
    );
}
