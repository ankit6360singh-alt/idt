import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Sparkles, UserPlus } from 'lucide-react'

const SignupPage = () => {
    const navigate = useNavigate()
    const { signup } = useAuth()

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        if (form.password !== form.confirm) return setError('Passwords do not match')
        if (form.password.length < 6) return setError('Password must be at least 6 characters')
        setLoading(true); setError('')
        const result = await signup(form.name, form.email, form.password)
        if (result.success) navigate('/dashboard')
        else setError(result.error || 'Sign up failed')
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0F1928,#1E2D3D)' }}>
                <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80"
                    alt="Travel" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 flex flex-col justify-center px-16 z-10">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <Link to="/" className="text-3xl font-black gradient-text mb-8 inline-block" style={{ fontFamily: 'Outfit, sans-serif' }}>TRAVLO</Link>
                        <h2 className="text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Start your<br /><span className="gradient-text">journey</span><br />for free.
                        </h2>
                        <p style={{ color: '#A0AEC0' }}>RAHI, your AI travel companion, is ready to plan your next perfect trip.</p>
                        {['Personalized AI itineraries', 'Smart budget tracking', 'Interactive maps', 'Offline trip saving'].map(item => (
                            <div key={item} className="flex items-center gap-2 mt-3">
                                <span style={{ color: '#50C9CE' }}>✓</span>
                                <span className="text-sm" style={{ color: '#A0AEC0' }}>{item}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="w-full max-w-md">
                    <Link to="/" className="lg:hidden text-2xl font-black gradient-text inline-block mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>TRAVLO</Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                            Create account 🚀
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Already have one? <Link to="/login" className="font-semibold" style={{ color: '#4A90E2' }}>Log in</Link>
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input name="name" type="text" value={form.name} onChange={handleChange}
                                    placeholder="John Doe" required style={{ paddingLeft: '2.75rem' }} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input name="email" type="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" required style={{ paddingLeft: '2.75rem' }} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange}
                                    placeholder="Min. 6 characters" required style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} />
                                <button type="button" onClick={() => setShowPwd(s => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>Confirm Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                                <input name="confirm" type={showPwd ? 'text' : 'password'} value={form.confirm} onChange={handleChange}
                                    placeholder="Re-enter password" required style={{ paddingLeft: '2.75rem' }} />
                            </div>
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
                            {loading ? <><div className="spinner-sm" />Creating account…</> : <><UserPlus size={18} />Create My Account</>}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            By signing up you agree to our <a href="#" style={{ color: '#4A90E2' }}>Terms</a> and <a href="#" style={{ color: '#4A90E2' }}>Privacy Policy</a>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default SignupPage
