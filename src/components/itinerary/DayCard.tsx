import { useState } from 'react';
import { ChevronDown, Plus, List, Clock, Map as MapIcon } from 'lucide-react';
import { DayPlan, Activity } from '../../data/itinerary';
import ActivityItem from './ActivityItem';
import { MapView } from '../map/MapView';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface DayCardProps {
    day: DayPlan;
    isExpanded: boolean;
    onToggle: () => void;
    isEditing?: boolean;
    onAddActivity?: () => void;
    onUpdateActivity?: (index: number, activity: Activity) => void;
    onRemoveActivity?: (index: number) => void;
    onActivityFocus?: (id: string) => void;
    highlightedActivityId?: string | null;
}

export default function DayCard({
    day,
    isExpanded,
    onToggle,
    isEditing,
    onAddActivity,
    onUpdateActivity,
    onRemoveActivity,
    onActivityFocus,
    highlightedActivityId
}: DayCardProps) {
    const [showMap, setShowMap] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

    // Helper to parse time to minutes for timeline positioning
    const getMinutes = (timeStr: string) => {
        const [time] = timeStr.split(' ');
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

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
                        className={`p-2 rounded-full border-2 transition-all lg:hidden ${showMap ? 'border-gray-800 text-gray-800 bg-gray-100' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}
                        title={showMap ? "List View" : "Map View"}
                    >
                        {showMap ? <List size={18} /> : <MapIcon size={18} />}
                    </button>

                    {/* View Toggle */}
                    {isExpanded && !showMap && (
                        <div className="flex bg-gray-100 p-1 rounded-lg" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Timeline View"
                            >
                                <Clock size={16} />
                            </button>
                        </div>
                    )}

                    <div className={clsx("p-2 text-gray-300 transition-transform duration-300 self-end", isExpanded && "rotate-180 text-gray-800")}>
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            {/* Day Details (Collapsible) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                            <div className="bg-[var(--paper-bg)] p-4 rounded border border-gray-100 shadow-inner">
                                {showMap ? (
                                    <MapView activities={day.activities} />
                                ) : viewMode === 'list' ? (
                                    // LIST VIEW
                                    <div className="space-y-4 relative pl-4">
                                        {/* Vertical Line */}
                                        <div className="absolute left-8 top-2 bottom-2 w-0.5 bg-gray-200 border-l border-dashed border-gray-300"></div>

                                        {day.activities.map((activity, idx) => {
                                            const activityId = `${day.id}-${idx}`;
                                            const nextActivity = day.activities[idx + 1];

                                            // Calculate Distance if both have coordinates
                                            let distanceInfo = null;
                                            if (activity.coordinates && nextActivity?.coordinates) {
                                                const R = 6371; // Earth radius in km
                                                const dLat = (nextActivity.coordinates.lat - activity.coordinates.lat) * Math.PI / 180;
                                                const dLon = (nextActivity.coordinates.lng - activity.coordinates.lng) * Math.PI / 180;
                                                const a =
                                                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                                    Math.cos(activity.coordinates.lat * Math.PI / 180) * Math.cos(nextActivity.coordinates.lat * Math.PI / 180) *
                                                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                                const d = R * c; // Distance in km

                                                // Estimate time: 30km/h city speed + 5 min buffer
                                                const estTime = Math.round((d / 30) * 60 + 5);

                                                if (d > 0.5) { // Only show if distance > 500m
                                                    distanceInfo = { dist: d.toFixed(1), time: estTime };
                                                }
                                            }

                                            return (
                                                <div key={idx} className="relative">
                                                    <ActivityItem
                                                        id={activityId}
                                                        activity={activity}
                                                        isLast={idx === day.activities.length - 1}
                                                        isEditing={isEditing}
                                                        isHighlighted={highlightedActivityId === activityId}
                                                        onEdit={() => onUpdateActivity?.(idx, activity)}
                                                        onDelete={() => onRemoveActivity?.(idx)}
                                                        onFocus={onActivityFocus}
                                                    />

                                                    {/* Travel Time Estimator */}
                                                    {distanceInfo && (
                                                        <div className="absolute left-8 bottom-[-24px] transform -translate-x-1/2 z-10 bg-white border-2 border-indigo-100 rounded-full px-3 py-1 text-xs font-bold text-indigo-600 flex items-center gap-1.5 shadow-md whitespace-nowrap group-hover/time:scale-110 transition-transform">
                                                            <span className="bg-indigo-100 p-0.5 rounded-full">🚗</span>
                                                            <span>{distanceInfo.dist} km</span>
                                                            <span className="text-indigo-200">|</span>
                                                            <span>約 {distanceInfo.time} 分鐘</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // TIMELINE VIEW
                                    <div className="relative h-[600px] bg-white rounded-xl border border-gray-200 shadow-inner overflow-y-auto p-4 custom-scrollbar">
                                        {/* Time Grid (06:00 to 24:00) */}
                                        {Array.from({ length: 19 }).map((_, i) => {
                                            const hour = i + 6;
                                            return (
                                                <div key={hour} className="absolute w-full border-t border-gray-100 text-xs text-gray-300 flex items-center" style={{ top: `${(hour - 6) * 50}px` }}>
                                                    <span className="w-10 text-right pr-2">{hour}:00</span>
                                                </div>
                                            );
                                        })}

                                        {/* Activities */}
                                        {day.activities.map((activity, idx) => {
                                            const startMin = getMinutes(activity.time);
                                            // Start from 6:00 AM (360 min)
                                            const top = ((startMin - 360) / 60) * 50;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="absolute left-12 right-2 p-2 rounded-lg border border-indigo-100 bg-indigo-50/80 hover:bg-indigo-100 transition-colors cursor-pointer shadow-sm text-xs overflow-hidden"
                                                    style={{
                                                        top: `${Math.max(0, top)}px`,
                                                        height: '45px' // Fixed height for now as we don't have duration
                                                    }}
                                                    onClick={() => onUpdateActivity?.(idx, activity)}
                                                >
                                                    <div className="font-bold text-indigo-900 truncate">{activity.time} {activity.title}</div>
                                                    <div className="text-indigo-600 truncate">{activity.description}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {isEditing && !showMap && viewMode === 'list' && (
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
