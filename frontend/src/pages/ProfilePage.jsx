import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Settings, Globe, CreditCard, Moon, Sun, Camera, Save, LogOut } from 'lucide-react'

const ProfilePage = () => {
    const { user, logout } = useAuth()

    const [preferences, setPreferences] = useState({
        name: user?.name || 'Traveler',
        email: user?.email || 'traveler@example.com',
        language: 'English',
        currency: 'INR (₹)',
        theme: 'System Default'
    })

    const handleSave = (e) => {
        e.preventDefault()
        alert('Profile preferences saved successfully!')
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-outfit">Your <span className="text-[var(--primary)]">Profile</span></h1>
                    <p className="text-[var(--text-secondary)]">Manage your account settings and travel preferences.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="glass-card rounded-2xl p-6 shadow-soft text-center group cursor-pointer relative overflow-hidden">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] p-1 relative">
                                <div className="w-full h-full rounded-full border-4 border-[var(--bg-primary)] overflow-hidden bg-white">
                                    <img src={`https://ui-avatars.com/api/?name=${preferences.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <h3 className="font-bold font-outfit mt-4 text-lg">{preferences.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)]">{preferences.email}</p>

                            <button onClick={logout} className="mt-6 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm font-bold">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>

                        <div className="glass-card rounded-2xl overflow-hidden shadow-soft">
                            <ul className="text-sm font-medium text-[var(--text-secondary)]">
                                <li className="flex items-center gap-3 p-4 bg-[var(--primary)]/10 text-[var(--primary)] border-l-2 border-[var(--primary)]">
                                    <Settings size={18} /> Account Settings
                                </li>
                                <li className="flex items-center gap-3 p-4 hover:bg-[var(--card-surface)] cursor-pointer transition-colors border-l-2 border-transparent">
                                    <Globe size={18} /> Travel History
                                </li>
                                <li className="flex items-center gap-3 p-4 hover:bg-[var(--card-surface)] cursor-pointer transition-colors border-l-2 border-transparent">
                                    <CreditCard size={18} /> Billing & Plans
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 sm:p-8 shadow-soft">
                            <h2 className="text-xl font-bold font-outfit mb-6 pb-2 border-b border-[var(--border-color)]">Personal Information</h2>

                            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Full Name</label>
                                    <input type="text" value={preferences.name} onChange={e => setPreferences({ ...preferences, name: e.target.value })}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
                                    <input type="email" value={preferences.email} disabled
                                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl px-4 py-2.5 opacity-70 cursor-not-allowed" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold font-outfit mb-6 pb-2 border-b border-[var(--border-color)]">Preferences</h2>
                            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Language</label>
                                    <select value={preferences.language} onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none appearance-none">
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>Hindi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Currency</label>
                                    <select value={preferences.currency} onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none appearance-none">
                                        <option>INR (₹)</option>
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                        <option>GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">App Theme</label>
                                    <select value={preferences.theme} onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none appearance-none">
                                        <option>System Default</option>
                                        <option>Light</option>
                                        <option>Dark</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-10">
                                <button type="button" className="px-6 py-2.5 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors font-medium text-sm">
                                    Cancel
                                </button>
                                <button type="submit" className="flex items-center gap-2 btn-primary rounded-full px-6 py-2.5 text-sm font-medium shadow-md hover:shadow-lg">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
