import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Trash2, Copy, ExternalLink, Calendar, MapPin, Download, Loader, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MyTripsPage = () => {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchTrips()
    }, [])

    const fetchTrips = async () => {
        try {
            const response = await axios.get('/api/user/trips')
            setTrips(response.data.trips)
        } catch (error) {
            console.error('Error fetching trips:', error)
            setError('Failed to load your trips. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTrip = async (e, tripId) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure you want to delete this trip?')) return

        try {
            await axios.delete(`/api/user/trips/${tripId}`)
            setTrips(trips.filter(trip => trip._id !== tripId))
        } catch (error) {
            console.error('Error deleting trip:', error)
            alert('Failed to delete trip.')
        }
    }

    const handleDuplicateTrip = async (e, trip) => {
        e.stopPropagation()
        try {
            const { _id, ...tripDataWithoutId } = trip
            const newTrip = { ...tripDataWithoutId, destination: `${trip.destination} (Copy)` }
            const response = await axios.post('/api/user/trips/save', { tripData: newTrip })
            fetchTrips() // reload all
            alert('Trip duplicated successfully!')
        } catch (error) {
            console.error('Error duplicating trip', error)
        }
    }

    const handleViewTrip = (trip) => {
        navigate('/dashboard', { state: { tripData: trip } })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--bg-primary)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader size={48} className="animate-spin text-[var(--primary)]" />
                    <p className="text-[var(--text-secondary)] font-medium">Loading your journeys...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <header className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border-b border-[var(--border-color)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-center sm:text-left">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold font-outfit tracking-tight mb-2">My <span className="text-[var(--primary)]">Trips</span></h1>
                        <p className="text-[var(--text-secondary)]">You have planned {trips.length} amazing journeys so far.</p>
                    </div>
                    <button onClick={() => navigate('/')} className="btn-primary px-8 py-3 rounded-full font-bold shadow-soft">
                        + Plan New Trip
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {trips.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center shadow-soft flex flex-col items-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mb-6 text-5xl">🌍</div>
                        <h3 className="text-2xl font-bold font-outfit mb-4">No trips saved yet</h3>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-md">Your AI-generated itineraries will appear here once you save them. Ready to explore the world?</p>
                        <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors font-bold">
                            Start Planning
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {trips.map(trip => (
                                <motion.div
                                    key={trip._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="glass-card rounded-2xl overflow-hidden shadow-soft group cursor-pointer border border-transparent hover:border-[var(--primary)]/30 transition-all flex flex-col"
                                    onClick={() => handleViewTrip(trip)}
                                >
                                    <div className="h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold font-outfit mb-1 truncate pr-2">{trip.destination}</h3>
                                                <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)] font-medium">
                                                    <Calendar size={12} /> {trip.days} Days · {trip.travelerType || 'Awesome'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={(e) => handleDuplicateTrip(e, trip)} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-colors" title="Duplicate">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={(e) => handleDeleteTrip(e, trip._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-[var(--border-color)]">
                                                <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase font-bold tracking-wider">Score</div>
                                                <div className="font-bold text-[var(--primary)]">{trip.travelScore}/100</div>
                                            </div>
                                            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-[var(--border-color)]">
                                                <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase font-bold tracking-wider">Safety</div>
                                                <div className="font-bold text-[var(--accent-sunset)]">{trip.safetyScore}/100</div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2 mb-3">Highlights</h4>
                                            <ul className="text-sm space-y-2">
                                                {trip.itinerary && trip.itinerary[0]?.activities?.slice(0, 3).map((act, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)] truncate">
                                                        <MapPin size={14} className="shrink-0 mt-0.5 text-[var(--primary)]" />
                                                        <span className="truncate">{act.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                                            <div className="font-bold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                                                ₹{trip.budget_breakdown?.total?.toLocaleString() || trip.budget?.total?.toLocaleString() || 'N/A'}
                                            </div>
                                            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors">
                                                View <ExternalLink size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyTripsPage
