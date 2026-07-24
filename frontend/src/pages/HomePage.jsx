import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
    MapPin, Sparkles, Star, Plane, Shield, Zap, Heart,
    ArrowRight, Calendar, Wallet, ChevronDown, Play, Search
} from 'lucide-react'

// ── TRAVEL STYLES ──────────────────────────────────────────────────────────
const TRAVEL_STYLES = [
    { id: 'solo', name: 'Solo', icon: '🎒' },
    { id: 'couple', name: 'Couple', icon: '💑' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', name: 'Friends', icon: '🍻' },
    { id: 'adventure', name: 'Adventure', icon: '🧗' },
    { id: 'luxury', name: 'Luxury', icon: '✨' },
    { id: 'backpacking', name: 'Backpacking', icon: '🌍' },
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'food', name: 'Food', icon: '🍜' },
    { id: 'women', name: "Women's", icon: '👩' },
]

const FEATURES = [
    { icon: <Sparkles size={24} />, title: 'AI Itinerary', desc: 'Google Gemini builds your perfect day-by-day plan in seconds.' },
    { icon: <Wallet size={24} />, title: 'Smart Budget', desc: 'Intelligent cost breakdown across hotels, food & activities.' },
    { icon: <Shield size={24} />, title: 'Safety Scores', desc: 'Local safety insights, tips & emergency contacts always ready.' },
    { icon: <Zap size={24} />, title: 'Live Weather', desc: '7-day forecast and climate data for your destination.' },
    { icon: <MapPin size={24} />, title: 'Interactive Map', desc: 'Explore routes, nearby places on beautiful OpenStreetMap.' },
    { icon: <Heart size={24} />, title: 'Save & Export', desc: 'Export as PDF, save to account & share with travel companions.' },
]

