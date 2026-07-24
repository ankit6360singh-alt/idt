import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Destination from './models/Destination.js';
import Attraction from './models/Attraction.js';
import Hotel from './models/Hotel.js';
import Restaurant from './models/Restaurant.js';
import Trip from './models/Trip.js';
import Review from './models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travlo';

const sampleDestinations = [
  {
    name: 'Bengaluru',
    country: 'India',
    state: 'Karnataka',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    images: ['https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=800'],
    description: 'The Silicon Valley of India, famous for its tech hubs, lush parks, vibrant pub culture, and pleasant weather year-round.',
    category: 'city',
    averageCostPerDay: 4500,
    bestTimeToVisit: 'October to February',
    popularAttractions: ['Cubbon Park', 'Bangalore Palace', 'Lalbagh Botanical Garden'],
    weatherInfo: { tempRange: '18°C - 30°C', bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'], climateType: 'Tropical Savanna' },
    safetyScore: 9,
    rating: 4.6,
    tags: ['Tech', 'Garden City', 'Pubs', 'Culture'],
    nearbyCities: ['Mysore', 'Coorg', 'Chikmagalur'],
  },
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    location: { type: 'Point', coordinates: [73.8567, 15.2993] },
    images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800'],
    description: 'India’s beach paradise featuring golden sands, Portuguese heritage churches, lively nightlife, and delicious seafood.',
    category: 'beach',
    averageCostPerDay: 5000,
    bestTimeToVisit: 'November to February',
    popularAttractions: ['Baga Beach', 'Basilica of Bom Jesus', 'Dudhsagar Falls'],
    weatherInfo: { tempRange: '20°C - 33°C', bestMonths: ['Nov', 'Dec', 'Jan', 'Feb'], climateType: 'Tropical Monsoon' },
    safetyScore: 9,
    rating: 4.8,
    tags: ['Beach', 'Nightlife', 'Seafood', 'Water Sports'],
    nearbyCities: ['Gokarna', 'Dandeli'],
  },
  {
    name: 'Manali',
    country: 'India',
    state: 'Himachal Pradesh',
    location: { type: 'Point', coordinates: [77.1887, 32.2432] },
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800'],
    description: 'A breathtaking Himalayan resort town renowned for snow sports, pine forests, adventure trekking, and scenic valleys.',
    category: 'mountain',
    averageCostPerDay: 3500,
    bestTimeToVisit: 'October to June',
    popularAttractions: ['Solang Valley', 'Hadimba Temple', 'Rohtang Pass'],
    weatherInfo: { tempRange: '-5°C - 25°C', bestMonths: ['Dec', 'Jan', 'Feb', 'May', 'Jun'], climateType: 'Alpine' },
    safetyScore: 8,
    rating: 4.7,
    tags: ['Snow', 'Mountains', 'Adventure', 'Trekking'],
    nearbyCities: ['Kasol', 'Shimla', 'Dharamshala'],
  },
  {
    name: 'Jaipur',
    country: 'India',
    state: 'Rajasthan',
    location: { type: 'Point', coordinates: [75.7873, 26.9124] },
    images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800'],
    description: 'The Pink City of Rajasthan, steeped in royal history, majestic forts, grand palaces, and rich artisanal handicrafts.',
    category: 'historical',
    averageCostPerDay: 4000,
    bestTimeToVisit: 'November to March',
    popularAttractions: ['Amer Fort', 'Hawa Mahal', 'City Palace'],
    weatherInfo: { tempRange: '10°C - 35°C', bestMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], climateType: 'Semi-Arid' },
    safetyScore: 9,
    rating: 4.8,
    tags: ['Forts', 'Heritage', 'Palaces', 'Royalty'],
    nearbyCities: ['Udaipur', 'Jodhpur', 'Pushkar'],
  },
  {
    name: 'Kashmir',
    country: 'India',
    state: 'Jammu & Kashmir',
    location: { type: 'Point', coordinates: [74.7973, 34.0837] },
    images: ['https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&q=80&w=800'],
    description: 'Paradise on Earth, celebrated for Dal Lake houseboats, shikara rides, Gulmarg gondola skiing, and tulip gardens.',
    category: 'nature',
    averageCostPerDay: 5500,
    bestTimeToVisit: 'March to October',
    popularAttractions: ['Dal Lake', 'Gulmarg Gondola', 'Pahalgam Valley'],
    weatherInfo: { tempRange: '-2°C - 28°C', bestMonths: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], climateType: 'Subtropical Highland' },
    safetyScore: 8,
    rating: 4.9,
    tags: ['Paradise', 'Houseboats', 'Skiing', 'Shikara'],
    nearbyCities: ['Srinagar', 'Gulmarg', 'Sonamarg'],
  },
  {
    name: 'Kerala',
    country: 'India',
    state: 'Kerala',
    location: { type: 'Point', coordinates: [76.2711, 9.9312] },
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800'],
    description: 'God’s Own Country, famed for tranquil Alleppey backwaters, Munnar tea plantations, Ayurvedic wellness, and palm-fringed coastlines.',
    category: 'nature',
    averageCostPerDay: 4800,
    bestTimeToVisit: 'September to March',
    popularAttractions: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Varkala Beach'],
    weatherInfo: { tempRange: '22°C - 32°C', bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'], climateType: 'Tropical Wet' },
    safetyScore: 9,
    rating: 4.9,
    tags: ['Backwaters', 'Ayurveda', 'Tea Gardens', 'Nature'],
    nearbyCities: ['Kochi', 'Alleppey', 'Munnar'],
  },
  {
    name: 'Paris',
    country: 'France',
    state: 'Île-de-France',
    location: { type: 'Point', coordinates: [2.3522, 48.8566] },
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800'],
    description: 'The City of Light, world-renowned for iconic architecture, high fashion, world-class art museums, and gourmet bakeries.',
    category: 'cultural',
    averageCostPerDay: 18000,
    bestTimeToVisit: 'June to August, September to October',
    popularAttractions: ['Eiffel Tower', 'Louvre Museum', 'Cathédrale Notre-Dame'],
    weatherInfo: { tempRange: '5°C - 26°C', bestMonths: ['May', 'Jun', 'Jul', 'Sep', 'Oct'], climateType: 'Oceanic' },
    safetyScore: 9,
    rating: 4.8,
    tags: ['Eiffel Tower', 'Art', 'Fashion', 'Romantic'],
    nearbyCities: ['Versailles', 'Lyon', 'Nice'],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    state: 'Kanto',
    location: { type: 'Point', coordinates: [139.6917, 35.6895] },
    images: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800'],
    description: 'A futuristic metropolis where ultra-modern skyscrapers and neon-lit avenues coexist with historic Shinto shrines.',
    category: 'city',
    averageCostPerDay: 16000,
    bestTimeToVisit: 'March to May, September to November',
    popularAttractions: ['Shibuya Crossing', 'Tokyo Skytree', 'Senso-ji Temple'],
    weatherInfo: { tempRange: '2°C - 31°C', bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'], climateType: 'Humid Subtropical' },
    safetyScore: 10,
    rating: 4.9,
    tags: ['Futuristic', 'Anime', 'Sushi', 'Shrines'],
    nearbyCities: ['Kyoto', 'Osaka', 'Hakone'],
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    state: 'Dubai',
    location: { type: 'Point', coordinates: [55.2708, 25.2048] },
    images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800'],
    description: 'The global luxury hub famous for the Burj Khalifa, desert safaris, mega shopping centers, and artificial islands.',
    category: 'adventure',
    averageCostPerDay: 20000,
    bestTimeToVisit: 'November to March',
    popularAttractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'],
    weatherInfo: { tempRange: '19°C - 41°C', bestMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], climateType: 'Desert' },
    safetyScore: 10,
    rating: 4.8,
    tags: ['Luxury', 'Burj Khalifa', 'Desert Safari', 'Shopping'],
    nearbyCities: ['Abu Dhabi', 'Sharjah'],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    state: 'Bali',
    location: { type: 'Point', coordinates: [115.1889, -8.4095] },
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800'],
    description: 'The Island of Gods, known for volcanic mountains, iconic rice terraces, coral reefs, and spiritual Hindu temples.',
    category: 'island',
    averageCostPerDay: 7000,
    bestTimeToVisit: 'April to October',
    popularAttractions: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Seminyak Beach'],
    weatherInfo: { tempRange: '23°C - 31°C', bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep'], climateType: 'Tropical' },
    safetyScore: 9,
    rating: 4.9,
    tags: ['Islands', 'Temples', 'Surfing', 'Wellness'],
    nearbyCities: ['Lombok', 'Nusa Penida'],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB Atlas');

    // Clear collections
    await User.deleteMany({});
    await Destination.deleteMany({});
    await Attraction.deleteMany({});
    await Hotel.deleteMany({});
    await Restaurant.deleteMany({});
    await Trip.deleteMany({});
    await Review.deleteMany({});

    console.log('[Seed] Collections cleared');

    // Create Admin and Demo User
    const adminUser = await User.create({
      fullName: 'TRAVLO Admin',
      username: 'admin',
      email: 'admin@travlo.ai',
      password: 'Password@123',
      role: 'admin',
      country: 'India',
    });

    const demoUser = await User.create({
      fullName: 'Alex Morgan',
      username: 'alex_travels',
      email: 'alex@example.com',
      password: 'Password@123',
      role: 'user',
      country: 'India',
      travelPreferences: ['beach', 'nature', 'cultural'],
      budgetPreference: 'moderate',
    });

    console.log('[Seed] Created Admin & Demo User');

    // Create Destinations & child entities
    for (const destData of sampleDestinations) {
      const dest = await Destination.create(destData);

      // Create Attraction
      await Attraction.create({
        destination: dest._id,
        name: `${dest.popularAttractions[0]} Visit`,
        description: `Explore the famous ${dest.popularAttractions[0]} with guided cultural walk.`,
        category: 'landmark',
        location: dest.location,
        images: dest.images,
        entryFee: { amount: 500, currency: 'INR', isFree: false },
        rating: 4.8,
      });

      // Create Hotel
      await Hotel.create({
        destination: dest._id,
        hotelName: `${dest.name} Grand Resort & Spa`,
        priceRange: 'luxury',
        pricePerNight: dest.averageCostPerDay * 1.5,
        rating: 4.7,
        address: `100 Beach Road, ${dest.name}`,
        location: dest.location,
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Breakfast Included'],
        images: dest.images,
      });

      // Create Restaurant
      await Restaurant.create({
        destination: dest._id,
        restaurantName: `The Royal ${dest.name} Kitchen`,
        cuisine: ['Local', 'Authentic', 'Continental'],
        priceRange: '$$$',
        rating: 4.6,
        location: dest.location,
        images: dest.images,
      });

      // Create Sample Trip for Demo User
      if (dest.name === 'Goa' || dest.name === 'Paris') {
        const trip = await Trip.create({
          user: demoUser._id,
          destination: dest.name,
          destinationId: dest._id,
          numberOfDays: 3,
          numberOfTravelers: 2,
          travelStyle: 'couple',
          budget: dest.averageCostPerDay * 3,
          startDate: new Date('2026-10-10'),
          endDate: new Date('2026-10-13'),
          status: 'planned',
          itinerary: [
            {
              day: 1,
              theme: 'Arrival & Beach Exploration',
              morningActivity: [{ title: 'Hotel Check-in & Breakfast', timeSlot: 'morning', estimatedCost: 1000 }],
              afternoonActivity: [{ title: 'Sightseeing at Famous Beach', timeSlot: 'afternoon', estimatedCost: 1500 }],
              eveningActivity: [{ title: 'Sunset Dinner by the Sea', timeSlot: 'evening', estimatedCost: 2500 }],
              estimatedCost: 5000,
            },
          ],
        });

        // Add Review
        await Review.create({
          user: demoUser._id,
          destination: dest._id,
          trip: trip._id,
          rating: 5,
          review: `Visiting ${dest.name} was an amazing experience! The itinerary generated by TRAVLO was spot on.`,
        });
      }
    }

    console.log('[Seed] Database seeded successfully with 10 destinations, attractions, hotels, restaurants, trips & reviews!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
