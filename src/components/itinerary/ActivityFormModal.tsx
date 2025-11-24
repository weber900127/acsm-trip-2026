import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Activity, ActivityType } from '../../data/itinerary';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: Activity) => void;
    initialData?: Activity;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
    { value: 'flight', label: '飛行' },
    { value: 'transport', label: '交通' },
    { value: 'food', label: '餐飲' },
    { value: 'sightseeing', label: '觀光' },
    { value: 'hotel', label: '住宿' },
    { value: 'conference', label: '會議' },
    { value: 'other', label: '其他' },
];

export default function ActivityFormModal({ isOpen, onClose, onSave, initialData }: ActivityFormModalProps) {
    const [formData, setFormData] = useState<Activity>({
        time: '',
        title: '',
        description: '',
        type: 'other',
        location: '',
        tips: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                time: '',
                title: '',
                description: '',
                type: 'other',
                location: '',
                tips: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {initialData ? '編輯行程' : '新增行程'}
                                </h3>
                                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="例如: 14:00"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as ActivityType })}
                                        >
                                            {ACTIVITY_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">地點 (選填)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.location || ''}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">預估費用 (USD)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.cost || ''}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : undefined })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">備註/小撇步 (選填)</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.tips || ''}
                                            onChange={e => setFormData({ ...formData, tips: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        儲存行程
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
