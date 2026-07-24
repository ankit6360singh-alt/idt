import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, MessageSquare, X } from 'lucide-react'

const RAHI_STARTERS = [
    '🗺️ What are must-see places?',
    '🍜 Suggest local restaurants',
    '💰 How can I save on budget?',
    '🧳 What should I pack?',
    '⚠️ Safety tips for solo travel',
]

const RahiChat = ({ tripContext = {} }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `👋 Hi! I'm **RAHI** — your AI travel companion. I'm here to answer any questions about your trip${tripContext.destination ? ` to **${tripContext.destination}**` : ''}.\n\nAsk me anything — restaurants, safety, packing, budget tips, or local secrets! 🌍`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    const scrollDown = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    const send = async (text) => {
        const msg = text || input.trim()
        if (!msg || loading) return
        setInput('')

        const userMsg = { role: 'user', content: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)
        scrollDown()

        try {
            const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
                .map(m => ({ role: m.role, content: m.content }))

            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, history, context: tripContext })
            })
            const data = await res.json()

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || 'I had trouble responding. Please try again.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ I\'m having trouble connecting. Please check your internet connection and try again.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        } finally {
            setLoading(false)
            scrollDown()
        }
    }

    return (
        <div className="flex flex-col h-full" style={{ minHeight: 500 }}>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, rgba(74,144,226,0.15), rgba(80,201,206,0.1))', borderBottom: '1px solid var(--border-color)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg,#4A90E2,#50C9CE)' }}>🤖</div>
                <div>
                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>RAHI</div>
                    <div className="text-xs flex items-center gap-1" style={{ color: '#50C9CE' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        AI Travel Companion · Online
                    </div>
                </div>
                <Sparkles size={16} className="ml-auto" style={{ color: '#4A90E2' }} />
            </div>

            {/* Quick starters */}
            {messages.length <= 1 && (
                <div className="p-3 flex flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {RAHI_STARTERS.map(s => (
                        <button key={s} onClick={() => send(s)}
                            className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                            style={{ background: 'rgba(74,144,226,0.1)', color: '#4A90E2', border: '1px solid rgba(74,144,226,0.25)', cursor: 'pointer' }}>
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 420 }}>
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white ${msg.role === 'user' ? '' : ''}`}
                                style={{ background: msg.role === 'user' ? 'linear-gradient(135deg,#FF6B6B,#FFD93D)' : 'linear-gradient(135deg,#4A90E2,#50C9CE)' }}>
                                {msg.role === 'user' ? <User size={14} /> : '🤖'}
                            </div>
                            {/* Bubble */}
                            <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                style={{
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg,#4A90E2,#50C9CE)'
                                        : 'var(--card-surface)',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                }}>
                                <div className="markdown-body text-sm">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                                <div className={`text-xs mt-1.5 opacity-60`}>{msg.time}</div>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                style={{ background: 'linear-gradient(135deg,#4A90E2,#50C9CE)' }}>🤖</div>
                            <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
                                style={{ background: 'var(--card-surface)', border: '1px solid var(--border-color)' }}>
                                {[0, 1, 2].map(i => (
                                    <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                        className="w-2 h-2 rounded-full" style={{ background: '#4A90E2' }} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Ask RAHI anything about your trip…"
                    disabled={loading}
                    style={{ flex: 1 }}
                />
                <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: input.trim() ? 'linear-gradient(135deg,#4A90E2,#50C9CE)' : 'var(--border-color)',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        border: 'none',
                        color: '#fff',
                        transition: 'all 0.2s'
                    }}>
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    )
}

export default RahiChat
