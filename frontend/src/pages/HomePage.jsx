import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
    MapPin, Sparkles, Globe, Star, Users, TrendingUp,
    ChevronRight, Compass, Plane, Mountain, Waves,
    Coffee, Shield, Zap, Heart, Menu, X, Moon, Sun,
    ArrowRight, Search, Calendar, Wallet, ChevronDown
} from 'lucide-react'
import Navbar from '../components/Navbar'

// ── DATA ───────────────────────────────────────────────────────────────────
const TRAVEL_STYLES = [
    { id: 'solo', name: 'Solo', icon: '🎒', desc: 'Discover yourself' },
    { id: 'couple', name: 'Couple', icon: '💑', desc: 'Romance on the road' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Fun for all ages' },
    { id: 'friends', name: 'Friends', icon: '🍻', desc: 'Shared adventures' },
    { id: 'student', name: 'Student', icon: '📚', desc: 'Budget-smart travel' },
    { id: 'luxury', name: 'Luxury', icon: '✨', desc: 'Premium experiences' },
    { id: 'backpacking', name: 'Backpacking', icon: '🌍', desc: 'Raw & authentic' },
    { id: 'adventure', name: 'Adventure', icon: '🧗', desc: 'Thrill & adrenaline' },
    { id: 'nature', name: 'Nature', icon: '🌿', desc: 'Forests & mountains' },
    { id: 'food', name: 'Food', icon: '🍜', desc: 'Taste the world' },
    { id: 'roadtrip', name: 'Road Trip', icon: '🚗', desc: 'Freedom of the road' },
    { id: 'women', name: "Women's", icon: '👩', desc: 'Safe & empowering' },
]

const DESTINATIONS = [
    { name: 'Goa, India', tag: 'Beach', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80', rating: 4.8 },
    { name: 'Manali, India', tag: 'Mountains', img: 'https://images.unsplash.com/photo-1597167430547-e9fde751f5be?w=600&q=80', rating: 4.9 },
    { name: 'Rajasthan, India', tag: 'Heritage', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80', rating: 4.7 },
    { name: 'Kerala, India', tag: 'Nature', img: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&q=80', rating: 4.8 },
    { name: 'Leh Ladakh, India', tag: 'Adventure', img: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=600&q=80', rating: 5.0 },
    { name: 'Varanasi, India', tag: 'Spiritual', img: 'https://images.unsplash.com/photo-1561361058-c24e02f90c02?w=600&q=80', rating: 4.6 },
]

const FEATURES = [
    { icon: <Sparkles size={28} />, title: 'AI-Powered Planning', desc: 'RAHI generates personalized day-by-day itineraries in seconds using Google Gemini.' },
    { icon: <Wallet size={28} />, title: 'Smart Budget', desc: 'Intelligent cost breakdown across hotels, food, transport, and attractions.' },
    { icon: <Globe size={28} />, title: 'Interactive Maps', desc: 'Explore destinations, routes, and nearby places on beautiful OpenStreetMap layers.' },
    { icon: <Shield size={28} />, title: 'Safety Insights', desc: 'Safety scores, local tips, and emergency contacts always at your fingertips.' },
    { icon: <Zap size={28} />, title: 'Real-Time Weather', desc: '7-day forecasts, UV index, rain probability, and wind data for your destination.' },
    { icon: <Heart size={28} />, title: 'Save & Export', desc: 'Save trips to your account, export as PDF, and share with travel companions.' },
]

const TESTIMONIALS = [
    { name: 'Priya Sharma', role: 'Digital Nomad', text: 'TRAVLO replaced my 3-hour planning sessions with a 30-second AI-generated itinerary. Absolutely magical.', rating: 5 },
    { name: 'Rahul Mehta', role: 'Adventure Traveler', text: 'The budget breakdown saved us ₹15,000 on our Ladakh trip. The AI suggestions were spot on.', rating: 5 },
    { name: 'Ananya Patel', role: 'Family Traveler', text: 'Finally a travel planner that understands family needs. The safety tips and family-friendly filters are a lifesaver.', rating: 5 },
]

const STATS = [
    { num: '50K+', label: 'Trips Generated' },
    { num: '200+', label: 'Destinations' },
    { num: '98%', label: 'User Satisfaction' },
    { num: '24/7', label: 'AI Available' },
]

const HERO_WORDS = ['Smarter', 'Personalized', 'Magical', 'Unforgettable']

// ── ANIMATED COUNTER ───────────────────────────────────────────────────────
const Counter = ({ value }) => {
    const [display, setDisplay] = useState('0')
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    useEffect(() => {
        if (inView) {
            setDisplay(value)
        }
    }, [inView, value])
    return <span ref={ref}>{display}</span>
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
const HomePage = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()

    const [formData, setFormData] = useState({ destination: '', days: '3', budget: '30000', travelerType: 'solo', preferences: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [heroWordIdx, setHeroWordIdx] = useState(0)
    const [mobileMenu, setMobileMenu] = useState(false)

    // Cycle hero word
    useEffect(() => {
        const t = setInterval(() => setHeroWordIdx(i => (i + 1) % HERO_WORDS.length), 2800)
        return () => clearInterval(t)
    }, [])

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    const handleStyleSelect = id => setFormData(p => ({ ...p, travelerType: id }))

    const handleSubmit = async e => {
        if (e) e.preventDefault()
        if (!formData.destination.trim()) return setError('Please enter a destination.')
        setLoading(true); setError('')
        try {
            const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
            const targetUrl = `${apiBase}/api/trip/generate`

            console.log(`[AI Trip Planner] Submitting request to: ${targetUrl}`)

            let res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.status === 405) {
                console.warn('[405 Error] Server returned 405 Method Not Allowed.')
                throw new Error('405 Method Not Allowed: Please ensure VITE_API_URL environment variable is set on your Vercel Frontend project pointing to your Vercel Backend deployment URL.')
            }

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(`Server returned HTTP ${res.status}: ${text || 'Unknown error'}`)
            }

            const tripData = await res.json()
            if (!tripData?.itinerary) throw new Error('Invalid response payload format from server')
            navigate('/dashboard', { state: { tripData } })
        } catch (err) {
            console.error('[Trip Generator Error]:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const scrollToPlanner = () => document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar />

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F1928 0%, #1E2D3D 50%, #0F1928 100%)' }}>
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-float"
                        style={{ background: 'radial-gradient(circle, #4A90E2, transparent)', filter: 'blur(60px)' }} />
                    <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-15 animate-float"
                        style={{ background: 'radial-gradient(circle, #50C9CE, transparent)', filter: 'blur(60px)', animationDelay: '1.5s' }} />
                    <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-10 animate-float"
                        style={{ background: 'radial-gradient(circle, #FFD93D, transparent)', filter: 'blur(50px)', animationDelay: '3s' }} />
                    {/* Grid overlay */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(74,144,226,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,226,0.05) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />
                </div>

                <div className="container relative z-10 py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left content */}
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass text-sm font-medium"
                                style={{ color: '#50C9CE', border: '1px solid rgba(80,201,206,0.3)' }}>
                                <Sparkles size={14} />
                                AI-Powered Travel Planning
                            </motion.div>

                            <h1 className="text-5xl lg:text-7xl font-black mb-4 leading-tight" style={{ fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
                                Plan{' '}
                                <AnimatePresence mode="wait">
                                    <motion.span key={heroWordIdx}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="gradient-text inline-block">
                                        {HERO_WORDS[heroWordIdx]}
                                    </motion.span>
                                </AnimatePresence>
                                <br />Trips
                            </h1>

                            <p className="text-lg mb-8 leading-relaxed" style={{ color: '#A0AEC0' }}>
                                {isAuthenticated
                                    ? `Welcome back, ${user?.name?.split(' ')[0]}! Ready for your next adventure? Let RAHI plan it in seconds.`
                                    : 'TRAVLO uses Google Gemini AI to create personalized itineraries, smart budgets, and real-time insights — all in one click.'}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={scrollToPlanner} className="btn btn-primary btn-lg">
                                    <Sparkles size={18} /> Start Planning Free
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/explore')} className="btn btn-outline btn-lg"
                                    style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                                    <Compass size={18} /> Explore Destinations
                                </motion.button>
                            </div>

                            {/* Mini stats */}
                            <div className="flex gap-8 mt-10">
                                {STATS.slice(0, 3).map(s => (
                                    <div key={s.label}>
                                        <div className="text-2xl font-bold gradient-text">{s.num}</div>
                                        <div className="text-xs" style={{ color: '#A0AEC0' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — animated globe SVG + floating cards */}
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                            className="relative hidden lg:flex items-center justify-center">
                            {/* Globe */}
                            <div className="relative w-96 h-96 animate-float">
                                <svg viewBox="0 0 400 400" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 60px rgba(74,144,226,0.4))' }}>
                                    <defs>
                                        <radialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
                                            <stop offset="0%" stopColor="#1E3A5F" />
                                            <stop offset="100%" stopColor="#0A1628" />
                                        </radialGradient>
                                        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#1565C0" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.4" />
                                        </radialGradient>
                                    </defs>
                                    {/* Main globe */}
                                    <circle cx="200" cy="200" r="160" fill="url(#globeGrad)" stroke="#4A90E2" strokeWidth="1.5" opacity="0.9" />
                                    {/* Grid lines */}
                                    {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(i => (
                                        <ellipse key={`h${i}`} cx="200" cy="200" rx="160" ry={Math.abs(i) * 18} fill="none" stroke="#4A90E2" strokeWidth="0.5" opacity="0.2" />
                                    ))}
                                    {[0, 30, 60, 90, 120, 150].map(angle => {
                                        const rad = (angle * Math.PI) / 180
                                        return <line key={`v${angle}`} x1={200 + 160 * Math.cos(rad)} y1={200 + 160 * Math.sin(rad)}
                                            x2={200 - 160 * Math.cos(rad)} y2={200 - 160 * Math.sin(rad)}
                                            stroke="#4A90E2" strokeWidth="0.5" opacity="0.2" />
                                    })}
                                    {/* Land masses (simplified) */}
                                    {[
                                        { cx: 180, cy: 160, rx: 35, ry: 25 },
                                        { cx: 240, cy: 190, rx: 28, ry: 22 },
                                        { cx: 155, cy: 220, rx: 22, ry: 30 },
                                        { cx: 270, cy: 150, rx: 20, ry: 18 },
                                        { cx: 160, cy: 260, rx: 18, ry: 15 },
                                    ].map((land, i) => (
                                        <ellipse key={i} {...land} fill="#2E7D32" opacity="0.7" />
                                    ))}
                                    {/* Highlight */}
                                    <ellipse cx="155" cy="145" rx="70" ry="55" fill="rgba(255,255,255,0.04)" />
                                    {/* Equator */}
                                    <line x1="40" y1="200" x2="360" y2="200" stroke="#4A90E2" strokeWidth="1" opacity="0.4" />
                                    {/* Markers */}
                                    {[
                                        { cx: 185, cy: 165 },
                                        { cx: 248, cy: 195 },
                                        { cx: 160, cy: 240 },
                                    ].map((m, i) => (
                                        <g key={i}>
                                            <circle cx={m.cx} cy={m.cy} r="5" fill="#FF6B6B" opacity="0.9" />
                                            <circle cx={m.cx} cy={m.cy} r="9" fill="transparent" stroke="#FF6B6B" strokeWidth="1.5" opacity="0.5" />
                                        </g>
                                    ))}
                                </svg>

                                {/* Floating info cards */}
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-4 -right-8 glass rounded-2xl p-3 flex items-center gap-3"
                                    style={{ border: '1px solid rgba(74,144,226,0.3)', minWidth: 160 }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(74,144,226,0.2)' }}>✈️</div>
                                    <div>
                                        <div className="text-xs font-semibold" style={{ color: '#fff' }}>Goa, India</div>
                                        <div className="text-xs" style={{ color: '#A0AEC0' }}>3 days · ₹28,000</div>
                                    </div>
                                </motion.div>

                                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 0.8 }}
                                    className="absolute -bottom-2 -left-8 glass rounded-2xl p-3 flex items-center gap-3"
                                    style={{ border: '1px solid rgba(80,201,206,0.3)', minWidth: 170 }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(80,201,206,0.2)' }}>🤖</div>
                                    <div>
                                        <div className="text-xs font-semibold" style={{ color: '#fff' }}>RAHI AI</div>
                                        <div className="text-xs" style={{ color: '#50C9CE' }}>Itinerary ready ✓</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll indicator */}
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
                        onClick={scrollToPlanner}>
                        <span className="text-xs" style={{ color: '#A0AEC0' }}>Scroll to plan</span>
                        <ChevronDown size={20} style={{ color: '#4A90E2' }} />
                    </motion.div>
                </div>
            </section>

            {/* ── TRAVEL STYLE SELECTOR ── */}
            <section className="py-20 container">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <div className="text-center mb-12">
                        <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#4A90E2' }}>Find Your Style</span>
                        <h2 className="text-4xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Who's Traveling?</h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {TRAVEL_STYLES.map((style, i) => (
                            <motion.button key={style.id}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -4, scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => { handleStyleSelect(style.id); scrollToPlanner() }}
                                className="card flex flex-col items-center gap-2 p-4 cursor-pointer transition-all"
                                style={{
                                    background: formData.travelerType === style.id
                                        ? 'linear-gradient(135deg, rgba(74,144,226,0.2), rgba(80,201,206,0.2))'
                                        : 'var(--card-surface)',
                                    borderColor: formData.travelerType === style.id ? '#4A90E2' : 'var(--border-color)',
                                    borderWidth: formData.travelerType === style.id ? '2px' : '1px',
                                }}>
                                <span className="text-3xl">{style.icon}</span>
                                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{style.name}</span>
                                <span className="text-xs text-center hidden sm:block" style={{ color: 'var(--text-secondary)' }}>{style.desc}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── AI PLANNER FORM ── */}
            <section id="planner" className="py-16" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <div className="text-center mb-10">
                            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#4A90E2' }}>AI Planner</span>
                            <h2 className="text-4xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                                Build Your Perfect Trip
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Powered by Google Gemini — your personal AI travel companion RAHI</p>
                        </div>

                        <div className="max-w-3xl mx-auto">
                            <div className="card" style={{ background: 'var(--card-surface)', border: '1px solid var(--border-color)' }}>
                                {/* Gradient header bar */}
                                <div className="h-1.5 rounded-t-2xl mb-6 -mx-6 -mt-6"
                                    style={{ background: 'linear-gradient(90deg, #4A90E2, #50C9CE, #FFD93D)' }} />

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                <MapPin size={14} className="inline mr-1" style={{ color: '#4A90E2' }} />
                                                Destination
                                            </label>
                                            <input name="destination" value={formData.destination} onChange={handleChange}
                                                placeholder="e.g. Goa, Manali, Rajasthan…" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                <Calendar size={14} className="inline mr-1" style={{ color: '#4A90E2' }} />
                                                Duration (days)
                                            </label>
                                            <input type="number" name="days" min="1" max="30" value={formData.days} onChange={handleChange} required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                <Wallet size={14} className="inline mr-1" style={{ color: '#4A90E2' }} />
                                                Budget (₹)
                                            </label>
                                            <input type="number" name="budget" placeholder="e.g. 30000" value={formData.budget} onChange={handleChange} required />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Travel Style</label>
                                            <select name="travelerType" value={formData.travelerType} onChange={handleChange}>
                                                {TRAVEL_STYLES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Preferences (optional)</label>
                                            <textarea name="preferences" rows="2"
                                                placeholder="e.g. Vegetarian food, avoid crowded places, beach resorts…"
                                                value={formData.preferences} onChange={handleChange} style={{ resize: 'none' }} />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B' }}>
                                            {error}
                                        </div>
                                    )}

                                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
                                        {loading ? (
                                            <><div className="spinner-sm" /> Generating your perfect journey…</>
                                        ) : (
                                            <><Sparkles size={18} /> Generate AI Itinerary with RAHI</>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── POPULAR DESTINATIONS ── */}
            <section className="py-20 container">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="text-center mb-12">
                        <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#4A90E2' }}>Explore</span>
                        <h2 className="text-4xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Popular Destinations</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {DESTINATIONS.map((dest, i) => (
                            <motion.div key={dest.name}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }} className="relative overflow-hidden rounded-2xl cursor-pointer group"
                                onClick={() => { setFormData(p => ({ ...p, destination: dest.name })); scrollToPlanner() }}>
                                <div className="h-64 overflow-hidden">
                                    <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full mb-2 inline-block"
                                        style={{ background: 'rgba(74,144,226,0.9)', color: '#fff' }}>{dest.tag}</span>
                                    <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={12} fill="#FFD93D" color="#FFD93D" />
                                        <span className="text-sm" style={{ color: '#FFD93D' }}>{dest.rating}</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                                    <div className="btn btn-sm btn-primary">
                                        Plan Trip <ArrowRight size={14} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/explore" className="btn btn-outline btn-lg">
                            View All Destinations <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="text-center mb-12">
                            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#4A90E2' }}>Why TRAVLO</span>
                            <h2 className="text-4xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Everything You Need</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {FEATURES.map((feat, i) => (
                                <motion.div key={feat.title}
                                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -6 }} className="card p-6">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: 'linear-gradient(135deg, rgba(74,144,226,0.2), rgba(80,201,206,0.15))', color: '#4A90E2' }}>
                                        {feat.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-20" style={{ background: 'linear-gradient(135deg, #0F1928, #1E2D3D)' }}>
                <div className="container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {STATS.map((stat, i) => (
                            <motion.div key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <div className="text-5xl font-black mb-2 gradient-text">{stat.num}</div>
                                <div className="text-sm" style={{ color: '#A0AEC0' }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-20 container">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="text-center mb-12">
                        <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#4A90E2' }}>Reviews</span>
                        <h2 className="text-4xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>Travelers Love TRAVLO</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={t.name}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                                className="card p-6">
                                <div className="flex mb-3">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#FFD93D" color="#FFD93D" />)}
                                </div>
                                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #4A90E2, #50C9CE)' }}>
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24" style={{ background: 'linear-gradient(135deg, #0F1928, #1E2D3D)' }}>
                <div className="container text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass text-sm"
                            style={{ color: '#50C9CE', border: '1px solid rgba(80,201,206,0.3)' }}>
                            <Globe size={14} /> Start your journey today
                        </div>
                        <h2 className="text-5xl font-black mb-4 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Your Dream Trip <span className="gradient-text">Awaits</span>
                        </h2>
                        <p className="text-lg mb-8 mx-auto max-w-xl" style={{ color: '#A0AEC0' }}>
                            Let RAHI, your AI travel companion, design the perfect itinerary for you. Free. Instant. Unforgettable.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                onClick={isAuthenticated ? scrollToPlanner : () => navigate('/signup')}
                                className="btn btn-primary btn-lg">
                                {isAuthenticated ? <><Sparkles size={18} /> Plan My Trip Now</> : <><ArrowRight size={18} /> Get Started — It's Free</>}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/explore')} className="btn btn-outline btn-lg"
                                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                                <Compass size={18} /> Explore Destinations
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ background: '#080E1B', borderTop: '1px solid rgba(74,144,226,0.15)' }}>
                <div className="container py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="text-2xl font-black mb-3 gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>TRAVLO</div>
                            <p className="text-sm" style={{ color: '#A0AEC0' }}>AI-powered travel planning for every type of traveler.</p>
                        </div>
                        {[
                            { title: 'Product', links: ['AI Planner', 'Explore', 'Maps', 'RAHI Chat'] },
                            { title: 'Features', links: ['Budget Planner', 'Weather', 'My Trips', 'Currency'] },
                            { title: 'Company', links: ['About', 'Privacy Policy', 'Terms', 'Contact'] },
                        ].map(col => (
                            <div key={col.title}>
                                <div className="font-semibold mb-3 text-sm" style={{ color: '#fff' }}>{col.title}</div>
                                <ul className="space-y-2">
                                    {col.links.map(link => (
                                        <li key={link}><a href="#" className="text-sm transition-colors hover:text-blue-400" style={{ color: '#A0AEC0' }}>{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4"
                        style={{ borderTop: '1px solid rgba(74,144,226,0.1)' }}>
                        <p className="text-sm" style={{ color: '#A0AEC0' }}>© 2024 TRAVLO AI. All rights reserved.</p>
                        <p className="text-sm flex items-center gap-1" style={{ color: '#A0AEC0' }}>
                            Made with <Heart size={14} fill="#FF6B6B" color="#FF6B6B" /> for travelers everywhere
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
