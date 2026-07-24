# TRAVLO - AI-Powered Travel Platform

![TRAVLO](https://img.shields.io/badge/TRAVLO-AI%20Travel%20Platform-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

**TRAVLO** is an intelligent, full-stack AI-powered travel planning platform featuring RAHI, your smart AI travel companion. Plan personalized trips worldwide with real-time AI recommendations, voice assistance, live location features, and comprehensive safety analysis.

## 🌟 Features

### 🤖 AI-Powered Intelligence
- **RAHI AI Assistant**: Conversational chatbot with NLP
- **Voice Assistant**: Speech-to-Text and Text-to-Speech
- **Smart Recommendations**: Weighted scoring algorithm
- **Dynamic Itineraries**: Time-optimized daily plans
- **Budget Optimization**: Intelligent cost allocation

### 🗺️ Advanced Features
- **Live Location Planning**: Generate trips from current location
- **Interactive Maps**: Leaflet integration with markers and routes
- **Weather Intelligence**: Real-time weather-based adjustments
- **Safety Analysis**: Enhanced women-traveler safety features
- **Emergency Helpline**: Quick access to emergency contacts

### 👥 Traveler Categories
- Solo Travelers
- Family Groups
- Friends
- Couples
- Women Travelers (Enhanced Safety)

## 🏗️ Architecture

```
TRAVLO/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/   # VoiceAssistant, MapComponent, EmergencyButton
│   │   ├── pages/        # HomePage, Dashboard
│   │   └── services/     # API integration
│   └── package.json
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # MongoDB schemas
│   │   └── services/     # AI engines
│   └── server.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (optional - works without database)
- Modern browser (Chrome recommended for voice features)

### Installation

1. **Clone and Navigate**
```bash
cd c:\Users\Win11\OneDrive\Documents\idt2
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Configure Environment**
```bash
# Copy .env.example to .env and add your API keys (optional)
cp .env.example .env
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

## 🎯 Usage

1. **Open** `http://localhost:3000` in your browser
2. **Select** your traveler category (Solo, Family, Friends, Couple, Women)
3. **Fill** the trip planner form:
   - Destination
   - Number of days
   - Budget (₹)
   - Preferences (optional)
4. **Click** "Generate Smart Trip with RAHI" or use "Live Location"
5. **View** your AI-generated itinerary with:
   - Day-by-day activities
   - Budget breakdown
   - Interactive map
   - Safety scores
   - Weather forecast

### Voice Assistant
- Click the 🤖 button (bottom right)
- Use microphone 🎤 or type messages
- Ask RAHI about:
  - Trip planning
  - Safety tips
  - Packing lists
  - Budget advice
  - Destination recommendations

### Emergency Features
- Click 🆘 button for emergency contacts
- Quick access to helplines
- Safety tips for travelers

## 🔧 API Endpoints

### Trip Routes
- `POST /api/trip/generate` - Generate AI trip itinerary
- `POST /api/trip/live-location` - Generate trip from current location
- `GET /api/trip/:id` - Retrieve saved trip

### Chat Routes
- `POST /api/chat/message` - RAHI chatbot interaction
- `POST /api/chat/voice` - Voice assistant processing

### Health Check
- `GET /api/health` - Server status

## 🧠 AI Engines

### 1. Recommendation Engine
- Weighted scoring algorithm
- Destination ranking
- Traveler-type personalization
- Preference matching

### 2. Itinerary Generator
- Time-block optimization
- Route distance calculation
- Activity personalization
- Alternative suggestions

### 3. Budget Optimizer
- Smart allocation (35% accommodation, 25% food, 20% attractions, 15% transport, 5% misc)
- Traveler-type adjustments
- Cost recommendations

### 4. Safety Analyzer
- Location-based scoring
- Time-based analysis
- Women-traveler enhanced filtering
- Safe zone identification

### 5. Weather Intelligence
- OpenWeather API integration
- Weather-based itinerary adjustments
- Forecast analysis

## 🎨 Design System

- **Colors**: Soft gradients (blue, teal, sunset tones)
- **Typography**: Inter + Outfit fonts
- **Animations**: Smooth transitions, micro-animations
- **Responsive**: Desktop, tablet, mobile optimized
- **Accessibility**: ARIA labels, keyboard navigation

## 🔐 Security Features

- CORS enabled
- Rate limiting (100 requests/15 min)
- Input validation
- Environment variables for API keys
- Secure MongoDB connection

## 📱 Browser Compatibility

- ✅ Chrome (Recommended - best voice support)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Note**: Voice features work best in Chrome. HTTPS required for voice in production.

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Render/Railway/Heroku)
```bash
cd backend
# Set environment variables
# Deploy with npm start
```

## 🔑 API Keys Setup

1. **OpenWeather API** (Optional)
   - Sign up at: https://openweathermap.org/api
   - Add to `.env`: `OPENWEATHER_API_KEY=your_key`

2. **Google Maps API** (Optional)
   - Enable at: https://console.cloud.google.com
   - Enable: Maps JavaScript API, Places API, Routes API
   - Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key`

**Note**: The app works with demo data without API keys for testing.

## 📊 Database Schema

### Trip Model
- Destination, days, budget, traveler type
- Itinerary with activities
- Budget breakdown
- Safety and travel scores
- Weather data
- Safety tips

### User Model (Optional)
- Preferences
- Travel history
- Saved trips

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- React Router
- Leaflet (Maps)
- Recharts (Visualizations)
- Web Speech API

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- Axios
- CORS, Rate Limiting

## 📝 License

MIT License - Feel free to use for personal or commercial projects

## 🤝 Contributing

This is a production-ready starter template. Feel free to:
- Add more destinations
- Integrate real APIs
- Enhance AI algorithms
- Add user authentication
- Implement payment gateway

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for travelers worldwide**

🌍 **TRAVLO** - Your Smart AI Travel Companion
