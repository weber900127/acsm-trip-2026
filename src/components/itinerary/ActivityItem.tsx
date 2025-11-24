import {
    MapPin, Info, Pencil, Trash2, ArrowUp, ArrowDown,
    Plane, Coffee, Camera, Train, Car, Sun, Moon, Briefcase, Utensils, CheckSquare
} from 'lucide-react';
import { Activity } from '../../data/itinerary';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface ActivityItemProps {
    activity: Activity;
    isLast: boolean;
    isEditing?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

export default function ActivityItem({
    activity,
    isLast,
    isEditing,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown
}: ActivityItemProps) {
    const getIcon = (name?: string) => {
        switch (name) {
            case 'Plane': return Plane;
            case 'MapPin': return MapPin;
            case 'Coffee': return Coffee;
            case 'Camera': return Camera;
            case 'Train': return Train;
            case 'Car': return Car;
            case 'Sun': return Sun;
            case 'Moon': return Moon;
            case 'Briefcase': return Briefcase;
            case 'Utensils': return Utensils;
            case 'CheckSquare': return CheckSquare;
            default: return Info;
        }
    };

    const Icon = getIcon(activity.iconName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex gap-4 group/item"
        >
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-indigo-100 group-hover/item:bg-indigo-200 transition-colors"></div>
            )}

            {/* Timeline Dot/Icon */}
            <div className="relative z-10 flex-shrink-0 w-8 h-8 bg-white border-2 border-indigo-100 rounded-full flex items-center justify-center text-indigo-500 shadow-sm group-hover/item:border-indigo-400 group-hover/item:scale-110 group-hover/item:shadow-md transition-all duration-300">
                <Icon size={14} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">{activity.time}</span>
                        <h4 className="font-semibold text-gray-800 text-base">{activity.title}</h4>
                        {activity.cost && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                ${activity.cost}
                            </span>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex items-center gap-1 ml-2">
                            <button onClick={onMoveUp} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="上移">
                                <ArrowUp size={14} />
                            </button>
                            <button onClick={onMoveDown} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="下移">
                                <ArrowDown size={14} />
                            </button>
                            <button onClick={onEdit} className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="編輯">
                                <Pencil size={14} />
                            </button>
                            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="刪除">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    {activity.description}
                </p>

                {/* Tags/Tips */}
                {(activity.tips || activity.location) && (
                    <div className="mt-3 flex flex-col gap-2">
                        {activity.location && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-2.5 py-1.5 rounded-md border border-gray-200 w-fit hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                            >
                                <MapPin size={12} />
                                {activity.location}
                            </a>
                        )}
                        {activity.tips && (
                            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-100">
                                <Info size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                                <span className="leading-relaxed">{activity.tips}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit History */}
                {activity.modifiedBy && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-300 justify-end">
                        <Info size={10} />
                        <span>{activity.modifiedBy} 於 {activity.modifiedAt ? formatDistanceToNow(new Date(activity.modifiedAt), { addSuffix: true, locale: zhTW }) : '剛剛'} 更新</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
