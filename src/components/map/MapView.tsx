import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Activity } from '../../data/itinerary';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
    activities: Activity[];
    className?: string;
}

// Component to update map view bounds based on markers
const BoundsUpdater: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
    const map = useMap();

    useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coords, map]);

    return null;
};

import { generateGeodesicCurve, getDistance } from '../../utils/geodesic';

// ... imports

export const MapView: React.FC<MapViewProps> = ({ activities, className = "h-[300px] w-full rounded-xl overflow-hidden" }) => {
    // Filter activities with coordinates
    const validActivities = activities.filter(a => a.coordinates);

    // Calculate path coordinates with geodesic curves for long distances
    const pathCoordinates: [number, number][] = [];
    if (validActivities.length > 0) {
        const first = validActivities[0].coordinates!;
        pathCoordinates.push([first.lat, first.lng]);

        for (let i = 0; i < validActivities.length - 1; i++) {
            const start = validActivities[i].coordinates!;
            const end = validActivities[i + 1].coordinates!;

            const dist = getDistance(start.lat, start.lng, end.lat, end.lng);

            // Use geodesic curve for distances > 500km
            if (dist > 500) {
                const curve = generateGeodesicCurve(
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                );
                // Skip the first point as it's already in the array
                pathCoordinates.push(...curve.slice(1));
            } else {
                pathCoordinates.push([end.lat, end.lng]);
            }
        }
    }

    if (validActivities.length === 0) {
        return (
            <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400 flex-col gap-2`}>
                <MapPin className="w-8 h-8 opacity-50" />
                <span className="text-sm">本行程尚無座標資料</span>
            </div>
        );
    }

    // Calculate center (default to first point or SF)
    const center: [number, number] = validActivities.length > 0
        ? [validActivities[0].coordinates!.lat, validActivities[0].coordinates!.lng]
        : [37.7749, -122.4194];

    return (
        <div className={className}>
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validActivities.map((activity, index) => (
                    <Marker
                        key={index}
                        position={[activity.coordinates!.lat, activity.coordinates!.lng]}
                    >
                        <Popup>
                            <div className="font-sans">
                                <div className="font-bold text-indigo-600">{activity.time}</div>
                                <div className="font-medium">{activity.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{activity.location}</div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${activity.coordinates!.lat},${activity.coordinates!.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-500 mt-2 hover:underline"
                                >
                                    <Navigation className="w-3 h-3" />
                                    Google Maps 導航
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {pathCoordinates.length > 1 && (
                    <Polyline
                        positions={pathCoordinates}
                        color="#4f46e5"
                        weight={3}
                        opacity={0.7}
                        dashArray="5, 10"
                    />
                )}

                <BoundsUpdater coords={pathCoordinates} />
            </MapContainer>
        </div>
    );
};