const DESTINATIONS = [
    { name: 'Goa', country: 'India', tag: 'Beach', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80', rating: 4.8 },
    { name: 'Manali', country: 'India', tag: 'Mountains', img: 'https://images.unsplash.com/photo-1597167430547-e9fde751f5be?w=500&q=80', rating: 4.9 },
    { name: 'Rajasthan', country: 'India', tag: 'Heritage', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&q=80', rating: 4.7 },
    { name: 'Kerala', country: 'India', tag: 'Nature', img: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=500&q=80', rating: 4.8 },
]

// ── FLOATING CARD COMPONENT ────────────────────────────────────────────────
const FloatingCard = ({ style, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        style={{
            position: 'absolute',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            border: '1px solid rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0A0A0A',
            whiteSpace: 'nowrap',
            ...style,
        }}
    >
        {children}
    </motion.div>
)

// ── ANIMATED COUNTER ───────────────────────────────────────────────────────
const Counter = ({ value }) => {
    const [display, setDisplay] = useState('0')
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    useEffect(() => { if (inView) setDisplay(value) }, [inView, value])
    return <span ref={ref}>{display}</span>
}

// ── CLOUD SVG ──────────────────────────────────────────────────────────────
const Cloud = ({ style }) => (
    <div style={{ position: 'absolute', opacity: 0.9, ...style }}>
        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="100" cy="55" rx="80" ry="25" fill="white" />
            <ellipse cx="70" cy="45" rx="45" ry="32" fill="white" />
            <ellipse cx="130" cy="48" rx="38" ry="28" fill="white" />
            <ellipse cx="100" cy="40" rx="50" ry="30" fill="white" />
        </svg>
    </div>
)

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
const HomePage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()

    const [formData, setFormData] = useState({ destination: '', days: '3', budget: '30000', travelerType: 'solo', preferences: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [plannerOpen, setPlannerOpen] = useState(false)

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    const handleStyleSelect = id => setFormData(p => ({ ...p, travelerType: id }))

    const handleSubmit = async e => {
        if (e) e.preventDefault()
        if (!formData.destination.trim()) return setError('Please enter a destination.')
        setLoading(true); setError('')
        try {
            const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
            const targetUrl = `${apiBase}/api/trip/generate`
            console.log(`[AI Trip Planner] POST → ${targetUrl || '(relative) /api/trip/generate'}`)
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(`Server error: ${res.status}${text ? ' — ' + text.substring(0, 200) : ''}`)
            }
            const tripData = await res.json()
            if (!tripData?.itinerary) throw new Error('Invalid response from server. Missing itinerary data.')
            navigate('/dashboard', { state: { tripData } })
        } catch (err) {
            console.error('[Trip Generator Error]:', err)
            setError(`Failed to generate trip: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── HERO SECTION ─────────────────────────────────────────────── */}
            <section style={{
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Decorative shadow on floor */}
                <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '60%', height: '80px',
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Clouds */}
                <Cloud style={{ top: '8%', left: '38%', width: '200px' }} />
                <Cloud style={{ top: '18%', right: '12%', width: '140px', opacity: 0.7 }} />
                <Cloud style={{ bottom: '28%', left: '18%', width: '120px', opacity: 0.5 }} />

                {/* Right arch/oval element */}
                <div style={{
                    position: 'absolute',
                    right: '-40px',
                    top: '50%',
                    transform: 'translateY(-52%)',
                    width: '360px',
                    height: '480px',
                    borderRadius: '200px 200px 200px 200px',
                    background: 'linear-gradient(160deg, #0D3D3D 0%, #0D6E6E 60%, #1a9090 100%)',
                    overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                }}>
                    {/* Landmark inside arch */}
                    <img
                        src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80"
                        alt="Taj Mahal"
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            opacity: 0.7,
                            mixBlendMode: 'luminosity',
                        }}
                    />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(13,61,61,0.7) 0%, transparent 50%)',
                    }} />
                </div>

                {/* Floating landmark images */}
                <motion.div
                    animate={{ y: [0, -16, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        right: '340px',
                        top: '15%',
                        width: '120px',
                        zIndex: 2,
                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))',
                    }}>
                    <img src="https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=300&q=80" alt="Big Ben"
                        style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '180px' }} />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    style={{
                        position: 'absolute',
                        right: '260px',
                        bottom: '22%',
                        width: '110px',
                        zIndex: 2,
                        filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.3))',
                    }}>
                    <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300&q=80" alt="Eiffel"
                        style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '160px' }} />
                </motion.div>

                {/* Floating UI Cards */}
                <FloatingCard style={{ top: '28%', right: '410px', zIndex: 3 }} delay={0.5}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6B6B,#FFD93D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>R</div>
                    <div>
                        <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>Destination</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>📍 Jaipur, India</div>
                    </div>
                </FloatingCard>

                <FloatingCard style={{ bottom: '32%', right: '430px', zIndex: 3 }} delay={0.8}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4A90E2,#50C9CE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>A</div>
                    <div>
                        <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>AI Generated</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>⚡ 5-Day Itinerary</div>
                    </div>
                </FloatingCard>

                <FloatingCard style={{ top: '60%', right: '50px', zIndex: 3 }} delay={1.1}>
                    <span style={{ fontSize: 18 }}>❤️</span>
                    <div>
                        <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>Saved by</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>12.4k travelers</div>
                    </div>
                </FloatingCard>

                {/* Hero content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '120px 5vw 60px',
                    maxWidth: '720px',
                    position: 'relative',
                    zIndex: 2,
                }}>
                    <div>
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(0,0,0,0.08)', borderRadius: '100px',
                                padding: '6px 16px', marginBottom: '28px',
                                fontSize: '13px', fontWeight: 600,
                            }}>
                            <Sparkles size={14} /> Powered by Google Gemini AI
                        </motion.div>

                        {/* Main headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            style={{
                                fontFamily: 'Syne, Inter, sans-serif',
                                fontSize: 'clamp(52px, 7vw, 96px)',
                                fontWeight: 800,
                                lineHeight: 1.0,
                                color: 'var(--text-primary)',
                                letterSpacing: '-2px',
                                marginBottom: '24px',
                            }}>
                            Travel<br />
                            <span style={{ color: 'rgba(0,0,0,0.4)' }}>differently.</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            style={{
                                fontSize: 'clamp(16px, 2vw, 20px)',
                                color: 'var(--text-secondary)',
                                maxWidth: '480px',
                                lineHeight: 1.65,
                                marginBottom: '40px',
                                fontWeight: 500,
                            }}>
                            TRAVLO brings the world to you and empowers you to experience it <strong style={{ color: 'var(--text-primary)' }}>your way.</strong>
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setPlannerOpen(true)}
                                className="btn btn-primary btn-lg"
                                style={{ gap: '10px' }}>
                                <Sparkles size={18} /> Start planning
                            </button>
                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                                    padding: '14px 28px', borderRadius: '100px',
                                    background: 'rgba(0,0,0,0.06)',
                                    border: '2px solid rgba(0,0,0,0.15)',
                                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                                    fontSize: '16px', cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'var(--text-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Play size={12} fill="var(--bg-primary)" color="var(--bg-primary)" />
                                </div>
                                How it works
                            </button>
                        </motion.div>

                        {/* Stats row */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{
                                display: 'flex', gap: '32px', marginTop: '52px',
                                flexWrap: 'wrap',
                            }}>
                            {[
                                { n: '50K+', l: 'Trips Planned' },
                                { n: '200+', l: 'Destinations' },
                                { n: '98%', l: 'Happy Travelers' },
                            ].map(s => (
                                <div key={s.l}>
                                    <div style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, fontFamily: 'Syne,sans-serif', color: 'var(--text-primary)' }}>
                                        <Counter value={s.n} />
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.l}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Scroll hint */}
                <motion.div
                    animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
                        cursor: 'pointer', zIndex: 2,
                    }}
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                    Learn more <ChevronDown size={16} />
                </motion.div>
            </section>

            {/* ── AI PLANNER MODAL ─────────────────────────────────────────── */}
            <AnimatePresence>
                {plannerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setPlannerOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(6px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'fixed', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90vw', maxWidth: '540px',
                                background: '#fff',
                                borderRadius: '28px',
                                padding: '36px',
                                zIndex: 101,
                                boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                            }}>
                            {/* Header */}
                            <div style={{ marginBottom: '28px' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    background: '#F5C518', borderRadius: '100px',
                                    padding: '6px 14px', marginBottom: '12px',
                                    fontSize: '12px', fontWeight: 700, color: '#0A0A0A',
                                }}>
                                    <Sparkles size={12} /> AI TRIP PLANNER
                                </div>
                                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0A0A0A', fontFamily: 'Syne, sans-serif' }}>
                                    Build Your Perfect Trip
                                </h2>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '6px' }}>Fill in your details and let Gemini AI craft your itinerary</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Destination */}
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: '6px' }}>
                                        📍 Destination
                                    </label>
                                    <input
                                        name="destination" value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="e.g. Goa, Manali, Paris..."
                                        style={{ background: '#F8F9FA', borderColor: '#E0E0E0', color: '#0A0A0A' }}
                                    />
                                </div>

                                {/* Days + Budget */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: '6px' }}>
                                            <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Duration (days)
                                        </label>
                                        <input
                                            type="number" name="days" min="1" max="14"
                                            value={formData.days} onChange={handleChange}
                                            style={{ background: '#F8F9FA', borderColor: '#E0E0E0', color: '#0A0A0A' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: '6px' }}>
                                            <Wallet size={12} style={{ display: 'inline', marginRight: 4 }} />Budget (₹)
                                        </label>
                                        <input
                                            type="number" name="budget" min="1000"
                                            value={formData.budget} onChange={handleChange}
                                            style={{ background: '#F8F9FA', borderColor: '#E0E0E0', color: '#0A0A0A' }}
                                        />
                                    </div>
                                </div>

                                {/* Travel Style */}
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: '8px' }}>
                                        Travel Style
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {TRAVEL_STYLES.map(s => (
                                            <button
                                                key={s.id} type="button"
                                                onClick={() => handleStyleSelect(s.id)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '100px', border: '2px solid',
                                                    borderColor: formData.travelerType === s.id ? '#0A0A0A' : '#E0E0E0',
                                                    background: formData.travelerType === s.id ? '#0A0A0A' : 'transparent',
                                                    color: formData.travelerType === s.id ? '#fff' : '#0A0A0A',
                                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}>
                                                {s.icon} {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: '6px' }}>
                                        Preferences (optional)
                                    </label>
                                    <textarea
                                        name="preferences" rows={2}
                                        value={formData.preferences} onChange={handleChange}
                                        placeholder="e.g. Vegetarian food, beach resorts, avoid crowds..."
                                        style={{ resize: 'none', background: '#F8F9FA', borderColor: '#E0E0E0', color: '#0A0A0A' }}
                                    />
                                </div>

                                {error && (
                                    <div style={{
                                        background: '#FFF0F0', border: '1px solid #FFD0D0',
                                        borderRadius: '10px', padding: '12px 16px',
                                        color: '#C0392B', fontSize: '14px',
                                    }}>{error}</div>
                                )}

                                <button
                                    type="submit" disabled={loading}
                                    style={{
                                        background: '#F5C518', color: '#0A0A0A',
                                        border: 'none', borderRadius: '100px',
                                        padding: '16px', fontFamily: 'Syne, sans-serif',
                                        fontWeight: 800, fontSize: '16px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 20px rgba(245,197,24,0.5)',
                                    }}
                                    onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                                    {loading ? (
                                        <><span className="spinner-sm" style={{ borderTopColor: '#0A0A0A', borderColor: 'rgba(0,0,0,0.2)' }} /> Generating with AI...</>
                                    ) : (
                                        <><Sparkles size={18} /> Generate AI Itinerary</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section id="how-it-works" style={{
                background: '#0A0A0A',
                padding: 'clamp(60px, 10vw, 120px) 5vw',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(245,197,24,0.12)', borderRadius: '100px',
                            padding: '6px 16px', marginBottom: '20px',
                            fontSize: '13px', fontWeight: 600, color: '#F5C518',
                        }}>
                            <Zap size={13} /> HOW IT WORKS
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800,
                            color: '#FFFFFF', fontFamily: 'Syne, sans-serif',
                            letterSpacing: '-1px', marginBottom: '16px',
                        }}>
                            Plan smarter, travel better.
                        </h2>
                        <p style={{ color: '#888', fontSize: '18px', maxWidth: '520px', margin: '0 auto' }}>
                            Three steps between you and your perfect itinerary.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {[
                            { n: '01', icon: <Search size={28} />, title: 'Enter your destination', desc: 'Tell us where you want to go, how long, and your travel style.' },
                            { n: '02', icon: <Sparkles size={28} />, title: 'AI builds your plan', desc: 'Google Gemini creates a detailed day-by-day itinerary tailored to your budget.' },
                            { n: '03', icon: <Plane size={28} />, title: 'Explore & go!', desc: 'Get weather, maps, safety tips, and export your plan as PDF.' },
                        ].map((step, i) => (
                            <motion.div
                                key={step.n}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                style={{
                                    background: '#141414',
                                    borderRadius: '20px',
                                    padding: '36px 32px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                <div style={{
                                    position: 'absolute', top: '20px', right: '24px',
                                    fontSize: '72px', fontWeight: 800,
                                    color: 'rgba(245,197,24,0.06)',
                                    fontFamily: 'Syne, sans-serif',
                                    lineHeight: 1,
                                }}>{step.n}</div>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'rgba(245,197,24,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#F5C518', marginBottom: '20px',
                                }}>
                                    {step.icon}
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '10px', fontFamily: 'Syne, sans-serif' }}>
                                    {step.title}
                                </h3>
                                <p style={{ color: '#666', lineHeight: 1.7, fontSize: '15px' }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Big CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginTop: '64px' }}>
                        <button
                            onClick={() => { setPlannerOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                            style={{
                                background: '#F5C518', color: '#0A0A0A',
                                border: 'none', borderRadius: '100px',
                                padding: '18px 48px', fontFamily: 'Syne, sans-serif',
                                fontWeight: 800, fontSize: '18px', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 8px 32px rgba(245,197,24,0.4)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(245,197,24,0.55)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,197,24,0.4)' }}>
                            Start planning for free <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────────────── */}
            <section style={{
                background: '#F5C518',
                padding: 'clamp(60px, 10vw, 120px) 5vw',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '56px' }}>
                        <h2 style={{
                            fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800,
                            color: '#0A0A0A', fontFamily: 'Syne, sans-serif',
                            letterSpacing: '-1px', lineHeight: 1.0,
                        }}>
                            Everything you need<br />
                            <span style={{ color: 'rgba(0,0,0,0.35)' }}>to travel smart.</span>
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4 }}
                                style={{
                                    background: 'rgba(0,0,0,0.06)',
                                    borderRadius: '20px',
                                    padding: '28px 24px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    transition: 'all 0.25s ease',
                                }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '14px',
                                    background: '#0A0A0A',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#F5C518', marginBottom: '16px',
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>
                                    {f.title}
                                </h3>
                                <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: '14px', lineHeight: 1.65 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── POPULAR DESTINATIONS ─────────────────────────────────────── */}
            <section style={{
                background: '#fff',
                padding: 'clamp(60px, 10vw, 120px) 5vw',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800,
                            color: '#0A0A0A', fontFamily: 'Syne, sans-serif',
                            letterSpacing: '-1px',
                        }}>
                            Trending destinations.
                        </h2>
                        <Link to="/explore" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontWeight: 700, color: '#0A0A0A', fontSize: '15px',
                            borderBottom: '2px solid #F5C518', paddingBottom: '2px',
                        }}>
                            View all <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {DESTINATIONS.map((d, i) => (
                            <motion.div
                                key={d.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => { setFormData(p => ({ ...p, destination: d.name })); setPlannerOpen(true) }}
                                style={{
                                    borderRadius: '20px', overflow: 'hidden',
                                    cursor: 'pointer', position: 'relative',
                                    aspectRatio: '4/5',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                }}
                                whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
                                <img src={d.img} alt={d.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
                                }} />
                                <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#F5C518', color: '#0A0A0A',
                                        borderRadius: '100px', padding: '3px 12px',
                                        fontSize: '11px', fontWeight: 700, marginBottom: '8px',
                                    }}>{d.tag}</div>
                                    <div style={{ color: '#fff', fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{d.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{d.country}</div>
                                </div>
                                <div style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    background: 'rgba(255,255,255,0.95)', borderRadius: '100px',
                                    padding: '4px 10px', fontSize: '13px', fontWeight: 700, color: '#0A0A0A',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}>
                                    <Star size={12} fill="#F5C518" color="#F5C518" /> {d.rating}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
            <section style={{
                background: '#0A0A0A',
                padding: 'clamp(80px, 12vw, 140px) 5vw',
                textAlign: 'center',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}>
                    <h2 style={{
                        fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800,
                        color: '#fff', fontFamily: 'Syne, sans-serif',
                        letterSpacing: '-2px', marginBottom: '20px',
                    }}>
                        Ready to travel<br />
                        <span style={{ color: '#F5C518' }}>differently?</span>
                    </h2>
                    <p style={{ color: '#666', fontSize: '18px', marginBottom: '40px', maxWidth: '440px', margin: '0 auto 40px' }}>
                        No signup required. Just enter your destination and let AI do the rest.
                    </p>
                    <button
                        onClick={() => { setPlannerOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        style={{
                            background: '#F5C518', color: '#0A0A0A',
                            border: 'none', borderRadius: '100px',
                            padding: '20px 56px', fontFamily: 'Syne, sans-serif',
                            fontWeight: 800, fontSize: '20px', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '12px',
                            boxShadow: '0 12px 48px rgba(245,197,24,0.45)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(245,197,24,0.6)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 48px rgba(245,197,24,0.45)' }}>
                        <Sparkles size={22} /> Plan my trip now
                    </button>
                </motion.div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <footer style={{
                background: '#0A0A0A',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '32px 5vw',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '16px',
            }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: '#F5C518' }}>
                    TRAVLO <span style={{ fontSize: '11px', fontWeight: 600, color: '#555', marginLeft: '4px' }}>AI</span>
                </div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {[['/', 'Home'], ['/explore', 'Explore'], ['/map', 'Map'], ['/budget', 'Budget'], ['/login', 'Login']].map(([to, label]) => (
                        <Link key={to} to={to} style={{ color: '#555', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
                            onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                            {label}
                        </Link>
                    ))}
                </div>
                <div style={{ color: '#333', fontSize: '13px' }}>© 2026 TRAVLO. All rights reserved.</div>
            </footer>
        </div>
    )
}

export default HomePage
