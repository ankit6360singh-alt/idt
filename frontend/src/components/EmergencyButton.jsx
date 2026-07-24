import { useState } from 'react'
import './EmergencyButton.css'

const EmergencyButton = () => {
    const [isOpen, setIsOpen] = useState(false)

    const emergencyContacts = [
        { name: 'Police', number: '100', icon: '🚓' },
        { name: 'Ambulance', number: '108', icon: '🚑' },
        { name: 'Women Helpline', number: '1091', icon: '👮‍♀️' },
        { name: 'Tourist Helpline', number: '1363', icon: '🏛️' },
        { name: 'Disaster Management', number: '108', icon: '🆘' }
    ]

    return (
        <>
            <button
                className="emergency-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Emergency contacts"
            >
                🆘
            </button>

            {isOpen && (
                <div className="emergency-panel">
                    <div className="emergency-header">
                        <h3>Emergency Contacts</h3>
                        <button
                            className="close-emergency"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close emergency panel"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="emergency-list">
                        {emergencyContacts.map((contact, index) => (
                            <a
                                key={index}
                                href={`tel:${contact.number}`}
                                className="emergency-contact"
                            >
                                <span className="contact-icon">{contact.icon}</span>
                                <div className="contact-info">
                                    <strong>{contact.name}</strong>
                                    <span className="contact-number">{contact.number}</span>
                                </div>
                                <span className="call-icon">📞</span>
                            </a>
                        ))}
                    </div>

                    <div className="emergency-tips">
                        <h4>Safety Tips</h4>
                        <ul>
                            <li>Share your location with trusted contacts</li>
                            <li>Keep emergency numbers saved in your phone</li>
                            <li>Stay in well-lit, populated areas at night</li>
                            <li>Trust your instincts</li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    )
}

export default EmergencyButton
