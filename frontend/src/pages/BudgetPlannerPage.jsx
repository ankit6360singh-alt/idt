import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Calculator, DollarSign, WalletCards, Settings2, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BudgetPlannerPage = () => {
    const [budget, setBudget] = useState(50000)
    const [days, setDays] = useState(5)
    const [travelers, setTravelers] = useState(2)
    const [style, setStyle] = useState('comfort')
    const [breakdown, setBreakdown] = useState(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const handleCalculate = (e) => {
        e?.preventDefault()
        setIsCalculating(true)

        setTimeout(() => {
            // Rough logic for estimating weights based on style
            const weights = style === 'luxury' ? [0.45, 0.20, 0.15, 0.10, 0.10]
                : style === 'budget' ? [0.25, 0.35, 0.20, 0.15, 0.05]
                    : [0.35, 0.25, 0.20, 0.15, 0.05] // comfort

            setBreakdown([
                { name: 'Accommodation', value: Math.round(budget * weights[0]), color: '#4A90E2', icon: '🏨' },
                { name: 'Food & Dining', value: Math.round(budget * weights[1]), color: '#50C9CE', icon: '🍽️' },
                { name: 'Transportation', value: Math.round(budget * weights[2]), color: '#FF6B6B', icon: '🚕' },
                { name: 'Attractions', value: Math.round(budget * weights[3]), color: '#FFD93D', icon: '🎟️' },
                { name: 'Emergency/Misc', value: Math.round(budget * weights[4]), color: '#9B51E0', icon: '🛡️' }
            ])
            setIsCalculating(false)
        }, 800)
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] py-10 px-4 sm:px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-0 right-72 w-96 h-96 bg-[var(--secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[rgba(74,144,226,0.1)] text-[var(--primary)] mb-4">
                        <Calculator size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold font-outfit tracking-tight mb-4">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">Budget Planner</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Plan you finances ahead of time. See a realistic breakdown of your travel expenses based on real-world averages.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Inputs */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleCalculate} className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft">
                            <h2 className="text-xl font-bold font-outfit flex items-center gap-2 mb-6">
                                <Settings2 className="text-[var(--primary)]" size={20} /> Trip Details
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Total Budget (₹)</label>
                                    <div className="relative">
                                        <WalletCards className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" size={18} />
                                        <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value) || 0)} min="1000"
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[var(--primary)] font-bold text-lg" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Days</label>
                                        <input type="number" value={days} onChange={e => setDays(Number(e.target.value) || 1)} min="1" max="60"
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] text-center text-lg font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Travelers</label>
                                        <input type="number" value={travelers} onChange={e => setTravelers(Number(e.target.value) || 1)} min="1" max="20"
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] text-center text-lg font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Travel Style</label>
                                    <div className="flex bg-[var(--bg-primary)] rounded-xl p-1 border border-[var(--border-color)]">
                                        {['budget', 'comfort', 'luxury'].map(s => (
                                            <button key={s} type="button" onClick={() => setStyle(s)}
                                                className={`flex-1 py-2 text-sm font-medium capitalize rounded-lg transition-all ${style === s ? 'bg-[var(--card-surface)] shadow text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={isCalculating} className="w-full btn-primary py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 mt-4">
                                    {isCalculating ? <RefreshCw className="animate-spin" size={18} /> : <DollarSign size={18} />}
                                    {isCalculating ? 'Calculating...' : 'Generate Breakdown'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Output */}
                    <div className="lg:col-span-7">
                        {breakdown ? (
                            <AnimatePresence mode="wait">
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft h-full flex flex-col justify-center">

                                    <div className="text-center mb-6">
                                        <p className="text-[var(--text-secondary)] font-medium">Estimated Breakdown for</p>
                                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                                            ₹{budget.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            {days} Days · {travelers} Traveler(s) · <span className="capitalize">{style}</span> style
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={breakdown} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                                        {breakdown.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                                    </Pie>
                                                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="space-y-3">
                                            {breakdown.map(item => (
                                                <div key={item.name} className="flex justify-between items-center p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 hover:border-[var(--primary)]/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{item.icon}</span>
                                                        <span className="text-sm font-medium">{item.name}</span>
                                                    </div>
                                                    <div className="font-bold font-outfit" style={{ color: item.color }}>
                                                        ₹{item.value.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="mt-4 p-3 rounded-xl bg-[rgba(80,201,206,0.1)] border border-[rgba(80,201,206,0.2)] text-xs text-[var(--secondary)] flex gap-2">
                                                <span className="shrink-0 text-[16px]">💡</span>
                                                <span>This is an estimate. Actual expenses may vary based on destination season and local inflation.</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="glass-card rounded-3xl p-8 shadow-soft h-full flex flex-col items-center justify-center text-center opacity-70 min-h-[400px]">
                                <div className="w-20 h-20 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mb-6">
                                    <PieChart size={32} className="text-[var(--text-secondary)] opacity-50" />
                                </div>
                                <h3 className="text-xl font-bold font-outfit mb-2">No Data Yet</h3>
                                <p className="text-[var(--text-secondary)] max-w-sm">Enter your budget details and click "Generate Breakdown" to see a visual estimation of your expenses.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BudgetPlannerPage
