import { useState, useEffect } from 'react';
import { CheckSquare, Check, Plus, Trash2, X, Save } from 'lucide-react';
import { checklistItems as defaultItems } from '../../data/itinerary';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import clsx from 'clsx';

interface TripChecklistProps {
    isEditing?: boolean;
}

export default function TripChecklist({ isEditing }: TripChecklistProps) {
    const [items, setItems] = useState<string[]>([]);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('trip_checklist');
        return saved ? JSON.parse(saved) : {};
    });
    const [newItemText, setNewItemText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

    const [isLocalEditing, setIsLocalEditing] = useState(false);

    // Effective editing state: either global or local
    const isEffectiveEditing = isEditing || isLocalEditing;

    // Load items from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "trips", "checklist"), (docSnap) => {
            if (docSnap.exists()) {
                setItems(docSnap.data().items || []);
            } else {
                // Initialize with default items if document doesn't exist
                setDoc(doc(db, "trips", "checklist"), { items: defaultItems });
                setItems(defaultItems);
            }
        });

        return () => unsubscribe();
    }, []);

    // Save checked state to local storage
    useEffect(() => {
        localStorage.setItem('trip_checklist', JSON.stringify(checkedItems));
    }, [checkedItems]);

    const toggleItem = (item: string) => {
        if (isEffectiveEditing) return; // Prevent checking while editing to avoid confusion
        setCheckedItems(prev => ({
            ...prev,
            [item]: !prev[item]
        }));
    };

    const handleAddItem = async () => {
        if (!newItemText.trim()) return;
        const newItems = [...items, newItemText.trim()];
        await setDoc(doc(db, "trips", "checklist"), { items: newItems });
        setNewItemText('');
        setIsAdding(false);
    };

    const handleDeleteItem = async (index: number) => {
        if (!confirm('確定要刪除這個項目嗎？')) return;
        const newItems = items.filter((_, i) => i !== index);
        await setDoc(doc(db, "trips", "checklist"), { items: newItems });
    };

    const startEditing = (index: number, text: string) => {
        setEditingIndex(index);
        setEditingText(text);
    };

    const saveEditing = async (index: number) => {
        if (!editingText.trim()) return;
        const newItems = [...items];
        newItems[index] = editingText.trim();
        await setDoc(doc(db, "trips", "checklist"), { items: newItems });
        setEditingIndex(null);
    };

    const progress = items.length > 0 ? Math.round((Object.values(checkedItems).filter(Boolean).length / items.length) * 100) : 0;

    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            {/* Washi Tape Decoration */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/80 transform rotate-1 shadow-sm z-10"></div>

            <div className="p-6 bg-[var(--paper-bg)] border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 font-heading">
                        <CheckSquare size={20} className="text-gray-600" />
                        行前檢查清單
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsLocalEditing(!isLocalEditing)}
                            className={clsx(
                                "p-1.5 rounded-full transition-colors",
                                isLocalEditing ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            )}
                            title={isLocalEditing ? "完成編輯" : "編輯清單"}
                        >
                            <CheckSquare size={16} />
                        </button>
                        <span className="text-sm font-bold text-gray-600 font-hand text-lg">{progress}% 完成</span>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gray-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                {items.map((item, index) => (
                    <div key={index} className="relative group">
                        {editingIndex === index ? (
                            <div className="flex gap-2 items-center p-2 rounded-lg border border-indigo-300 bg-indigo-50">
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-sm"
                                    autoFocus
                                />
                                <button onClick={() => saveEditing(index)} className="text-indigo-600 hover:text-indigo-800">
                                    <Save size={16} />
                                </button>
                                <button onClick={() => setEditingIndex(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label
                                className={clsx(
                                    "flex items-start gap-3 p-3 rounded-lg transition-all border relative",
                                    isEffectiveEditing ? "cursor-default border-dashed border-gray-300" : "cursor-pointer",
                                    checkedItems[item] && !isEffectiveEditing
                                        ? "bg-gray-50 border-gray-200"
                                        : !isEffectiveEditing && "hover:bg-gray-50 border-transparent hover:border-gray-200"
                                )}
                            >
                                <div className="relative flex items-center mt-0.5">
                                    {!isEffectiveEditing && (
                                        <>
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={!!checkedItems[item]}
                                                onChange={() => toggleItem(item)}
                                            />
                                            <div className={clsx(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                checkedItems[item] ? "bg-gray-600 border-gray-600" : "bg-white border-gray-300"
                                            )}>
                                                {checkedItems[item] && <Check size={12} className="text-white" />}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <span className={clsx(
                                    "text-sm transition-colors select-none flex-1 font-hand text-lg",
                                    checkedItems[item] && !isEffectiveEditing ? "text-gray-400 line-through decoration-gray-400" : "text-gray-700"
                                )}>
                                    {item}
                                </span>

                                {isEffectiveEditing && (
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={(e) => { e.preventDefault(); startEditing(index, item); }}
                                            className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                                        >
                                            <CheckSquare size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDeleteItem(index); }}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </label>
                        )}
                    </div>
                ))}

                {isEffectiveEditing && (
                    <div className="col-span-1 md:col-span-2 mt-2">
                        {isAdding ? (
                            <div className="flex gap-2 items-center p-3 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50">
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    placeholder="輸入新項目..."
                                    className="flex-1 bg-transparent outline-none text-sm placeholder-indigo-300"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                />
                                <button onClick={handleAddItem} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                                    新增
                                </button>
                                <button onClick={() => setIsAdding(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-bold"
                            >
                                <Plus size={18} />
                                新增檢查項目
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
