import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Map, Compass, LayoutDashboard, Bookmark, User,
    LogOut, LogIn, Moon, Sun, Menu, X, Sparkles, Wallet
} from 'lucide-react'

const NAV_LINKS = [
    { to: '/explore', icon: <Compass size={16} />, label: 'Explore' },
    { to: '/map', icon: <Map size={16} />, label: 'Map' },
    { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/my-trips', icon: <Bookmark size={16} />, label: 'My Trips' },
    { to: '/budget', icon: <Wallet size={16} />, label: 'Budget' },
]

// Read / write theme to <html data-theme>
const getStoredTheme = () => localStorage.getItem('travlo_theme') || 'dark'
const applyTheme = t => {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('travlo_theme', t)
}

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isAuthenticated, logout } = useAuth()

    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [theme, setTheme] = useState(getStoredTheme)
    const [userMenu, setUserMenu] = useState(false)

    // Apply saved theme on mount
    useEffect(() => { applyTheme(theme) }, [])

    // Scroll shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next); applyTheme(next)
    }

    const handleLogout = () => { logout(); navigate('/'); setUserMenu(false) }

    const isActive = to => location.pathname === to

    return (
        <>
            <motion.nav
                initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all"
                style={{
                    background: scrolled ? 'var(--nav-bg)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
                    boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
                }}>
                {/* Logo */}
                <Link to="/" className="text-xl font-black flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <span className="gradient-text">TRAVLO</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(74,144,226,0.15)', color: '#4A90E2', border: '1px solid rgba(74,144,226,0.3)' }}>
                        AI
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(link => (
                        <Link key={link.to} to={link.to}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-100"
                            style={{
                                color: isActive(link.to) ? '#4A90E2' : 'var(--text-secondary)',
                                background: isActive(link.to) ? 'rgba(74,144,226,0.12)' : 'transparent',
                                opacity: isActive(link.to) ? 1 : 0.8,
                            }}>
                            {link.icon}{link.label}
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {/* Theme toggle */}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(74,144,226,0.1)', color: '#4A90E2' }}>
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </motion.button>

                    {isAuthenticated ? (
                        <div className="relative">
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => setUserMenu(m => !m)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                                style={{ background: 'rgba(74,144,226,0.1)' }}>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg,#4A90E2,#50C9CE)' }}>
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--text-primary)' }}>
                                    {user?.name?.split(' ')[0]}
                                </span>
                            </motion.button>

                            <AnimatePresence>
                                {userMenu && (
                                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden shadow-xl z-50"
                                        style={{ background: 'var(--card-surface)', border: '1px solid var(--border-color)' }}>
                                        {[
                                            { icon: <User size={14} />, label: 'Profile', to: '/profile' },
                                            { icon: <Bookmark size={14} />, label: 'My Trips', to: '/my-trips' },
                                        ].map(item => (
                                            <button key={item.label} onClick={() => { navigate(item.to); setUserMenu(false) }}
                                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-all hover:bg-opacity-50"
                                                style={{ color: 'var(--text-primary)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,144,226,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <span style={{ color: '#4A90E2' }}>{item.icon}</span>{item.label}
                                            </button>
                                        ))}
                                        <div style={{ borderTop: '1px solid var(--border-color)' }}>
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-all"
                                                style={{ color: '#FF6B6B' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <LogOut size={14} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                <LogIn size={15} /> Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">
                                <Sparkles size={15} /> Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <button className="md:hidden w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(74,144,226,0.1)', color: '#4A90E2' }}
                        onClick={() => setOpen(o => !o)}>
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="fixed top-14 left-0 right-0 z-40 overflow-hidden"
                        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)' }}>
                        <div className="p-4 space-y-1">
                            {NAV_LINKS.map(link => (
                                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        color: isActive(link.to) ? '#4A90E2' : 'var(--text-primary)',
                                        background: isActive(link.to) ? 'rgba(74,144,226,0.12)' : 'transparent',
                                    }}>
                                    {link.icon}{link.label}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <div className="flex gap-2 pt-2">
                                    <Link to="/login" onClick={() => setOpen(false)} className="btn btn-outline btn-sm flex-1">Login</Link>
                                    <Link to="/signup" onClick={() => setOpen(false)} className="btn btn-primary btn-sm flex-1">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay to close user menu */}
            {userMenu && <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />}
        </>
    )
}

export default Navbar
