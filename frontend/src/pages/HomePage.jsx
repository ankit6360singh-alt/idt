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
    { icon: <Sparkles size={22} />, title: 'AI Itinerary', desc: 'Google Gemini builds your perfect day-by-day plan in seconds.' },
    { icon: <Wallet size={22} />, title: 'Smart Budget', desc: 'Intelligent cost split across hotels, food & activities.' },
    { icon: <Shield size={22} />, title: 'Safety Scores', desc: 'Local safety insights, tips & emergency contacts.' },
    { icon: <Zap size={22} />, title: 'Live Weather', desc: '7-day forecast and climate data for your destination.' },
    { icon: <MapPin size={22} />, title: 'Interactive Map', desc: 'Explore routes and nearby places visually.' },
    { icon: <Heart size={22} />, title: 'Save & Export', desc: 'Export as PDF, save to account & share with companions.' },
]

const DESTINATIONS = [
    { name: 'Goa', country: 'India', tag: 'Beach', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80', rating: 4.8 },
    { name: 'Manali', country: 'India', tag: 'Mountains', img: 'https://images.unsplash.com/photo-1597167430547-e9fde751f5be?w=500&q=80', rating: 4.9 },
    { name: 'Rajasthan', country: 'India', tag: 'Heritage', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&q=80', rating: 4.7 },
    { name: 'Kerala', country: 'India', tag: 'Nature', img: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=500&q=80', rating: 4.8 },
]

// ── ANIMATED COUNTER ───────────────────────────────────────────────────────
const Counter = ({ value }) => {
    const [display, setDisplay] = useState('0')
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    useEffect(() => { if (inView) setDisplay(value) }, [inView, value])
    return <span ref={ref}>{display}</span>
}

// ── FLOATING CARD ──────────────────────────────────────────────────────────
const FloatingCard = ({ style, children, delay = 0, animY = -14 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, animY, 0] }}
        transition={{
            opacity: { delay, duration: 0.5 },
            y: { delay: delay + 0.5, duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut' }
        }}
        style={{
            position: 'absolute',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            border: '1px solid rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', fontWeight: 600, color: '#0A0A0A',
            whiteSpace: 'nowrap',
            zIndex: 5,
            ...style,
        }}>
        {children}
    </motion.div>
)

// ── CLOUD SVG ──────────────────────────────────────────────────────────────
const Cloud = ({ style }) => (
    <motion.div
        animate={{ x: [0, 8, 0], y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', opacity: 0.92, pointerEvents: 'none', ...style }}>
        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="100" cy="55" rx="80" ry="25" fill="white" />
            <ellipse cx="70" cy="45" rx="45" ry="32" fill="white" />
            <ellipse cx="130" cy="48" rx="38" ry="28" fill="white" />
            <ellipse cx="100" cy="40" rx="50" ry="30" fill="white" />
        </svg>
    </motion.div>
)

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
const HomePage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()

    const [formData, setFormData] = useState({ destination: '', days: '3', budget: '30000', travelerType: 'solo', preferences: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    const handleStyleSelect = id => setFormData(p => ({ ...p, travelerType: id }))

    const handleSubmit = async e => {
        if (e) e.preventDefault()
        if (!formData.destination.trim()) return setError('Please enter a destination.')
        setLoading(true); setError('')
        try {
            const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
            const targetUrl = `${apiBase}/api/trip/generate`
            console.log(`[AI Trip Planner] POST → ${targetUrl || '/api/trip/generate'}`)
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
            if (!tripData?.itinerary) throw new Error('Invalid response from server.')
            navigate('/dashboard', { state: { tripData } })
        } catch (err) {
            console.error('[Trip Generator Error]:', err)
            setError(`Failed to generate trip: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── HERO: Left headline + Right planner form ─────────────── */}
            <section style={{
                minHeight: '100vh',
                background: '#F5C518',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'stretch',
            }}>
                {/* Floor shadow */}
                <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '70%', height: '60px',
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Clouds */}
                <Cloud style={{ top: '10%', left: '30%', width: '180px' }} />
                <Cloud style={{ top: '55%', left: '22%', width: '110px', opacity: 0.5 }} />

                {/* ── LEFT: Bold headline ─────────────────────────────────── */}
                <div style={{
                    flex: '0 0 50%',
                    padding: 'clamp(100px, 12vh, 140px) 0 60px 5vw',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                    maxWidth: '580px',
                }}>
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            background: 'rgba(0,0,0,0.1)', borderRadius: '100px',
                            padding: '5px 14px', marginBottom: '24px', width: 'fit-content',
                            fontSize: '12px', fontWeight: 700, color: '#0A0A0A',
                        }}>
                        <Sparkles size={12} /> Powered by Google Gemini
                    </motion.div>

                    {/* Big headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        style={{
                            fontFamily: 'Syne, Inter, sans-serif',
                            fontSize: 'clamp(52px, 6.5vw, 88px)',
                            fontWeight: 800, lineHeight: 1.0,
                            color: '#0A0A0A', letterSpacing: '-2px',
                            marginBottom: '20px',
                        }}>
                        Travel<br />
                        <span style={{ color: 'rgba(0,0,0,0.35)' }}>differently.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        style={{
                            fontSize: 'clamp(15px, 1.8vw, 18px)',
                            color: 'rgba(0,0,0,0.6)',
                            maxWidth: '420px', lineHeight: 1.65,
                            marginBottom: '36px', fontWeight: 500,
                        }}>
                        TRAVLO brings the world to you and empowers you to experience it <strong style={{ color: '#0A0A0A' }}>your way.</strong>
                    </motion.p>

                    {/* Watch how it works button */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ marginBottom: '48px' }}>
                        <button
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                padding: '12px 24px', borderRadius: '100px',
                                background: 'transparent', border: '2px solid rgba(0,0,0,0.2)',
                                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                                fontSize: '15px', cursor: 'pointer', color: '#0A0A0A',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: '#0A0A0A',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Play size={10} fill="#F5C518" color="#F5C518" />
                            </div>
                            How it works
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                        {[
                            { n: '50K+', l: 'Trips Planned' },
                            { n: '200+', l: 'Destinations' },
                            { n: '98%', l: 'Satisfaction' },
                        ].map(s => (
                            <div key={s.l}>
                                <div style={{
                                    fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 800,
                                    fontFamily: 'Syne, sans-serif', color: '#0A0A0A',
                                }}>
                                    <Counter value={s.n} />
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>{s.l}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Floating cards */}
                    <FloatingCard style={{ bottom: '12%', left: '0' }} delay={0.8} animY={-10}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#FF6B6B,#FFD93D)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 12, fontWeight: 800,
                        }}>R</div>
                        <div>
                            <div style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>Just planned</div>
                            <div style={{ fontSize: 12 }}>📍 5 days in Goa</div>
                        </div>
                    </FloatingCard>
                </div>

                {/* ── RIGHT: Trip Planner Form ─────────────────────────────── */}
                <div style={{
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(100px, 12vh, 140px) 5vw 60px 2vw',
                    position: 'relative',
                    zIndex: 2,
                }}>
                    {/* Teal arch background */}
                    <div style={{
                        position: 'absolute',
                        right: '-60px', top: '50%', transform: 'translateY(-50%)',
                        width: '280px', height: '420px',
                        borderRadius: '200px 200px 200px 200px',
                        background: 'linear-gradient(160deg, #0D3D3D 0%, #0D6E6E 100%)',
                        overflow: 'hidden', opacity: 0.8,
                        zIndex: 0,
                    }}>
                        <img
                            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80"
                            alt="Taj Mahal"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, mixBlendMode: 'luminosity' }}
                        />
                    </div>

                    {/* Floating landmark */}
                    <motion.div
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', right: '230px', top: '14%',
                            width: '90px', zIndex: 3,
                            filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.3))',
                        }}>
                        <img src="https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=200&q=80"
                            alt="Landmark"
                            style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', height: '130px' }} />
                    </motion.div>

                    <FloatingCard style={{ top: '18%', right: '300px' }} delay={1} animY={12}>
                        <span style={{ fontSize: 16 }}>❤️</span>
                        <div>
                            <div style={{ fontSize: 10, color: '#888' }}>Saved by</div>
                            <div style={{ fontSize: 12 }}>12.4k travelers</div>
                        </div>
                    </FloatingCard>

                    {/* ── THE PLANNER CARD ──────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{
                            background: '#fff',
                            borderRadius: '28px',
                            padding: '32px 28px',
                            width: '100%',
                            maxWidth: '420px',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
                            position: 'relative',
                            zIndex: 4,
                        }}>
                        {/* Header */}
                        <div style={{ marginBottom: '22px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: '#F5C518', borderRadius: '100px',
                                padding: '5px 12px', marginBottom: '10px',
                                fontSize: '11px', fontWeight: 800, color: '#0A0A0A',
                                letterSpacing: '0.5px',
                            }}>
                                <Sparkles size={11} /> AI TRIP PLANNER
                            </div>
                            <h2 style={{
                                fontSize: '22px', fontWeight: 800, color: '#0A0A0A',
                                fontFamily: 'Syne, sans-serif', marginBottom: '4px',
                            }}>
                                Build Your Perfect Trip
                            </h2>
                            <p style={{ color: '#999', fontSize: '13px' }}>
                                Let Gemini AI craft your day-by-day itinerary
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                            {/* Destination */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    📍 Destination
                                </label>
                                <input
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    placeholder="e.g. Goa, Manali, Paris..."
                                    style={{
                                        padding: '11px 14px', borderRadius: '12px',
                                        border: '2px solid #F0F0F0', fontSize: '15px',
                                        background: '#FAFAFA', color: '#0A0A0A',
                                        width: '100%', outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0A0A0A'}
                                    onBlur={e => e.target.style.borderColor = '#F0F0F0'}
                                />
                            </div>

                            {/* Days + Budget row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        📅 Days
                                    </label>
                                    <input
                                        type="number" name="days" min="1" max="14"
                                        value={formData.days} onChange={handleChange}
                                        style={{
                                            padding: '11px 14px', borderRadius: '12px',
                                            border: '2px solid #F0F0F0', fontSize: '15px',
                                            background: '#FAFAFA', color: '#0A0A0A',
                                            width: '100%', outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#0A0A0A'}
                                        onBlur={e => e.target.style.borderColor = '#F0F0F0'}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        💰 Budget (₹)
                                    </label>
                                    <input
                                        type="number" name="budget" min="1000"
                                        value={formData.budget} onChange={handleChange}
                                        style={{
                                            padding: '11px 14px', borderRadius: '12px',
                                            border: '2px solid #F0F0F0', fontSize: '15px',
                                            background: '#FAFAFA', color: '#0A0A0A',
                                            width: '100%', outline: 'none',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#0A0A0A'}
                                        onBlur={e => e.target.style.borderColor = '#F0F0F0'}
                                    />
                                </div>
                            </div>

                            {/* Travel Style */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    ✈️ Travel Style
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {TRAVEL_STYLES.map(s => (
                                        <button
                                            key={s.id} type="button"
                                            onClick={() => handleStyleSelect(s.id)}
                                            style={{
                                                padding: '5px 12px', borderRadius: '100px',
                                                border: '2px solid',
                                                borderColor: formData.travelerType === s.id ? '#0A0A0A' : '#EBEBEB',
                                                background: formData.travelerType === s.id ? '#0A0A0A' : 'transparent',
                                                color: formData.travelerType === s.id ? '#F5C518' : '#555',
                                                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                fontFamily: 'Syne, sans-serif',
                                            }}>
                                            {s.icon} {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preferences */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    🎯 Preferences <span style={{ color: '#bbb', fontWeight: 500, textTransform: 'none' }}>(optional)</span>
                                </label>
                                <textarea
                                    name="preferences" rows={2}
                                    value={formData.preferences} onChange={handleChange}
                                    placeholder="Vegetarian food, beach resorts, avoid crowds..."
                                    style={{
                                        padding: '11px 14px', borderRadius: '12px',
                                        border: '2px solid #F0F0F0', fontSize: '14px',
                                        background: '#FAFAFA', color: '#0A0A0A',
                                        width: '100%', outline: 'none', resize: 'none',
                                        fontFamily: 'Inter, sans-serif',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0A0A0A'}
                                    onBlur={e => e.target.style.borderColor = '#F0F0F0'}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    background: '#FFF0F0', border: '1px solid #FFD0D0',
                                    borderRadius: '10px', padding: '10px 14px',
                                    color: '#C0392B', fontSize: '13px', lineHeight: 1.5,
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <motion.button
                                type="submit" disabled={loading}
                                whileHover={!loading ? { scale: 1.02 } : {}}
                                whileTap={!loading ? { scale: 0.98 } : {}}
                                style={{
                                    background: '#F5C518', color: '#0A0A0A',
                                    border: 'none', borderRadius: '14px',
                                    padding: '15px', fontFamily: 'Syne, sans-serif',
                                    fontWeight: 800, fontSize: '15px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.75 : 1,
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px',
                                    width: '100%',
                                    boxShadow: '0 6px 24px rgba(245,197,24,0.5)',
                                    marginTop: '4px',
                                }}>
                                {loading ? (
                                    <>
                                        <span className="spinner-sm" style={{ borderTopColor: '#0A0A0A', borderColor: 'rgba(0,0,0,0.15)' }} />
                                        Generating with AI...
                                    </>
                                ) : (
                                    <><Sparkles size={17} /> Generate AI Itinerary</>
                                )}
                            </motion.button>

                            <p style={{ textAlign: 'center', color: '#bbb', fontSize: '12px', fontWeight: 500 }}>
                                No signup required · 100% free
                            </p>
                        </form>
                    </motion.div>
                </div>

                {/* Scroll hint */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                        position: 'absolute', bottom: '20px', left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.45)',
                        cursor: 'pointer', zIndex: 2, letterSpacing: '0.5px',
                    }}>
                    LEARN MORE <ChevronDown size={15} />
                </motion.div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section id="how-it-works" style={{ background: '#0A0A0A', padding: 'clamp(60px, 10vw, 120px) 5vw' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(245,197,24,0.12)', borderRadius: '100px',
                            padding: '6px 16px', marginBottom: '18px',
                            fontSize: '12px', fontWeight: 700, color: '#F5C518', letterSpacing: '0.5px',
                        }}>
                            <Zap size={12} /> HOW IT WORKS
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800,
                            color: '#fff', fontFamily: 'Syne, sans-serif',
                            letterSpacing: '-1px', marginBottom: '14px',
                        }}>
                            Plan smarter, travel better.
                        </h2>
                        <p style={{ color: '#666', fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
                            Three steps between you and your perfect itinerary.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                        {[
                            { n: '01', icon: <Search size={26} />, title: 'Enter your destination', desc: 'Tell us where, how long, your budget and travel style.' },
                            { n: '02', icon: <Sparkles size={26} />, title: 'AI builds your plan', desc: 'Google Gemini creates a detailed day-by-day itinerary in seconds.' },
                            { n: '03', icon: <Plane size={26} />, title: 'Explore & go!', desc: 'Get maps, weather, safety tips, and export as PDF.' },
                        ].map((step, i) => (
                            <motion.div
                                key={step.n}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                style={{
                                    background: '#141414', borderRadius: '20px',
                                    padding: '32px 28px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                <div style={{
                                    position: 'absolute', top: '16px', right: '20px',
                                    fontSize: '64px', fontWeight: 800,
                                    color: 'rgba(245,197,24,0.05)',
                                    fontFamily: 'Syne, sans-serif', lineHeight: 1,
                                }}>{step.n}</div>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: 'rgba(245,197,24,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#F5C518', marginBottom: '18px',
                                }}>
                                    {step.icon}
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{step.title}</h3>
                                <p style={{ color: '#555', lineHeight: 1.7, fontSize: '14px' }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────────────── */}
            <section style={{ background: '#F5C518', padding: 'clamp(60px, 10vw, 120px) 5vw' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800,
                        color: '#0A0A0A', fontFamily: 'Syne, sans-serif',
                        letterSpacing: '-1px', lineHeight: 1.05, marginBottom: '48px',
                    }}>
                        Everything you need<br />
                        <span style={{ color: 'rgba(0,0,0,0.3)' }}>to travel smart.</span>
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -4 }}
                                style={{
                                    background: 'rgba(0,0,0,0.06)', borderRadius: '18px',
                                    padding: '24px 20px',
                                    border: '1px solid rgba(0,0,0,0.07)',
                                    transition: 'all 0.25s ease',
                                }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: '#0A0A0A', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: '#F5C518', marginBottom: '14px',
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0A0A0A', marginBottom: '6px', fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
                                <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '13px', lineHeight: 1.65 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── POPULAR DESTINATIONS ─────────────────────────────────────── */}
            <section style={{ background: '#fff', padding: 'clamp(60px, 10vw, 120px) 5vw' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
                        <h2 style={{
                            fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800,
                            color: '#0A0A0A', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px',
                        }}>
                            Trending destinations.
                        </h2>
                        <Link to="/explore" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontWeight: 700, color: '#0A0A0A', fontSize: '14px',
                            borderBottom: '2px solid #F5C518', paddingBottom: '1px',
                            textDecoration: 'none',
                        }}>
                            View all <ArrowRight size={15} />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        {DESTINATIONS.map((d, i) => (
                            <motion.div
                                key={d.name}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.09 }}
                                whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(0,0,0,0.16)' }}
                                onClick={() => {
                                    setFormData(p => ({ ...p, destination: d.name }))
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                style={{
                                    borderRadius: '18px', overflow: 'hidden',
                                    cursor: 'pointer', position: 'relative',
                                    aspectRatio: '3/4',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                }}>
                                <img src={d.img} alt={d.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)',
                                }} />
                                <div style={{ position: 'absolute', bottom: '18px', left: '18px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#F5C518', color: '#0A0A0A',
                                        borderRadius: '100px', padding: '2px 10px',
                                        fontSize: '10px', fontWeight: 800,
                                        marginBottom: '6px', letterSpacing: '0.3px',
                                    }}>{d.tag}</div>
                                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{d.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{d.country}</div>
                                </div>
                                <div style={{
                                    position: 'absolute', top: '14px', right: '14px',
                                    background: 'rgba(255,255,255,0.95)', borderRadius: '100px',
                                    padding: '3px 9px', fontSize: '12px', fontWeight: 700, color: '#0A0A0A',
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                }}>
                                    <Star size={11} fill="#F5C518" color="#F5C518" /> {d.rating}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
            <section style={{ background: '#0A0A0A', padding: 'clamp(80px, 12vw, 140px) 5vw', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}>
                    <h2 style={{
                        fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800,
                        color: '#fff', fontFamily: 'Syne, sans-serif',
                        letterSpacing: '-2px', marginBottom: '16px',
                    }}>
                        Ready to travel<br />
                        <span style={{ color: '#F5C518' }}>differently?</span>
                    </h2>
                    <p style={{ color: '#555', fontSize: '17px', marginBottom: '36px', maxWidth: '400px', margin: '0 auto 36px' }}>
                        No signup required. Just enter your destination and let AI do the rest.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(245,197,24,0.6)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{
                            background: '#F5C518', color: '#0A0A0A',
                            border: 'none', borderRadius: '100px',
                            padding: '18px 52px', fontFamily: 'Syne, sans-serif',
                            fontWeight: 800, fontSize: '18px', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 10px 40px rgba(245,197,24,0.4)',
                        }}>
                        <Sparkles size={20} /> Plan my trip now
                    </motion.button>
                </motion.div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <footer style={{
                background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '28px 5vw',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '14px',
            }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', color: '#F5C518' }}>
                    TRAVLO <span style={{ fontSize: '10px', fontWeight: 600, color: '#444' }}>AI</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {[['/', 'Home'], ['/explore', 'Explore'], ['/map', 'Map'], ['/budget', 'Budget'], ['/login', 'Login']].map(([to, label]) => (
                        <Link key={to} to={to}
                            style={{ color: '#444', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
                            onMouseLeave={e => e.currentTarget.style.color = '#444'}>
                            {label}
                        </Link>
                    ))}
                </div>
                <div style={{ color: '#2A2A2A', fontSize: '12px' }}>© 2026 TRAVLO. All rights reserved.</div>
            </footer>
        </div>
    )
}

export default HomePage
