import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import axios from 'axios'
import { Search, Navigation, MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix generic map marker for Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

// Custom controls component to handle map movement
const MapController = ({ center }) => {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 1.5 })
        }
    }, [center, map])
    return null
}

const MapPage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [center, setCenter] = useState([28.6139, 77.2090]) // Default New Delhi
    const [markers, setMarkers] = useState([])
    const [activeFilter, setActiveFilter] = useState('All')
    const filters = ['All', 'Attractions', 'Hotels', 'Restaurants']

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            const res = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: { q: searchQuery, format: 'json', limit: 1 },
                headers: { 'User-Agent': 'TRAVLO-AI/1.0' }
            })

            if (res.data && res.data.length > 0) {
                const { lat, lon, display_name } = res.data[0]
                setCenter([parseFloat(lat), parseFloat(lon)])

                // Set one primary marker for the search result
                setMarkers([{
                    lat: parseFloat(lat),
                    lng: parseFloat(lon),
                    title: display_name.split(',')[0],
                    desc: display_name,
                    type: 'Location'
                }])
            } else {
                alert('Location not found. Try a different search.')
            }
        } catch (error) {
            console.error('Geocoding error:', error)
            alert('Failed to search location.')
        } finally {
            setIsSearching(false)
        }
    }

    // Attempt to get user's current location
    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setCenter([latitude, longitude])
                    setMarkers([{
                        lat: latitude, lng: longitude,
                        title: 'Your Location', desc: 'Current GPS coordinates', type: 'User'
                    }])
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    alert('Unable to retrieve your location.')
                }
            )
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[var(--bg-primary)]">
            {/* Toolbar */}
            <div className="bg-[var(--card-surface)] border-b border-[var(--border-color)] p-4 shadow-sm z-10 shrink-0">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">

                    <form onSubmit={handleSearch} className="relative w-full sm:w-96 flex">
                        <input
                            type="text"
                            placeholder="Search places, cities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-l-xl focus:outline-none focus:border-[var(--primary)]"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <button
                            type="submit" disabled={isSearching}
                            className="bg-[var(--primary)] text-white px-4 py-2 rounded-r-xl font-medium sm:px-6 hover:opacity-90 disabled:opacity-50"
                        >
                            {isSearching ? '...' : 'Go'}
                        </button>
                    </form>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                                    ${activeFilter === filter
                                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button onClick={handleLocateMe} className="ml-auto sm:ml-2 p-2 rounded-full border border-[var(--border-color)] text-[var(--primary)] hover:bg-[rgba(74,144,226,0.1)] transition-colors" title="My Location">
                            <Navigation size={18} />
                        </button>
                    </div>

                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapController center={center} />

                    {markers.map((marker, i) => (
                        <Marker key={i} position={[marker.lat, marker.lng]}>
                            <Popup className="rounded-lg shadow-soft font-sans">
                                <div>
                                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{marker.title}</h4>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">{marker.desc}</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[10px] uppercase font-bold tracking-wide">
                                        {marker.type}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    )
}

export default MapPage
