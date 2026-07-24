import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, LogIn } from 'lucide-react'

const LoginPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const from = location.state?.from?.pathname || '/dashboard'

    const [form, setForm] = useState({ email: '', password: '', remember: false })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true); setError('')
        const result = await login(form.email, form.password)
        if (result.success) {
            if (!form.remember) {
                // Non-persistent: clear token on tab close (handled by AuthContext localStorage)
            }
            navigate(from, { replace: true })
        } else {
            setError(result.error || 'Login failed')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left panel — hero image */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0F1928,#1E2D3D)' }}>
                <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80"
                    alt="Travel" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col justify-center px-16 z-10">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <Link to="/" className="text-3xl font-black gradient-text mb-8 inline-block" style={{ fontFamily: 'Outfit, sans-serif' }}>TRAVLO</Link>
                        <h2 className="text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Your next<br /><span className="gradient-text">adventure</span><br />is waiting.
                        </h2>
                        <p style={{ color: '#A0AEC0' }}>Join thousands of travelers who plan smarter with RAHI.</p>
                        <div className="flex gap-6 mt-12">
                            {[['50K+', 'Trips'], ['200+', 'Destinations'], ['98%', 'Satisfaction']].map(([n, l]) => (
                                <div key={l}>
                                    <div className="text-2xl font-bold gradient-text">{n}</div>
                                    <div className="text-xs" style={{ color: '#A0AEC0' }}>{l}</div>
                                </div>
                            ))}
                        </div>
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
                            Welcome back 👋
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account? <Link to="/signup" className="font-semibold" style={{ color: '#4A90E2' }}>Sign up free</Link>
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    placeholder="••••••••" required style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} />
                                <button type="button" onClick={() => setShowPwd(s => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                                <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange}
                                    className="rounded" style={{ width: 'auto' }} />
                                Remember me
                            </label>
                            <a href="#" style={{ color: '#4A90E2' }}>Forgot password?</a>
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
                            {loading ? <><div className="spinner-sm" />Logging in…</> : <><LogIn size={18} />Login to TRAVLO</>}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            By logging in you agree to our <a href="#" style={{ color: '#4A90E2' }}>Terms</a> and <a href="#" style={{ color: '#4A90E2' }}>Privacy Policy</a>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default LoginPage
