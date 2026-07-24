import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Map, Compass, LayoutDashboard, Bookmark, User,
    LogOut, LogIn, Moon, Sun, Menu, X, Sparkles, Wallet
} from 'lucide-react'

const NAV_LINKS = [
    { to: '/explore', icon: <Compass size={15} />, label: 'Explore' },
    { to: '/map', icon: <Map size={15} />, label: 'Map' },
    { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { to: '/my-trips', icon: <Bookmark size={15} />, label: 'My Trips' },
    { to: '/budget', icon: <Wallet size={15} />, label: 'Budget' },
]

const getStoredTheme = () => localStorage.getItem('travlo_theme') || 'light'
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

    useEffect(() => { applyTheme(theme) }, [])

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

    const isHeroPage = location.pathname === '/'
    const navBg = scrolled
        ? (theme === 'dark' ? 'rgba(10,10,10,0.96)' : 'rgba(245,197,24,0.97)')
        : 'transparent'
    const textColor = theme === 'dark' ? '#F5C518' : '#0A0A0A'

    return (
        <>
            <motion.nav
                initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 5vw', height: '64px',
                    background: navBg,
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.3s ease',
                }}>

                {/* Logo */}
                <Link to="/" style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800, fontSize: '22px',
                    color: textColor,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    textDecoration: 'none',
                }}>
                    TRAVLO
                    <span style={{
                        fontSize: '10px', fontWeight: 700,
                        background: '#0A0A0A', color: '#F5C518',
                        padding: '2px 8px', borderRadius: '100px',
                        letterSpacing: '0.5px',
                    }}>AI</span>
                </Link>

                {/* Desktop nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    className="hidden md:flex">
                    {NAV_LINKS.map(link => (
                        <Link key={link.to} to={link.to}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '100px',
                                fontSize: '14px', fontWeight: 600,
                                color: isActive(link.to) ? (theme === 'dark' ? '#0A0A0A' : '#fff') : textColor,
                                background: isActive(link.to)
                                    ? (theme === 'dark' ? '#F5C518' : '#0A0A0A')
                                    : 'transparent',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                opacity: isActive(link.to) ? 1 : 0.7,
                            }}
                            onMouseEnter={e => {
                                if (!isActive(link.to)) {
                                    e.currentTarget.style.opacity = '1'
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.08)'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive(link.to)) {
                                    e.currentTarget.style.opacity = '0.7'
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}>
                            {link.icon} {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Theme toggle */}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.1)',
                            border: 'none', cursor: 'pointer',
                            color: textColor,
                        }}>
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </motion.button>

                    {isAuthenticated ? (
                        <div style={{ position: 'relative' }}>
                            <motion.button whileTap={{ scale: 0.95 }}
                                onClick={() => setUserMenu(m => !m)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '6px 12px 6px 6px', borderRadius: '100px',
                                    background: '#0A0A0A', border: 'none', cursor: 'pointer',
                                }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: '#F5C518',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: 800, color: '#0A0A0A',
                                }}>
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}
                                    className="hidden sm:inline">
                                    {user?.name?.split(' ')[0]}
                                </span>
                            </motion.button>

                            <AnimatePresence>
                                {userMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute', right: 0, top: '48px',
                                            width: '200px', borderRadius: '16px',
                                            background: '#fff', boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            overflow: 'hidden', zIndex: 50,
                                        }}>
                                        {[
                                            { icon: <User size={14} />, label: 'Profile', to: '/profile' },
                                            { icon: <Bookmark size={14} />, label: 'My Trips', to: '/my-trips' },
                                        ].map(item => (
                                            <button key={item.label}
                                                onClick={() => { navigate(item.to); setUserMenu(false) }}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '12px 16px', fontSize: '14px', fontWeight: 600,
                                                    color: '#0A0A0A', background: 'transparent',
                                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <span style={{ color: '#F5C518' }}>{item.icon}</span> {item.label}
                                            </button>
                                        ))}
                                        <div style={{ borderTop: '1px solid #F0F0F0' }}>
                                            <button onClick={handleLogout}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '12px 16px', fontSize: '14px', fontWeight: 600,
                                                    color: '#E53E3E', background: 'transparent',
                                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <LogOut size={14} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '8px', display: 'flex' }}>
                            <Link to="/login"
                                style={{
                                    padding: '8px 18px', borderRadius: '100px',
                                    fontSize: '14px', fontWeight: 700,
                                    color: textColor, textDecoration: 'none',
                                    border: '2px solid rgba(0,0,0,0.18)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                                Log in
                            </Link>
                            <Link to="/signup"
                                style={{
                                    padding: '8px 18px', borderRadius: '100px',
                                    fontSize: '14px', fontWeight: 700,
                                    background: '#0A0A0A', color: '#F5C518',
                                    textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
                                <Sparkles size={13} /> Get started
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden"
                        onClick={() => setOpen(o => !o)}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.1)', border: 'none',
                            cursor: 'pointer', color: textColor,
                        }}>
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 40,
                            background: theme === 'dark' ? '#0A0A0A' : '#F5C518',
                            borderBottom: '1px solid rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                        }}>
                        <div style={{ padding: '16px 5vw', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {NAV_LINKS.map(link => (
                                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '12px 16px', borderRadius: '12px',
                                        fontSize: '15px', fontWeight: 600,
                                        color: isActive(link.to) ? '#fff' : textColor,
                                        background: isActive(link.to) ? '#0A0A0A' : 'transparent',
                                        textDecoration: 'none', transition: 'all 0.2s',
                                    }}>
                                    {link.icon} {link.label}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '8px' }}>
                                    <Link to="/login" onClick={() => setOpen(false)}
                                        style={{
                                            flex: 1, textAlign: 'center', padding: '12px',
                                            borderRadius: '12px', fontWeight: 700, fontSize: '15px',
                                            border: '2px solid rgba(0,0,0,0.2)', color: textColor,
                                            textDecoration: 'none',
                                        }}>Login</Link>
                                    <Link to="/signup" onClick={() => setOpen(false)}
                                        style={{
                                            flex: 1, textAlign: 'center', padding: '12px',
                                            borderRadius: '12px', fontWeight: 700, fontSize: '15px',
                                            background: '#0A0A0A', color: '#F5C518',
                                            textDecoration: 'none',
                                        }}>Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay to close user menu */}
            {userMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setUserMenu(false)} />}
        </>
    )
}

export default Navbar
