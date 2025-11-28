import { useState } from 'react';
import { ChevronDown, MoreVertical, Plus, Map as MapIcon, List } from 'lucide-react';
import { DayPlan, Activity } from '../../data/itinerary';
import ActivityItem from './ActivityItem';
import { MapView } from '../map/MapView';
import clsx from 'clsx';

interface DayCardProps {
    day: DayPlan;
    isExpanded: boolean;
    onToggle: () => void;
    isEditing?: boolean;
    onAddActivity?: () => void;
    onUpdateActivity?: (index: number, activity: Activity) => void;
    onRemoveActivity?: (index: number) => void;
}

export default function DayCard({
    day,
    isExpanded,
    onToggle,
    isEditing,
    onAddActivity,
    onUpdateActivity,
    onRemoveActivity
}: DayCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const getHeaderBorder = (city: string) => {
        switch (city) {
            case 'SF': return 'border-l-blue-500';
            case 'SLC': return 'border-l-purple-500';
            case 'SAN': return 'border-l-orange-500';
            case 'LA': return 'border-l-slate-500';
            default: return 'border-l-gray-500';
        }
    };

    return (
        <div
            className={clsx(
                "glass-panel rounded-xl overflow-hidden transition-all duration-300 border-l-4",
                getHeaderBorder(day.city),
                isExpanded ? "ring-1 ring-white/50" : "hover:bg-white/40"
            )}
        >
            {/* Day Header */}
            <div
                onClick={onToggle}
                className="p-5 cursor-pointer hover:bg-white/20 flex items-start justify-between group select-none transition-colors"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-indigo-900 bg-white/50 px-2 py-1 rounded-md border border-white/20">
                            {day.cityLabel}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMap(!showMap);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${showMap ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-white/40 text-gray-500'}`}
                            title={showMap ? "切換列表模式" : "切換地圖模式"}
                        >
                            {showMap ? <List size={20} /> : <MapIcon size={20} />}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/40 text-gray-500 transition-colors"
                            title="更多選項"
                        >
                            <MoreVertical size={20} />
                        </button>
                        <span className="text-sm text-gray-600 font-mono font-medium">{day.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {day.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{day.summary}</p>
                </div>
                <div className={clsx("ml-4 text-gray-400 transition-transform duration-300", isExpanded && "rotate-180 text-indigo-600")}>
                    <ChevronDown size={20} />
                </div>
            </div>

            {/* Day Details (Collapsible) */}
            {isExpanded && (
                <div className="border-t border-white/20">
                    <div className="bg-white/30 p-5 backdrop-blur-sm">
                        {showMap ? (
                            <MapView activities={day.activities} />
                        ) : (
                            <div className="space-y-2">
                                {day.activities.map((activity, idx) => (
                                    <ActivityItem
                                        key={idx}
                                        activity={activity}
                                        isLast={idx === day.activities.length - 1}
                                        isEditing={isEditing}
                                        onEdit={() => onUpdateActivity?.(idx, activity)}
                                        onDelete={() => onRemoveActivity?.(idx)}
                                    />
                                ))}
                            </div>
                        )}

                        {isEditing && (
                            <button
                                onClick={onAddActivity}
                                className="mt-4 w-full py-2 border-2 border-dashed border-indigo-300/50 rounded-lg text-indigo-600 font-medium hover:bg-white/40 hover:border-indigo-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                新增行程
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
