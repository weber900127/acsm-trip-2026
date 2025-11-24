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
            className="bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
            <div className="flex items-center gap-3 min-w-[140px]">
                <div className="p-2.5 bg-sky-100 text-sky-600 rounded-full">
                    <Icon size={24} />
                </div>
                <div>
                    <div className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-0.5">Weather</div>
                    <div className="font-bold text-gray-800 text-lg">{info.tempRange}</div>
                </div>
            </div>

            <div className="w-px h-10 bg-sky-100 hidden sm:block"></div>

            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Thermometer size={16} className="text-sky-400" />
                    <span>{info.description}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed">
                    <Shirt size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
                    <span>{info.clothing}</span>
                </div>
            </div>
        </motion.div>
    );
}
