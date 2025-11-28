import { CloudSun, Sun, CloudFog, Shirt, Thermometer } from 'lucide-react';
import { WeatherInfo } from '../../data/weather';
import { motion } from 'framer-motion';

interface WeatherCardProps {
    city: string;
    info: WeatherInfo;
}

export default function WeatherCard({ info }: WeatherCardProps) {
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'fog': return CloudFog;
            case 'sun': return Sun;
            case 'cloud-sun': return CloudSun;
            default: return Sun;
        }
    };

    const Icon = getIcon(info.icon);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="sticker p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden"
        >
            <div className="flex items-center gap-3 min-w-[140px] relative z-10">
                <div className="p-2.5 bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                    <Icon size={24} />
                </div>
                <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5 font-sans">Weather</div>
                    <div className="font-bold text-gray-800 text-lg font-heading">{info.tempRange}</div>
                </div>
            </div>

            <div className="w-px h-10 bg-gray-200 hidden sm:block relative z-10 border-r border-dashed border-gray-300"></div>

            <div className="flex-1 space-y-1 relative z-10">
                <div className="flex items-center gap-2 text-gray-800 font-medium font-hand text-lg">
                    <Thermometer size={16} className="text-gray-400" />
                    <span>{info.description}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed font-sans">
                    <Shirt size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{info.clothing}</span>
                </div>
            </div>
        </motion.div>
    );
}
