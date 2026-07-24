import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

// Auto-fit bounds component
const FitBounds = ({ items }) => {
    const map = useMap()
    useEffect(() => {
        if (!items || items.length === 0) return
        const bounds = L.latLngBounds(items.map(item => [item.lat, item.lng]))
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
    }, [items, map])
    return null
}

const MapComponent = ({ destination, itinerary, locations = [] }) => {
    const [center, setCenter] = useState([20, 0]) // Default center
    const [markers, setMarkers] = useState(locations)

    useEffect(() => {
        // Build markers from itinerary if no custom locations provided
        if (itinerary && itinerary.length > 0 && locations.length === 0) {
            const allActivities = itinerary.flatMap(day => day.activities || [])
            const placesWithCoords = allActivities
                .filter(act => act?.coordinates && typeof act.coordinates.lat === 'number')
                .map(act => ({
                    lat: Number(act.coordinates.lat),
                    lng: Number(act.coordinates.lng),
                    title: act.title,
                    location: act.location,
                    rating: act.rating
                }))

            if (placesWithCoords.length > 0) {
                setMarkers(placesWithCoords)
                setCenter([placesWithCoords[0].lat, placesWithCoords[0].lng])
            }
        }
    }, [itinerary, locations])

    return (
        <div className="w-full h-full min-h-[300px] z-0 relative rounded-xl overflow-hidden">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker, index) => (
                    <Marker key={index} position={[marker.lat, marker.lng]}>
                        <Popup className="rounded-lg shadow-sm">
                            <div className="p-1">
                                <h4 className="font-bold font-outfit text-sm text-[var(--text-primary)]">{marker.title}</h4>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">{marker.location}</p>
                                {marker.rating && <span className="text-xs font-bold text-amber-500 mt-1 block">⭐ {marker.rating}</span>}
                                <a
                                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(marker.title || marker.location)}`}
                                    target="_blank" rel="noreferrer"
                                    className="text-xs text-[var(--primary)] hover:underline mt-2 inline-block font-medium"
                                >
                                    Get Directions (OSM)
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {markers.length > 0 && <FitBounds items={markers} />}
            </MapContainer>
        </div>
    )
}

export default MapComponent
