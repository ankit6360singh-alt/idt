import { useState, useEffect, useRef } from 'react'
import './VoiceAssistant.css'

const VoiceAssistant = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! I\'m RAHI, your AI travel assistant. How can I help you plan your perfect trip?' }
    ])
    const [inputText, setInputText] = useState('')

    const recognitionRef = useRef(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = 'en-US'

            recognitionRef.current.onresult = (event) => {
                const speechResult = event.results[0][0].transcript
                setTranscript(speechResult)
                handleSendMessage(speechResult)
                setIsListening(false)
            }

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const startListening = () => {
        if (recognitionRef.current) {
            setIsListening(true)
            recognitionRef.current.start()
        } else {
            alert('Speech recognition is not supported in your browser. Please use Chrome.')
        }
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1
            utterance.pitch = 1
            utterance.volume = 1
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleSendMessage = async (message) => {
        const userMessage = message || inputText
        if (!userMessage.trim()) return

        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: userMessage }])
        setInputText('')

        try {
            // Send to backend
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            })

            const data = await response.json()

            // Add bot response
            setMessages(prev => [...prev, { type: 'bot', text: data.response }])

            // Speak the response
            speak(data.response)
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMsg = 'Sorry, I encountered an error. Please try again.'
            setMessages(prev => [...prev, { type: 'bot', text: errorMsg }])
            speak(errorMsg)
        }
    }

    return (
        <>
            {/* Floating Button */}
            <button
                className={`voice-assistant-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle voice assistant"
            >
                🤖
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="voice-assistant-window">
                    <div className="assistant-header">
                        <div className="assistant-title">
                            <span className="assistant-icon">🤖</span>
                            <div>
                                <h3>RAHI</h3>
                                <p>AI Travel Assistant</p>
                            </div>
                        </div>
                        <button
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close assistant"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="messages-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-container">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            disabled={isListening}
                        />

                        <button
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopListening : startListening}
                            aria-label={isListening ? 'Stop listening' : 'Start listening'}
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>

                        <button
                            className="send-btn"
                            onClick={() => handleSendMessage()}
                            disabled={!inputText.trim()}
                            aria-label="Send message"
                        >
                            ➤
                        </button>
                    </div>

                    {isListening && (
                        <div className="listening-indicator">
                            <div className="pulse"></div>
                            <span>Listening...</span>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default VoiceAssistant
