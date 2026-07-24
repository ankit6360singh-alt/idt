import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import EmergencyButton from './components/EmergencyButton'
import ProtectedRoute from './components/ProtectedRoute'
import { Loader } from 'lucide-react'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const MyTripsPage = lazy(() => import('./pages/MyTripsPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const BudgetPlannerPage = lazy(() => import('./pages/BudgetPlannerPage'))

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="animate-spin text-[var(--primary)]" />
            <p className="text-[var(--text-secondary)] font-medium">Loading...</p>
        </div>
    </div>
)

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app flex flex-col min-h-screen relative font-sans text-[var(--text-primary)] bg-[var(--bg-primary)]">
                    <Navbar />
                    <div className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/signup" element={<SignupPage />} />
                                <Route path="/explore" element={<ExplorePage />} />
                                <Route path="/map" element={<MapPage />} />
                                <Route path="/budget" element={<BudgetPlannerPage />} />

                                {/* Dashboard is public — guests can plan & view trips without signing up */}
                                <Route path="/dashboard" element={<Dashboard />} />

                                {/* Protected Routes — login required */}
                                <Route path="/my-trips" element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            </Routes>
                        </Suspense>
                    </div>
                    <EmergencyButton />
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App
