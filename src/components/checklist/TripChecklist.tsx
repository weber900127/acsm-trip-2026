import { useState, useEffect } from 'react';
import { CheckSquare, Check } from 'lucide-react';
import { checklistItems } from '../../data/itinerary';
import clsx from 'clsx';

export default function TripChecklist() {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('trip_checklist');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('trip_checklist', JSON.stringify(checkedItems));
    }, [checkedItems]);

    const toggleItem = (item: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [item]: !prev[item]
        }));
    };

    const progress = Math.round((Object.values(checkedItems).filter(Boolean).length / checklistItems.length) * 100);

    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                        <CheckSquare size={20} className="text-emerald-600" />
                        行前檢查清單
                    </h3>
                    <span className="text-sm font-bold text-emerald-700">{progress}% 完成</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-emerald-200/50 rounded-full h-2">
                    <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {checklistItems.map((item, index) => (
                    <label
                        key={index}
                        className={clsx(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                            checkedItems[item]
                                ? "bg-emerald-50 border-emerald-200"
                                : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                        )}
                    >
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={!!checkedItems[item]}
                                onChange={() => toggleItem(item)}
                            />
                            <div className={clsx(
                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                checkedItems[item] ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"
                            )}>
                                {checkedItems[item] && <Check size={12} className="text-white" />}
                            </div>
                        </div>
                        <span className={clsx(
                            "text-sm transition-colors select-none",
                            checkedItems[item] ? "text-emerald-800 line-through opacity-70" : "text-gray-700"
                        )}>
                            {item}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
