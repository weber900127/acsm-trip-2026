/**
 * Calculates the distance between two coordinates in kilometers.
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

function toDeg(rad: number): number {
    return rad * (180 / Math.PI);
}

/**
 * Generates intermediate points along a Great Circle path between two coordinates.
 * Handles the International Date Line by normalizing longitudes.
 */
export function generateGeodesicCurve(
    start: [number, number],
    end: [number, number],
    numPoints: number = 100
): [number, number][] {
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;

    // Calculate total distance
    const d = getDistance(lat1, lng1, lat2, lng2);

    // If distance is small, just return start and end
    if (d < 500) {
        return [start, end];
    }

    const points: [number, number][] = [];
    const f1 = toRad(lat1);
    const l1 = toRad(lng1);
    const f2 = toRad(lat2);
    const l2 = toRad(lng2);

    // Angular distance
    const delta = 2 * Math.asin(Math.sqrt(
        Math.pow(Math.sin((f1 - f2) / 2), 2) +
        Math.cos(f1) * Math.cos(f2) * Math.pow(Math.sin((l1 - l2) / 2), 2)
    ));

    let prevLng = start[1];

    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;
        const a = Math.sin((1 - f) * delta) / Math.sin(delta);
        const b = Math.sin(f * delta) / Math.sin(delta);

        const x = a * Math.cos(f1) * Math.cos(l1) + b * Math.cos(f2) * Math.cos(l2);
        const y = a * Math.cos(f1) * Math.sin(l1) + b * Math.cos(f2) * Math.sin(l2);
        const z = a * Math.sin(f1) + b * Math.sin(f2);

        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        let lng = Math.atan2(y, x);

        let lngDeg = toDeg(lng);

        // Handle Date Line crossing for rendering (make longitude continuous)
        // If we jump from e.g. 179 to -179, the difference is -358. We want +2.
        // So we add 360.
        const diff = lngDeg - prevLng;
        if (diff < -180) {
            lngDeg += 360;
        } else if (diff > 180) {
            lngDeg -= 360;
        }

        points.push([toDeg(lat), lngDeg]);
        prevLng = lngDeg;
    }

    return points;
}
