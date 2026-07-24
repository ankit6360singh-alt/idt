import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './UserProfile.css'

const UserProfile = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    const toggleDropdown = () => setIsOpen(!isOpen)

    const handleLogout = () => {
        logout()
        setIsOpen(false)
        navigate('/')
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-nav">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
        )
    }

    return (
        <div className="user-profile-dropdown">
            <button className="profile-trigger" onClick={toggleDropdown}>
                <div className="avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
                <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
            </button>

            {isOpen && (
                <div className="profile-menu">
                    <div className="menu-header">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                    </div>
                    <div className="menu-divider"></div>
                    <Link to="/my-trips" className="menu-item" onClick={() => setIsOpen(false)}>
                        🗺️ My Saved Trips
                    </Link>
                    <Link to="/profile" className="menu-item" onClick={() => setIsOpen(false)}>
                        👤 Profile Settings
                    </Link>
                    <div className="menu-divider"></div>
                    <button className="menu-item logout" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserProfile
