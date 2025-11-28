import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Search } from 'lucide-react';

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

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    className?: string;
}

// Component to handle map clicks
const LocationMarker = ({ onSelect, position }: { onSelect: (lat: number, lng: number) => void, position: [number, number] | null }) => {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

// Component to update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

export default function LocationPicker({ initialLat, initialLng, onLocationSelect, className = "h-[300px] w-full rounded-xl overflow-hidden" }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : [37.7749, -122.4194] // Default to SF
    );

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
            setMapCenter([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    const handleSelect = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                setMapCenter([newLat, newLng]);
                // Optional: Auto-select the searched location
                // handleSelect(newLat, newLng); 
            } else {
                alert('找不到該地點，請嘗試其他關鍵字');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('搜尋失敗，請稍後再試');
        }
    };

    return (
        <div className="relative">
            <div className={className}>
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker onSelect={handleSelect} position={position} />
                    <MapUpdater center={mapCenter} />
                </MapContainer>
            </div>

            {/* Search Bar Overlay */}
            <form onSubmit={handleSearch} className="absolute top-2 left-2 right-2 z-[400]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="搜尋地點 (例如: Golden Gate Bridge)..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg shadow-md border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white/90 backdrop-blur-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </form>

            {/* Hint */}
            <div className="absolute bottom-2 left-2 right-2 z-[400] pointer-events-none">
                <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs text-gray-600 text-center border border-gray-200">
                    <MapPin className="inline-block w-3 h-3 mr-1 mb-0.5" />
                    點擊地圖以設定座標
                </div>
            </div>
        </div>
    );
}
