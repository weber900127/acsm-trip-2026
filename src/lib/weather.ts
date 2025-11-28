import { WeatherInfo } from '../data/weather';

export const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
    'SF': { lat: 37.7749, lon: -122.4194 },
    'SLC': { lat: 40.7608, lon: -111.8910 },
    'SAN': { lat: 32.7157, lon: -117.1611 },
    'LA': { lat: 34.0522, lon: -118.2437 },
};

// WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
const getWeatherDescription = (code: number): { description: string; icon: string } => {
    switch (code) {
        case 0: return { description: '晴朗無雲', icon: 'sun' };
        case 1:
        case 2:
        case 3: return { description: '多雲時晴', icon: 'cloud-sun' };
        case 45:
        case 48: return { description: '有霧', icon: 'fog' };
        case 51:
        case 53:
        case 55: return { description: '毛毛雨', icon: 'rain' }; // Need to ensure 'rain' icon exists or map to closest
        case 61:
        case 63:
        case 65: return { description: '下雨', icon: 'rain' };
        case 71:
        case 73:
        case 75: return { description: '下雪', icon: 'snow' }; // Need to ensure 'snow' icon exists
        case 80:
        case 81:
        case 82: return { description: '陣雨', icon: 'rain' };
        case 95:
        case 96:
        case 99: return { description: '雷雨', icon: 'rain' };
        default: return { description: '多雲', icon: 'cloud-sun' };
    }
};

const getClothingSuggestion = (minTemp: number, maxTemp: number): string => {
    const avgTemp = (minTemp + maxTemp) / 2;

    if (avgTemp < 10) {
        return '天氣寒冷，請穿著厚外套、圍巾，注意保暖。';
    } else if (avgTemp < 15) {
        return '早晚偏冷，建議洋蔥式穿搭，必備防風或薄羽絨外套。';
    } else if (avgTemp < 20) {
        return '氣候舒適，穿著長袖或短袖搭配薄外套即可。';
    } else if (avgTemp < 25) {
        return '溫暖宜人，短袖衣物為主，早晚可加件薄衫。';
    } else {
        return '天氣炎熱，請穿著透氣衣物，注意防曬與補充水分。';
    }
};

export const fetchWeather = async (city: string): Promise<WeatherInfo | null> => {
    const coords = CITY_COORDINATES[city];
    if (!coords) return null;

    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await response.json();

        const current = data.current;
        const daily = data.daily;

        // Get today's min/max (index 0)
        const minTemp = Math.round(daily.temperature_2m_min[0]);
        const maxTemp = Math.round(daily.temperature_2m_max[0]);
        const currentTemp = Math.round(current.temperature_2m);

        const weatherDesc = getWeatherDescription(current.weather_code);
        const clothing = getClothingSuggestion(minTemp, maxTemp);

        return {
            tempRange: `${minTemp}°C - ${maxTemp}°C (目前 ${currentTemp}°C)`,
            description: weatherDesc.description,
            clothing: clothing,
            icon: weatherDesc.icon
        };
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
};
