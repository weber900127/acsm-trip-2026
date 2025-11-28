import { useState, useEffect } from 'react';
import { WeatherInfo, CITY_WEATHER } from '../data/weather';
import { fetchWeather } from '../lib/weather';

export function useWeather(city: string) {
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadWeather = async () => {
            setLoading(true);
            setError(null);

            // First, try to fetch real weather
            const data = await fetchWeather(city);

            if (isMounted) {
                if (data) {
                    setWeather(data);
                } else {
                    // Fallback to static data if API fails or city not found
                    console.warn(`Weather API failed for ${city}, using static data.`);
                    setWeather(CITY_WEATHER[city] || null);
                }
                setLoading(false);
            }
        };

        loadWeather();

        return () => {
            isMounted = false;
        };
    }, [city]);

    return { weather, loading, error };
}
