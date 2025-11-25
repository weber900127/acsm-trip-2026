import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, User, Calendar, Save } from 'lucide-react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { addDays, format, parseISO } from 'date-fns';
import { DayPlan } from '../../data/itinerary';

interface AdminManagerProps {
    isOpen: boolean;
    onClose: () => void;
    currentAdmins: string[];
    currentUserEmail?: string | null;
}

export default function AdminManager({ isOpen, onClose, currentAdmins, currentUserEmail }: AdminManagerProps) {
    const [newEmail, setNewEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startDate, setStartDate] = useState('2026-05-20');
    const [endDate, setEndDate] = useState('2026-06-04');
    const [isSavingDate, setIsSavingDate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch current settings
            getDoc(doc(db, "trips", "settings")).then(snap => {
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.startDate) setStartDate(data.startDate);
                    if (data.endDate) setEndDate(data.endDate);
                }
            });
        }
    }, [isOpen]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newEmail.includes('@')) return;
        if (currentAdmins.includes(newEmail)) {
            alert('此 Email 已經是管理員了');
            return;
        }

        setIsSubmitting(true);
        try {
            const newAdmins = [...currentAdmins, newEmail];
            await updateDoc(doc(db, "trips", "settings"), {
                adminEmails: newAdmins
            });
            setNewEmail('');
        } catch (error) {
            console.error("Failed to add admin:", error);
            alert("新增失敗，請檢查網路或權限");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveAdmin = async (emailToRemove: string) => {
        if (emailToRemove === currentUserEmail) {
            alert("您不能移除自己的管理員權限");
            return;
        }
        if (!confirm(`確定要移除 ${emailToRemove} 的管理權限嗎？`)) return;

        try {
            const newAdmins = currentAdmins.filter(email => email !== emailToRemove);
            await updateDoc(doc(db, "trips", "settings"), {
                adminEmails: newAdmins
            });
        } catch (error) {
            console.error("Failed to remove admin:", error);
            alert("移除失敗");
        }
    };

    const handleSaveDate = async () => {
        if (!confirm(`確定要更新行程日期嗎？\n出發：${startDate}\n回台：${endDate}\n這將會重新計算所有行程的日期！`)) return;

        setIsSavingDate(true);
        try {
            // 1. Update settings
            await setDoc(doc(db, "trips", "settings"), { startDate, endDate }, { merge: true });

            // 2. Fetch current itinerary and recalculate dates
            const itinerarySnap = await getDoc(doc(db, "trips", "main"));
            if (itinerarySnap.exists()) {
                const currentDays = itinerarySnap.data().days as DayPlan[];
                const newStart = parseISO(startDate);

                const updatedDays = currentDays.map((day, index) => {
                    const newDate = addDays(newStart, index);
                    // Format: "2026/05/20 (三)"
                    const dateStr = format(newDate, 'yyyy/MM/dd');
                    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][newDate.getDay()];

                    return {
                        ...day,
                        date: `${dateStr} (${weekDay})`
                    };
                });

                await updateDoc(doc(db, "trips", "main"), { days: updatedDays });
                alert("日期更新成功！");
            }
        } catch (error) {
            console.error("Failed to update date:", error);
            alert("更新失敗");
        } finally {
            setIsSavingDate(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <div className="flex items-center gap-2">
                        <Shield className="text-emerald-400" size={20} />
                        <h2 className="text-lg font-bold">團隊與設定</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Trip Settings Section */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-600" />
                            行程設定
                        </h3>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-indigo-900 mb-1">出發日期 (Day 1)</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-900 mb-1">回台日期</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900"
                                />
                            </div>
                            <button
                                onClick={handleSaveDate}
                                disabled={isSavingDate}
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                <Save size={16} />
                                更新設定
                            </button>
                            <p className="text-xs text-indigo-600 mt-2 opacity-80 text-center">
                                * 修改後會自動推算所有行程日期
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Admin Management Section */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={16} className="text-indigo-600" />
                            管理員名單
                        </h3>

                        <form onSubmit={handleAddAdmin} className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="輸入 Google Email"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Plus size={18} />
                                    新增
                                </button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                <AnimatePresence mode="popLayout">
                                    {currentAdmins.map(email => (
                                        <motion.div
                                            key={email}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{email}</span>
                                                {email === currentUserEmail && (
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">YOU</span>
                                                )}
                                            </div>

                                            {email !== currentUserEmail && (
                                                <button
                                                    onClick={() => handleRemoveAdmin(email)}
                                                    className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title="移除權限"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
