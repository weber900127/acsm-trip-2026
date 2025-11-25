import React, { useState } from 'react';
import { X, Plus, Trash2, CreditCard, Plane, Hotel, Ticket, Shield, MoreHorizontal, Edit2, Utensils, Train, ShoppingBag, Music } from 'lucide-react';
import { WalletItem, WalletCategory } from '../../hooks/useWallet';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: WalletItem[];
    onAdd: (item: Omit<WalletItem, 'id'>) => void;
    onUpdate: (id: string, item: Omit<WalletItem, 'id'>) => void;
    onRemove: (id: string) => void;
    totalCost: number;
}

const CATEGORY_ICONS: Record<WalletCategory, any> = {
    flight: Plane,
    hotel: Hotel,
    ticket: Ticket,
    insurance: Shield,
    food: Utensils,
    transport: Train,
    shopping: ShoppingBag,
    entertainment: Music,
    other: MoreHorizontal
};

const CATEGORY_LABELS: Record<WalletCategory, string> = {
    flight: '機票',
    hotel: '住宿',
    ticket: '票券',
    insurance: '保險',
    food: '飲食',
    transport: '交通',
    shopping: '購物',
    entertainment: '娛樂',
    other: '其他'
};

export default function WalletModal({ isOpen, onClose, items, onAdd, onUpdate, onRemove, totalCost }: WalletModalProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<WalletItem, 'id'>>({
        category: 'other',
        title: '',
        reference: '',
        details: '',
        cost: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItemId) {
            onUpdate(editingItemId, formData);
            setEditingItemId(null);
        } else {
            onAdd(formData);
            setIsAdding(false);
        }
        setFormData({
            category: 'other',
            title: '',
            reference: '',
            details: '',
            cost: 0
        });
    };

    const handleEdit = (item: WalletItem) => {
        setFormData({
            category: item.category,
            title: item.title,
            reference: item.reference,
            details: item.details,
            cost: item.cost
        });
        setEditingItemId(item.id);
        setIsAdding(false);
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setFormData({
            category: 'other',
            title: '',
            reference: '',
            details: '',
            cost: 0
        });
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
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl pointer-events-auto flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <CreditCard className="text-amber-400" />
                                            旅行錢包 & 預算
                                        </h2>
                                        <p className="text-slate-400 text-sm mt-1">管理您的訂位資訊與旅費</p>
                                    </div>
                                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                                    <div className="text-xs text-slate-300 uppercase tracking-wider font-medium mb-1">總預估花費 (行程 + 錢包)</div>
                                    <div className="text-3xl font-bold text-white font-mono">
                                        ${totalCost.toLocaleString()} <span className="text-lg text-slate-400">USD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                {(isAdding || editingItemId) ? (
                                    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-gray-800">{editingItemId ? '編輯項目' : '新增項目'}</h3>
                                            <button
                                                type="button"
                                                onClick={() => editingItemId ? handleCancelEdit() : setIsAdding(false)}
                                                className="text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                取消
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">類別</label>
                                                <select
                                                    className="w-full p-2 border rounded-lg"
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value as WalletCategory })}
                                                >
                                                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">費用 (USD)</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border rounded-lg"
                                                    value={formData.cost}
                                                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">標題 (例如：航班號碼)</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full p-2 border rounded-lg"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">參考編號 (訂位代號)</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded-lg"
                                                    value={formData.reference}
                                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">詳情 (時間/座位)</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded-lg"
                                                    value={formData.details}
                                                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
                                            {editingItemId ? '更新' : '儲存'}
                                        </button>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mb-6"
                                    >
                                        <Plus size={20} />
                                        新增錢包項目
                                    </button>
                                )}

                                <div className="space-y-3">
                                    {items.map(item => {
                                        const Icon = CATEGORY_ICONS[item.category];
                                        return (
                                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-start gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-gray-800 truncate">{item.title}</h4>
                                                        {item.cost ? (
                                                            <span className="font-mono font-medium text-gray-900">${item.cost}</span>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-sm text-indigo-600 font-mono mt-0.5">{item.reference}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{item.details}</div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-gray-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="編輯"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onRemove(item.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="刪除"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {items.length === 0 && !isAdding && (
                                        <div className="text-center py-12 text-gray-400">
                                            <CreditCard size={48} className="mx-auto mb-3 opacity-20" />
                                            <p>錢包是空的</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
