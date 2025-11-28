import { useState } from 'react';
import { Activity, DayPlan } from '../../data/itinerary';
import { Plus, Trash2, Calendar, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaPoolProps {
    isOpen: boolean;
    onClose: () => void;
    items: Activity[];
    days: DayPlan[];
    onAdd: (activity: Activity) => void;
    onRemove: (index: number) => void;
    onMoveToDay: (index: number, dayId: string) => void;
}

export default function IdeaPool({ isOpen, onClose, items, days, onAdd, onRemove, onMoveToDay }: IdeaPoolProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        const newActivity: Activity = {
            time: '00:00', // Default time
            title: newItemTitle,
            description: '待定行程',
            type: 'sightseeing',
            iconName: 'MapPin'
        };

        onAdd(newActivity);
        setNewItemTitle('');
        setIsAdding(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                    <Lightbulb size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 font-heading">點子池</h2>
                                    <p className="text-sm text-gray-500">暫存您的靈感與待定行程</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {/* Add New Input */}
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 mb-6"
                                >
                                    <Plus size={20} />
                                    新增點子
                                </button>
                            ) : (
                                <form onSubmit={handleAdd} className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-amber-200">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="想去哪裡？"
                                        className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-amber-200 outline-none"
                                        value={newItemTitle}
                                        onChange={e => setNewItemTitle(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            取消
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                                        >
                                            新增
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* List */}
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <motion.div
                                        layout
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-gray-800">{item.title}</h3>
                                            <button
                                                onClick={() => onRemove(index)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Move to Day Dropdown */}
                                        <div className="relative">
                                            <select
                                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        onMoveToDay(index, e.target.value);
                                                    }
                                                }}
                                                value=""
                                            >
                                                <option value="" disabled>📅 加入行程...</option>
                                                {days.map(day => (
                                                    <option key={day.id} value={day.id}>
                                                        {day.date.split(' ')[0]} - {day.cityLabel}
                                                    </option>
                                                ))}
                                            </select>
                                            <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </motion.div>
                                ))}

                                {items.length === 0 && !isAdding && (
                                    <div className="text-center py-12 text-gray-400">
                                        <Lightbulb size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>點子池是空的</p>
                                        <p className="text-xs mt-1">把想去的地方先記在這裡吧！</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
