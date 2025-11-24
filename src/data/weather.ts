export interface WeatherInfo {
    tempRange: string;
    description: string;
    clothing: string;
    icon: string; // Emoji or Lucide icon name
}

export const CITY_WEATHER: Record<string, WeatherInfo> = {
    'SF': {
        tempRange: '11°C - 18°C',
        description: '涼爽多霧，早晚溫差大',
        clothing: '洋蔥式穿搭。必備防風外套、薄羽絨，中午可穿短袖。',
        icon: 'fog'
    },
    'SLC': {
        tempRange: '10°C - 24°C',
        description: '乾燥舒適，日照強烈',
        clothing: '白天溫暖可穿短袖，但早晚偏涼需薄外套。注意保濕與防曬。',
        icon: 'sun'
    },
    'SAN': {
        tempRange: '16°C - 22°C',
        description: '舒適宜人，海風涼爽',
        clothing: '標準加州陽光穿搭。短袖、薄襯衫，晚上海邊較涼需備外套。',
        icon: 'cloud-sun'
    },
    'LA': {
        tempRange: '16°C - 24°C',
        description: '溫暖乾燥，陽光充足',
        clothing: '夏裝為主。墨鏡、帽子必備，早晚加件薄外套即可。',
        icon: 'sun'
    }
};
