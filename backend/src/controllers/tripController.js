import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Destination from '../models/Destination.js';
import Hotel from '../models/Hotel.js';
import Attraction from '../models/Attraction.js';
import Restaurant from '../models/Restaurant.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateTripItinerary = async (req, res, next) => {
  try {
    const { destination, days = 3, budget = 30000, travelerType = 'solo', preferences = '' } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination is required' });
    }

    const numDays = parseInt(days) || 3;
    const numBudget = parseFloat(budget) || 30000;

    let aiItinerary = null;

    // 1. Try generating via Google Gemini AI if API key is set
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate a detailed ${numDays}-day travel itinerary for ${destination} for a ${travelerType} traveler with a total budget of ₹${numBudget}. 
        Return ONLY valid JSON matching this structure:
        {
          "destination": "${destination}",
          "days": ${numDays},
          "budget": ${numBudget},
          "travelerType": "${travelerType}",
          "itinerary": [
            {
              "day": 1,
              "theme": "Day 1 Theme",
              "morning": { "title": "Morning Activity", "desc": "Description", "time": "9:00 AM", "cost": 1000, "icon": "☕" },
              "afternoon": { "title": "Afternoon Activity", "desc": "Description", "time": "2:00 PM", "cost": 1500, "icon": "🏖️" },
              "evening": { "title": "Evening Activity", "desc": "Description", "time": "7:00 PM", "cost": 2500, "icon": "🌅" },
              "estimatedCost": 5000,
              "weather": { "temp": 28, "condition": "Sunny", "icon": "☀️" }
            }
          ],
          "hotels": [
            { "name": "Recommended Hotel", "price": 4000, "rating": 4.7, "amenities": ["WiFi", "Pool"] }
          ],
          "safetyTips": ["Stay hydrated", "Keep emergency contacts ready"],
          "packingTips": ["Comfortable shoes", "Sunscreen", "Light cotton clothes"],
          "totalBudget": ${numBudget}
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiItinerary = JSON.parse(jsonMatch[0]);
        }
      } catch (aiErr) {
        console.warn('[Gemini AI Warning] Falling back to intelligent structured generator:', aiErr.message);
      }
    }

    // 2. Structured fallback generator
    if (!aiItinerary) {
      const dailyCost = Math.round(numBudget / numDays);
      const itineraryDays = [];

      for (let d = 1; d <= numDays; d++) {
        itineraryDays.push({
          day: d,
          theme: d === 1 ? 'Arrival & Neighborhood Highlights' : d === numDays ? 'Farewell & Souvenir Shopping' : 'Cultural & Scenic Exploration',
          morning: {
            title: `Morning Exploration in ${destination}`,
            desc: `Check-in, enjoy authentic local breakfast and visit top iconic landmarks.`,
            time: '9:00 AM - 12:30 PM',
            cost: Math.round(dailyCost * 0.25),
            icon: '☕',
          },
          afternoon: {
            title: `Afternoon Sightseeing & Local Cuisine`,
            desc: `Guided tour through top attractions, scenic parks, and famous eateries.`,
            time: '1:30 PM - 5:00 PM',
            cost: Math.round(dailyCost * 0.35),
            icon: '📍',
          },
          evening: {
            title: `Evening Sunset & Dining Experience`,
            desc: `Unwind with sunset views, vibrant street markets, and authentic dinner.`,
            time: '6:30 PM - 9:30 PM',
            cost: Math.round(dailyCost * 0.40),
            icon: '🌅',
          },
          estimatedCost: dailyCost,
          weather: { temp: 26 + (d % 4), condition: 'Clear & Pleasant', icon: '☀️' },
        });
      }

      aiItinerary = {
        destination,
        days: numDays,
        budget: numBudget,
        travelerType,
        itinerary: itineraryDays,
        hotels: [
          { name: `Grand ${destination} Boutique Hotel`, price: Math.round(dailyCost * 0.8), rating: 4.8, amenities: ['WiFi', 'Breakfast', 'Pool'] },
          { name: `${destination} City Center Stay`, price: Math.round(dailyCost * 0.5), rating: 4.5, amenities: ['WiFi', 'Air Conditioning'] },
        ],
        safetyTips: [
          'Keep your phone charged and save local emergency numbers.',
          'Use verified taxi apps or public transport during late hours.',
        ],
        packingTips: [
          'Comfortable walking shoes and light breathable clothing.',
          'Personal first-aid kit, power bank, and universal adapter.',
        ],
        totalBudget: numBudget,
      };
    }

    res.status(200).json(aiItinerary);
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user._id,
    };

    const trip = await Trip.create(tripData);

    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdTrips: trip._id },
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, destination, sort = '-createdAt' } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (destination) query.destination = new RegExp(destination, 'i');

    const trips = await Trip.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('destinationId');

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin' && !trip.isPublic) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this trip' });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this trip' });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdTrips: req.params.id, savedTrips: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
