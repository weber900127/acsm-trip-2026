import { useState } from 'react';
import { ChevronDown, Plus, Map as MapIcon, List } from 'lucide-react';
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
    const [showMap, setShowMap] = useState(false);

    return (
        <div
            className={clsx(
                "polaroid-card mb-8 relative",
                isExpanded ? "z-20 scale-105 rotate-0" : "hover:z-10"
            )}
        >
            {/* Washi Tape (Randomized visual) */}
            <div className="washi-tape" style={{ transform: `translateX(-50%) rotate(${Math.random() * 4 - 2}deg)`, backgroundColor: day.city === 'SF' ? 'rgba(255, 154, 158, 0.6)' : 'rgba(162, 217, 255, 0.6)' }}></div>

            {/* Day Header */}
            <div
                onClick={onToggle}
                className="cursor-pointer flex items-start justify-between group select-none"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 border-b-2 border-gray-100 pb-2">
                        <span className="font-hand text-xl font-bold text-gray-500 transform -rotate-2">
                            {day.date}
                        </span>
                        <div className="flex-1"></div>
                        <span className="text-xs font-bold tracking-widest uppercase bg-gray-800 text-white px-2 py-1 transform rotate-1">
                            {day.cityLabel}
                        </span>
                    </div>

                    <h3 className="text-2xl font-heading font-bold text-gray-800 mb-2 leading-tight">
                        {day.title}
                    </h3>
                    <p className="font-hand text-lg text-gray-500 leading-snug">{day.summary}</p>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMap(!showMap);
                        }}
                        className={`p-2 rounded-full border-2 transition-all ${showMap ? 'border-gray-800 text-gray-800 bg-gray-100' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}
                        title={showMap ? "List View" : "Map View"}
                    >
                        {showMap ? <List size={18} /> : <MapIcon size={18} />}
                    </button>
                    <div className={clsx("p-2 text-gray-300 transition-transform duration-300", isExpanded && "rotate-180 text-gray-800")}>
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            {/* Day Details (Collapsible) */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                    <div className="bg-[var(--paper-bg)] p-4 rounded border border-gray-100 shadow-inner">
                        {showMap ? (
                            <MapView activities={day.activities} />
                        ) : (
                            <div className="space-y-4 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 border-l border-dashed border-gray-300"></div>

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
                                className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded text-gray-500 font-heading font-bold hover:border-gray-800 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 group"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                Add New Memory
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
