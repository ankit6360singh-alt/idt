import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import MapComponent from '../components/MapComponent'
import UserProfile from '../components/UserProfile'
import RahiChat from '../components/RahiChat'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis
} from 'recharts'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Map as MapIcon, Calendar, PieChart as PieChartIcon, MessageSquare,
    Download, Heart, NavArrowRight, MapPin, ExternalLink, Moon, Sun, CloudRain
} from 'lucide-react'

const Dashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [tripData, setTripData] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [activeTab, setActiveTab] = useState('itinerary')

    const exportRef = useRef(null)

    useEffect(() => {
        if (location.state?.tripData) {
            setTripData(location.state.tripData)
        } else {
            navigate('/')
        }
    }, [location, navigate])

    if (!tripData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black/5 dark:bg-black/40">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin"></div>
                    <p className="text-[var(--text-secondary)] font-medium">Loading your perfect trip...</p>
                </div>
            </div>
        )
    }

    const trip = tripData || {}
    const {
        itinerary = [],
        budget = { total: 0, accommodation: 0, food: 0, transport: 0, attractions: 0, miscellaneous: 0 },
        travelScore = 85,
        safetyScore = 90,
        weather = { temperature: '28°C', condition: 'Clear', humidity: '60%', windSpeed: '12km/h' },
        destination = 'Unknown'
    } = trip

    const handleSaveTrip = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/dashboard', state: { tripData } } } })
            return
        }
        setIsSaving(true)
        try {
            await axios.post('/api/user/trips/save', { tripData })
            setSaved(true)
        } catch (error) {
            console.error('Error saving trip:', error)
            alert('Failed to save trip. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleExportPDF = async () => {
        if (!exportRef.current) return
        setIsExporting(true)

        try {
            // A simple temporary style injection for reliable rendering
            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`TRAVLO_${destination.replace(/\s+/g, '_')}_Itinerary.pdf`)
        } catch (error) {
            console.error('PDF Export error:', error)
            alert('Failed to export PDF.')
        } finally {
            setIsExporting(false)
        }
    }

    const openMaps = (locationName) => {
        const query = encodeURIComponent(locationName)
        window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank')
    }

    const budgetData = [
        { name: 'Accommodation', value: budget.accommodation, color: '#4A90E2' },
        { name: 'Food', value: budget.food, color: '#50C9CE' },
        { name: 'Transport', value: budget.transport, color: '#FF6B6B' },
        { name: 'Attractions', value: budget.attractions, color: '#FFD93D' },
        { name: 'Misc', value: budget.miscellaneous, color: '#8884d8' }
    ]

    const scoreData = [
        { name: 'Travel', score: travelScore, color: '#4A90E2' },
        { name: 'Safety', score: safetyScore, color: '#50C9CE' }
    ]

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--primary)] selection:text-white">

            {/* Header */}
            <header className="sticky top-0 z-50 glass-header border-b border-[var(--border-color)]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold">T</div>
                        <span className="font-outfit font-bold tracking-tight text-xl">TRAVLO <span className="text-[var(--primary)] text-sm">AI</span></span>
                    </div>

                    <div className="flex flex-1 justify-center gap-2">
                        {['itinerary', 'map', 'budget', 'assistant'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                                    ${activeTab === tab ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md'
                                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'}`}
                            >
                                {tab === 'itinerary' && <Calendar size={16} />}
                                {tab === 'map' && <MapIcon size={16} />}
                                {tab === 'budget' && <PieChartIcon size={16} />}
                                {tab === 'assistant' && <MessageSquare size={16} />}
                                <span className="hidden sm:inline capitalize">{tab}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {!saved && (
                            <button onClick={handleSaveTrip} disabled={isSaving}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all text-sm font-medium">
                                <Heart size={16} />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        )}
                        <UserProfile />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Hero Summary */}
                <div className="mb-8 rounded-3xl p-6 sm:p-10 relative overflow-hidden glass-card shadow-soft"
                    style={{ background: 'linear-gradient(135deg, rgba(74,144,226,0.05), rgba(80,201,206,0.05))' }}>
                    <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                        <MapIcon size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--primary)] text-white mb-4">
                                {trip.travelerType || 'Awesome'} Trip
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-bold font-outfit tracking-tight mb-2">
                                Journey to <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">{destination}</span>
                            </h1>
                            <p className="text-[var(--text-secondary)] flex items-center gap-3">
                                <Calendar size={16} /> {trip.days} Days
                                <span className="opacity-40">|</span>
                                <PieChartIcon size={16} /> Total Budget: ₹{(budget.total || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleExportPDF} disabled={isExporting} className="btn-primary rounded-full px-6 py-2.5 text-sm font-medium flex gap-2 items-center">
                                <Download size={16} /> {isExporting ? 'Exporting...' : 'Export PDF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-8 relative min-h-[500px]">
                    <AnimatePresence mode="wait">

                        {activeTab === 'itinerary' && (
                            <motion.div key="itinerary"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                className="grid lg:grid-cols-[1fr,320px] gap-8">

                                {/* Printable Area */}
                                <div ref={exportRef} className="space-y-6 bg-[var(--bg-primary)] rounded-xl p-1">
                                    {itinerary.length > 0 ? itinerary.map((day, ix) => (
                                        <div key={day.day || ix} className="glass-card rounded-2xl p-6 shadow-soft relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] opacity-80" />

                                            <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[#FF6B6B]">
                                                        Day {day.day} - {day.date}
                                                    </h3>
                                                    <p className="text-[var(--text-secondary)] font-medium mt-1">{day.theme}</p>
                                                </div>
                                                <div className="text-right text-xs space-y-1">
                                                    <span className="block px-2 py-1 rounded-md bg-[rgba(80,201,206,0.1)] text-[var(--secondary)]">Budget: ₹{day.dayBudget}</span>
                                                    {day.weather && <span className="block px-2 py-1 rounded-md bg-[rgba(74,144,226,0.1)] text-[var(--primary)]">{day.weather.temp}</span>}
                                                </div>
                                            </div>

                                            <div className="space-y-5 relative">
                                                {/* Timeline line */}
                                                <div className="absolute left-[31px] top-2 bottom-4 w-px bg-gradient-to-b from-[var(--border-color)] to-transparent hidden sm:block"></div>

                                                {day.activities?.map((activity, actIx) => (
                                                    <div key={actIx} className="flex gap-4 sm:gap-6 relative group/act">
                                                        <div className="hidden sm:flex flex-col items-center pt-1 z-10 bg-[var(--card-surface)]">
                                                            <div className="w-16 text-right text-xs font-semibold text-[var(--primary)] pt-0.5">{activity.time}</div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] ring-4 ring-[var(--card-surface)] my-2"></div>
                                                        </div>

                                                        <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-4 transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                                                            <div className="sm:hidden text-xs font-semibold text-[var(--primary)] mb-1">{activity.time}</div>
                                                            <div className="flex justify-between items-start gap-4">
                                                                <h4 className="font-bold text-[var(--text-primary)]">{activity.title}</h4>
                                                                {activity.rating && <span className="text-xs font-bold text-amber-500 shrink-0 flex items-center gap-1">★ {activity.rating}</span>}
                                                            </div>
                                                            <p className="text-sm text-[var(--text-secondary)] mt-1.5">{activity.description}</p>

                                                            <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium">
                                                                <button onClick={() => openMaps(activity.location)}
                                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors border border-[var(--border-color)]">
                                                                    <MapPin size={12} /> {activity.location} <ExternalLink size={10} className="ml-1 opacity-50" />
                                                                </button>
                                                                {activity.cost && (
                                                                    <span className="flex items-center px-2.5 py-1 rounded-lg bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                                        ₹{activity.cost}
                                                                    </span>
                                                                )}
                                                                {activity.duration && (
                                                                    <span className="flex items-center px-2.5 py-1 rounded-lg bg-[var(--card-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                                        {activity.duration}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {activity.tips && (
                                                                <div className="mt-3 p-2.5 rounded-lg bg-[rgba(255,217,61,0.1)] border border-[rgba(255,217,61,0.2)] text-xs text-amber-600 dark:text-amber-400">
                                                                    <strong className="mr-1">Tip:</strong>{activity.tips}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Daily Tips Footer */}
                                            <div className="mt-6 pt-4 border-t border-[var(--border-color)] grid sm:grid-cols-2 gap-4 text-xs">
                                                {day.packingTip && (
                                                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                                                        <span className="text-[var(--primary)] shrink-0">🧳</span>
                                                        <p>{day.packingTip}</p>
                                                    </div>
                                                )}
                                                {day.safetyTip && (
                                                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                                                        <span className="text-[var(--accent-sunset)] shrink-0">🛡️</span>
                                                        <p>{day.safetyTip}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-[var(--text-secondary)] glass-card rounded-2xl">
                                            No itinerary data available.
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Stats */}
                                <div className="space-y-6">
                                    <div className="glass-card rounded-2xl p-5 shadow-soft">
                                        <h3 className="font-bold font-outfit mb-4">Quick Weather</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">{weather.condition?.toLowerCase().includes('rain') ? '🌧️' : '☀️'}</div>
                                            <div>
                                                <div className="text-2xl font-bold">{weather.temperature || 'N/A'}</div>
                                                <div className="text-sm text-[var(--text-secondary)]">{weather.condition || 'Clear'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-card rounded-2xl p-5 shadow-soft">
                                        <h3 className="font-bold font-outfit mb-4">Trip Scores</h3>
                                        <div className="space-y-4">
                                            {scoreData.map(s => (
                                                <div key={s.name}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>{s.name}</span>
                                                        <span className="font-bold" style={{ color: s.color }}>{s.score}/100</span>
                                                    </div>
                                                    <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {trip.safetyTips?.length > 0 && (
                                        <div className="glass-card rounded-2xl p-5 shadow-soft bg-amber-500/5 border-amber-500/20">
                                            <h3 className="font-bold font-outfit mb-3 text-amber-600 dark:text-amber-400">Essential Tips</h3>
                                            <ul className="text-sm space-y-2 text-[var(--text-secondary)]">
                                                {trip.safetyTips.slice(0, 3).map((tip, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="text-amber-500">•</span> {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'map' && (
                            <motion.div key="map"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                className="h-[600px] w-full rounded-2xl overflow-hidden glass-card shadow-soft p-1">
                                <MapComponent destination={destination} itinerary={itinerary} />
                            </motion.div>
                        )}

                        {activeTab === 'budget' && (
                            <motion.div key="budget"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                className="grid md:grid-cols-2 gap-8">
                                <div className="glass-card rounded-2xl p-8 shadow-soft">
                                    <h3 className="font-bold font-outfit text-xl mb-6">Budget Overview</h3>
                                    <div className="h-64 mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={budgetData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                                    {budgetData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => `₹${value}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4">
                                        {budgetData.map(item => (
                                            <div key={item.name} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                                                    <span className="text-[var(--text-secondary)]">{item.name}</span>
                                                </div>
                                                <span className="font-bold">₹{(item.value || 0).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {itinerary.map(day => (
                                        <div key={day.day} className="glass-card rounded-xl p-5 shadow-soft flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-sm">Day {day.day}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{day.date}</div>
                                            </div>
                                            <div className="font-bold font-outfit text-[var(--primary)]">
                                                ₹{(day.dayBudget || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'assistant' && (
                            <motion.div key="assistant"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                                className="h-[600px] w-full max-w-3xl mx-auto rounded-2xl overflow-hidden glass-card shadow-soft">
                                <RahiChat tripContext={trip} />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
