import {
    MapPin, Info, Pencil, Trash2,
    Plane, Coffee, Camera, Train, Car, Sun, Moon, Briefcase, Utensils, CheckSquare,
    Link as LinkIcon
} from 'lucide-react';
import { Activity } from '../../data/itinerary';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface ActivityItemProps {
    id?: string;
    activity: Activity;
    isLast: boolean;
    isEditing?: boolean;
    isHighlighted?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onFocus?: (id: string) => void;
}

export default function ActivityItem({
    id,
    activity,
    isLast,
    isEditing,
    isHighlighted,
    onEdit,
    onDelete,
    onFocus
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
            className={`relative flex gap-4 group/item p-3 rounded-xl transition-colors duration-300 ${isHighlighted ? 'bg-yellow-50 ring-1 ring-yellow-200' : 'hover:bg-gray-50'}`}
            onViewportEnter={() => {
                if (id && onFocus) {
                    onFocus(id);
                }
            }}
            viewport={{ amount: 0.2, margin: "-10% 0px -40% 0px" }}
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

                {/* Attachments */}
                {activity.attachments && activity.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {activity.attachments.map(att => (
                            att.type === 'image' ? (
                                <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors relative group/img"
                                >
                                    <img src={att.url} alt={att.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                                </a>
                            ) : (
                                <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                    <LinkIcon size={12} />
                                    {att.label || '連結'}
                                </a>
                            )
                        ))}
                    </div>
                )}

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
                            </a >
                        )}
                        {
                            activity.tips && (
                                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                    <Info size={14} className="mt-0.5 flex-shrink-0" />
                                    <span className="leading-relaxed">{activity.tips}</span>
                                </div>
                            )
                        }
                    </div >
                )}

                {/* Metadata */}
                {
                    activity.modifiedBy && (
                        <div className="mt-2 flex justify-end">
                            <span className="text-[10px] text-gray-300">
                                Updated by {activity.modifiedBy.split('@')[0]} • {activity.modifiedAt ? formatDistanceToNow(new Date(activity.modifiedAt), { addSuffix: true, locale: zhTW }) : ''}
                            </span>
                        </div>
                    )
                }
            </div >
        </motion.div >
    );
}
