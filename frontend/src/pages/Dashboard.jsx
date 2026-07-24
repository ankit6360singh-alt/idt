import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import MapComponent from '../components/MapComponent'
import UserProfile from '../components/UserProfile'
import RahiChat from '../components/RahiChat'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Map as MapIcon, Calendar, PieChart as PieChartIcon, MessageSquare,
    Download, Heart, MapPin, ExternalLink, ArrowLeft, Sparkles,
    CloudSun, Wind, Droplets, ShieldCheck, Star, Clock, Wallet
} from 'lucide-react'

// ── COLOUR TOKENS (light, always) ──────────────────────────────────────────
const C = {
    bg: '#F7F8FA',
    surface: '#FFFFFF',
    border: '#ECEEF2',
    text: '#0F172A',
    muted: '#64748B',
    amber: '#F5C518',
    amberLight: '#FFFBEB',
    amberBorder: '#FDE68A',
    teal: '#0D9488',
    blue: '#3B82F6',
    red: '#EF4444',
    purple: '#8B5CF6',
    green: '#10B981',
}

const TAG = ({ children, color = C.amber, bg = C.amberLight, border = C.amberBorder }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 10px', borderRadius: '100px',
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px',
        background: bg, color, border: `1px solid ${border}`,
    }}>{children}</span>
)

const ScoreBar = ({ label, score, color }) => (
    <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color }}>{score}/100</span>
        </div>
        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: color, borderRadius: '100px' }}
            />
        </div>
    </div>
)

