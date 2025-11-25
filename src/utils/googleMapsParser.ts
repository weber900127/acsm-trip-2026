/**
 * Extracts latitude and longitude from a Google Maps URL.
 * Supports various formats:
 * - Standard: https://www.google.com/maps/place/.../@37.7749,-122.4194,15z
 * - Search: https://www.google.com/maps/search/?api=1&query=37.7749,-122.4194
 * - Short/Share: https://maps.app.goo.gl/... (requires expansion, but we can try to parse if it redirects or if user pastes full link)
 * - Embed/Old: !3d37.7749!4d-122.4194
 */
export function parseCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
    try {
        const decodedUrl = decodeURIComponent(url);

        // 1. Look for @lat,lng
        // Example: .../place/San+Francisco/@37.7749295,-122.4194155,15z/...
        const atMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
            return {
                lat: parseFloat(atMatch[1]),
                lng: parseFloat(atMatch[2])
            };
        }

        // 2. Look for query param q=lat,lng or query=lat,lng
        // Example: ...?q=37.7749,-122.4194
        const queryMatch = decodedUrl.match(/[?&](?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (queryMatch) {
            return {
                lat: parseFloat(queryMatch[1]),
                lng: parseFloat(queryMatch[2])
            };
        }

        // 3. Look for ll=lat,lng (older format)
        const llMatch = decodedUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (llMatch) {
            return {
                lat: parseFloat(llMatch[1]),
                lng: parseFloat(llMatch[2])
            };
        }

        // 4. Look for embed code format !3dlat!4dlng
        // Example: ...!3d37.7749!4d-122.4194...
        const embedMatch = decodedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (embedMatch) {
            return {
                lat: parseFloat(embedMatch[1]),
                lng: parseFloat(embedMatch[2])
            };
        }

        return null;
    } catch (error) {
        console.error("Error parsing Google Maps URL:", error);
        return null;
    }
}