const SideCard = ({ title, icon, children }) => (
    <div style={{
        background: C.surface, borderRadius: '16px', padding: '20px',
        border: `1px solid ${C.border}`, marginBottom: '16px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: C.amber }}>{icon}</span>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: C.text, fontFamily: 'Syne, sans-serif' }}>{title}</h3>
        </div>
        {children}
    </div>
)

const TabBtn = ({ id, label, icon, active, onClick }) => (
    <button onClick={() => onClick(id)} style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '8px 18px', borderRadius: '100px',
        fontSize: '13px', fontWeight: 700,
        border: 'none', cursor: 'pointer',
        background: active ? C.text : 'transparent',
        color: active ? C.amber : C.muted,
        transition: 'all 0.2s ease',
        fontFamily: 'Syne, sans-serif',
    }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.border }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
        {icon} <span className="hidden sm:inline">{label}</span>
    </button>
)

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
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        border: `4px solid ${C.amberBorder}`, borderTopColor: C.amber,
                        animation: 'spin 0.9s linear infinite', margin: '0 auto 16px',
                    }} />
                    <p style={{ color: C.muted, fontWeight: 600 }}>Building your perfect trip...</p>
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
        } finally {
            setIsSaving(false)
        }
    }

    const handleExportPDF = async () => {
        if (!exportRef.current) return
        setIsExporting(true)
        try {
            const canvas = await html2canvas(exportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`TRAVLO_${destination.replace(/\s+/g, '_')}_Itinerary.pdf`)
        } catch (error) {
            console.error('PDF Export error:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const openMaps = (loc) => {
        window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(loc)}`, '_blank')
    }

    const budgetData = [
        { name: 'Stay', value: budget.accommodation, color: C.blue },
        { name: 'Food', value: budget.food, color: C.teal },
        { name: 'Transport', value: budget.transport, color: C.red },
        { name: 'Activities', value: budget.attractions, color: C.amber },
        { name: 'Misc', value: budget.miscellaneous, color: C.purple },
    ]

    const weatherIcon = weather.condition?.toLowerCase().includes('rain') ? '🌧️'
        : weather.condition?.toLowerCase().includes('cloud') ? '⛅' : '☀️'

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>

            {/* ── TOP NAV ──────────────────────────────────────────────────── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(16px)',
                borderBottom: `1px solid ${C.border}`,
                padding: '0 24px', height: '60px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
            }}>
                {/* Logo + Back */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/')}
                        style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: C.bg, border: `1px solid ${C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: C.muted, transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.text; e.currentTarget.style.color = C.amber }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.muted }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: C.text }}>
                        TRAVLO <span style={{ fontSize: '9px', fontWeight: 700, background: C.text, color: C.amber, padding: '2px 6px', borderRadius: '100px' }}>AI</span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: C.bg, borderRadius: '100px', padding: '4px', border: `1px solid ${C.border}` }}>
                    <TabBtn id="itinerary" label="Itinerary" icon={<Calendar size={14} />} active={activeTab === 'itinerary'} onClick={setActiveTab} />
                    <TabBtn id="map" label="Map" icon={<MapIcon size={14} />} active={activeTab === 'map'} onClick={setActiveTab} />
                    <TabBtn id="budget" label="Budget" icon={<PieChartIcon size={14} />} active={activeTab === 'budget'} onClick={setActiveTab} />
                    <TabBtn id="assistant" label="AI Chat" icon={<MessageSquare size={14} />} active={activeTab === 'assistant'} onClick={setActiveTab} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!saved && (
                        <button onClick={handleSaveTrip} disabled={isSaving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', borderRadius: '100px',
                                background: 'transparent',
                                border: `2px solid ${C.border}`,
                                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                color: C.text, transition: 'all 0.2s',
                                fontFamily: 'Syne, sans-serif',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.text }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border }}>
                            <Heart size={14} /> {isSaving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                        </button>
                    )}
                    <button onClick={handleExportPDF} disabled={isExporting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 18px', borderRadius: '100px',
                            background: C.text, color: C.amber,
                            border: 'none', fontSize: '13px', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.2s',
                            fontFamily: 'Syne, sans-serif',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        }}>
                        <Download size={14} /> {isExporting ? 'Exporting…' : 'Export PDF'}
                    </button>
                    <UserProfile />
                </div>
            </header>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 60px' }}>

                {/* ── HERO BANNER ────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: C.text,
                        borderRadius: '24px',
                        padding: '32px 36px',
                        marginBottom: '24px',
                        position: 'relative', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '20px',
                    }}>
                    {/* BG decoration */}
                    <div style={{
                        position: 'absolute', right: '-20px', top: '-20px',
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: 'rgba(245,197,24,0.08)', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', right: '60px', bottom: '-40px',
                        width: '150px', height: '150px', borderRadius: '50%',
                        background: 'rgba(245,197,24,0.05)', pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <TAG>{(trip.travelerType || 'SOLO').toUpperCase()} TRIP</TAG>
                        <h1 style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: 800,
                            fontSize: 'clamp(28px, 4vw, 44px)',
                            color: '#FFFFFF', letterSpacing: '-1px',
                            margin: '10px 0 8px', lineHeight: 1.1,
                        }}>
                            Journey to <span style={{ color: C.amber }}>{destination}</span>
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                <Calendar size={14} /> {trip.days} Days
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                <Wallet size={14} /> Total Budget: ₹{(budget.total || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Quick weather pill */}
                    <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '16px 24px',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        position: 'relative', zIndex: 1,
                    }}>
                        <span style={{ fontSize: '36px' }}>{weatherIcon}</span>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                                {weather.temperature || '28°C'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                {weather.condition || 'Clear'}
                            </div>
                        </div>
                        {weather.humidity && (
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                    <Droplets size={11} /> {weather.humidity}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Wind size={11} /> {weather.windSpeed}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── TAB CONTENT ────────────────────────────────────────────── */}
                <AnimatePresence mode="wait">

                    {/* ── ITINERARY TAB ──────────────────────────────────────── */}
                    {activeTab === 'itinerary' && (
                        <motion.div key="itinerary"
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

                            {/* Left: Day cards */}
                            <div ref={exportRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {itinerary.length > 0 ? itinerary.map((day, ix) => (
                                    <motion.div
                                        key={day.day || ix}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: ix * 0.07 }}
                                        style={{
                                            background: C.surface, borderRadius: '20px',
                                            border: `1px solid ${C.border}`,
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                        }}>
                                        {/* Day header */}
                                        <div style={{
                                            padding: '20px 24px 16px',
                                            borderBottom: `1px solid ${C.border}`,
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
                                            background: `linear-gradient(to right, ${C.amberLight}, ${C.surface})`,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: C.amber,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px',
                                                    color: C.text, flexShrink: 0,
                                                }}>
                                                    {day.day}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px', color: C.text, margin: 0 }}>
                                                        {day.date}
                                                    </h3>
                                                    <p style={{ fontSize: '12px', color: C.muted, fontWeight: 600, margin: '2px 0 0' }}>
                                                        {day.theme}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {day.dayBudget && (
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '100px',
                                                        background: '#F0FDF4', color: '#16A34A',
                                                        border: '1px solid #BBF7D0',
                                                        fontSize: '12px', fontWeight: 700,
                                                    }}>
                                                        ₹{Number(day.dayBudget).toLocaleString()}
                                                    </span>
                                                )}
                                                {day.weather?.temp && (
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '100px',
                                                        background: '#EFF6FF', color: C.blue,
                                                        border: `1px solid #BFDBFE`,
                                                        fontSize: '12px', fontWeight: 700,
                                                    }}>
                                                        {weatherIcon} {day.weather.temp}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Activities */}
                                        <div style={{ padding: '8px 0' }}>
                                            {day.activities?.map((activity, actIx) => (
                                                <div key={actIx} style={{
                                                    padding: '16px 24px',
                                                    borderBottom: actIx < day.activities.length - 1 ? `1px solid ${C.border}` : 'none',
                                                    display: 'flex', gap: '16px',
                                                    transition: 'background 0.15s',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                                    {/* Time column */}
                                                    <div style={{ flexShrink: 0, width: '56px', paddingTop: '2px' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: C.amber }}>{activity.time}</div>
                                                        <div style={{ width: '1px', height: '100%', background: C.amberBorder, margin: '6px auto 0', opacity: 0.5 }} />
                                                    </div>

                                                    {/* Content */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                                                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: C.text, margin: 0 }}>
                                                                {activity.title}
                                                            </h4>
                                                            {activity.rating && (
                                                                <span style={{
                                                                    display: 'flex', alignItems: 'center', gap: '3px',
                                                                    fontSize: '12px', fontWeight: 700, color: '#92400E',
                                                                    background: C.amberLight, padding: '2px 8px',
                                                                    borderRadius: '100px', flexShrink: 0,
                                                                    border: `1px solid ${C.amberBorder}`,
                                                                }}>
                                                                    <Star size={10} fill={C.amber} color={C.amber} /> {activity.rating}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.65, margin: '0 0 10px' }}>
                                                            {activity.description}
                                                        </p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                            <button onClick={() => openMaps(activity.location)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                                    padding: '4px 10px', borderRadius: '8px',
                                                                    background: '#F8FAFC', border: `1px solid ${C.border}`,
                                                                    fontSize: '12px', fontWeight: 600, color: C.muted,
                                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.color = C.blue; e.currentTarget.style.borderColor = C.blue }}
                                                                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}>
                                                                <MapPin size={11} /> {activity.location} <ExternalLink size={9} />
                                                            </button>
                                                            {activity.cost && (
                                                                <span style={{
                                                                    padding: '4px 10px', borderRadius: '8px',
                                                                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                                                                    fontSize: '12px', fontWeight: 700, color: '#16A34A',
                                                                }}>
                                                                    ₹{activity.cost}
                                                                </span>
                                                            )}
                                                            {activity.duration && (
                                                                <span style={{
                                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                                    padding: '4px 10px', borderRadius: '8px',
                                                                    background: '#F8FAFC', border: `1px solid ${C.border}`,
                                                                    fontSize: '12px', fontWeight: 600, color: C.muted,
                                                                }}>
                                                                    <Clock size={10} /> {activity.duration}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {activity.tips && (
                                                            <div style={{
                                                                marginTop: '10px', padding: '8px 12px',
                                                                borderRadius: '10px', background: C.amberLight,
                                                                border: `1px solid ${C.amberBorder}`,
                                                                fontSize: '12px', color: '#92400E', lineHeight: 1.55,
                                                            }}>
                                                                💡 <strong>Tip: </strong>{activity.tips}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Day footer tips */}
                                        {(day.packingTip || day.safetyTip) && (
                                            <div style={{
                                                padding: '12px 24px',
                                                borderTop: `1px solid ${C.border}`,
                                                background: '#FAFBFC',
                                                display: 'flex', gap: '16px', flexWrap: 'wrap',
                                            }}>
                                                {day.packingTip && (
                                                    <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: C.muted, flex: 1, minWidth: '200px' }}>
                                                        <span>🧳</span> <span>{day.packingTip}</span>
                                                    </div>
                                                )}
                                                {day.safetyTip && (
                                                    <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: C.muted, flex: 1, minWidth: '200px' }}>
                                                        <span>🛡️</span> <span>{day.safetyTip}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )) : (
                                    <div style={{
                                        textAlign: 'center', padding: '60px 24px',
                                        background: C.surface, borderRadius: '20px',
                                        border: `1px solid ${C.border}`, color: C.muted,
                                    }}>
                                        <Sparkles size={36} style={{ margin: '0 auto 12px', color: C.amber }} />
                                        <p>No itinerary data available.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right sidebar */}
                            <div style={{ position: 'sticky', top: '76px' }}>
                                <SideCard title="Trip Scores" icon={<ShieldCheck size={16} />}>
                                    <ScoreBar label="Travel Score" score={travelScore} color={C.blue} />
                                    <ScoreBar label="Safety Score" score={safetyScore} color={C.teal} />
                                </SideCard>

                                <SideCard title="Budget Summary" icon={<Wallet size={16} />}>
                                    {budgetData.map(b => (
                                        <div key={b.name} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            marginBottom: '10px', fontSize: '13px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                                                <span style={{ color: C.muted, fontWeight: 600 }}>{b.name}</span>
                                            </div>
                                            <span style={{ fontWeight: 700, color: C.text }}>₹{(b.value || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700, color: C.text, fontSize: '14px' }}>Total</span>
                                        <span style={{ fontWeight: 800, color: C.amber, fontSize: '15px', fontFamily: 'Syne, sans-serif' }}>
                                            ₹{(budget.total || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </SideCard>

                                {trip.safetyTips?.length > 0 && (
                                    <SideCard title="Safety Tips" icon={<ShieldCheck size={16} />}>
                                        {trip.safetyTips.slice(0, 4).map((tip, i) => (
                                            <div key={i} style={{
                                                display: 'flex', gap: '8px', marginBottom: '8px',
                                                fontSize: '12px', color: C.muted, lineHeight: 1.5,
                                            }}>
                                                <span style={{ color: C.amber, flexShrink: 0, fontWeight: 800 }}>•</span>
                                                <span>{tip}</span>
                                            </div>
                                        ))}
                                    </SideCard>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ── MAP TAB ────────────────────────────────────────────── */}
                    {activeTab === 'map' && (
                        <motion.div key="map"
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{
                                height: '600px', borderRadius: '20px', overflow: 'hidden',
                                border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                            }}>
                            <MapComponent destination={destination} itinerary={itinerary} />
                        </motion.div>
                    )}

                    {/* ── BUDGET TAB ─────────────────────────────────────────── */}
                    {activeTab === 'budget' && (
                        <motion.div key="budget"
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{
                                background: C.surface, borderRadius: '20px',
                                padding: '28px', border: `1px solid ${C.border}`,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: C.text, marginBottom: '24px' }}>
                                    Budget Breakdown
                                </h3>
                                <div style={{ height: '220px', marginBottom: '24px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={budgetData} innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                                                {budgetData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                {budgetData.map(item => (
                                    <div key={item.name} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', marginBottom: '12px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                                            <span style={{ fontSize: '14px', color: C.muted, fontWeight: 600 }}>{item.name}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>₹{(item.value || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: `2px solid ${C.border}`, paddingTop: '14px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700, color: C.text }}>Total Budget</span>
                                    <span style={{ fontWeight: 800, fontSize: '18px', color: C.amber, fontFamily: 'Syne, sans-serif' }}>
                                        ₹{(budget.total || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: C.text, margin: '0 0 4px' }}>
                                    Daily Spend
                                </h3>
                                {itinerary.map((day, i) => (
                                    <motion.div key={day.day}
                                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        style={{
                                            background: C.surface, borderRadius: '14px',
                                            padding: '16px 20px', border: `1px solid ${C.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: '14px', color: C.text,
                                                fontFamily: 'Syne, sans-serif',
                                            }}>{day.day}</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{day.date}</div>
                                                <div style={{ fontSize: '12px', color: C.muted }}>{day.theme}</div>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontFamily: 'Syne, sans-serif', fontWeight: 800,
                                            fontSize: '16px', color: C.teal,
                                        }}>
                                            ₹{(day.dayBudget || 0).toLocaleString()}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── AI CHAT TAB ────────────────────────────────────────── */}
                    {activeTab === 'assistant' && (
                        <motion.div key="assistant"
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{
                                height: '600px', maxWidth: '780px', margin: '0 auto',
                                borderRadius: '20px', overflow: 'hidden',
                                border: `1px solid ${C.border}`,
                                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                            }}>
                            <RahiChat tripContext={trip} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    )
}

export default Dashboard
