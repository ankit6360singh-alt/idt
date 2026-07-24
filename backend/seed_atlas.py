import pymongo
import bcrypt
from datetime import datetime, timezone

MONGODB_URI = "mongodb+srv://ankit6360singh_db_user:dThM3y6eY2BUiLFw@cluster0.klyglql.mongodb.net/travlo?retryWrites=true&w=majority&appName=Cluster0"

print("[Atlas Seed] Connecting to MongoDB Atlas...")

client = pymongo.MongoClient(MONGODB_URI)
db = client["travlo"]

# Ping cluster
client.admin.command('ping')
print("[Atlas Seed] Successfully connected to Atlas cluster!")

# Collections
users_col = db["users"]
destinations_col = db["destinations"]
attractions_col = db["attractions"]
hotels_col = db["hotels"]
restaurants_col = db["restaurants"]
trips_col = db["trips"]
reviews_col = db["reviews"]
weather_col = db["weathercaches"]

# Clear existing data
users_col.delete_many({})
destinations_col.delete_many({})
attractions_col.delete_many({})
hotels_col.delete_many({})
restaurants_col.delete_many({})
trips_col.delete_many({})
reviews_col.delete_many({})
weather_col.delete_many({})
print("[Atlas Seed] Collections cleared.")

# Setup Indexes
users_col.create_index([("email", pymongo.ASCENDING)], unique=True)
users_col.create_index([("username", pymongo.ASCENDING)], unique=True)
users_col.create_index([("role", pymongo.ASCENDING)])

destinations_col.create_index([("location", pymongo.GEOSPHERE)])
destinations_col.create_index([("name", pymongo.TEXT), ("country", pymongo.TEXT), ("description", pymongo.TEXT), ("tags", pymongo.TEXT)])
destinations_col.create_index([("country", pymongo.ASCENDING), ("category", pymongo.ASCENDING)])

attractions_col.create_index([("location", pymongo.GEOSPHERE)])
attractions_col.create_index([("destination", pymongo.ASCENDING), ("category", pymongo.ASCENDING)])

hotels_col.create_index([("location", pymongo.GEOSPHERE)])
hotels_col.create_index([("destination", pymongo.ASCENDING), ("priceRange", pymongo.ASCENDING)])

restaurants_col.create_index([("location", pymongo.GEOSPHERE)])
restaurants_col.create_index([("destination", pymongo.ASCENDING), ("cuisine", pymongo.ASCENDING)])

weather_col.create_index([("expiresAt", pymongo.ASCENDING)], expireAfterSeconds=0)

print("[Atlas Seed] Indexes created (2DSphere, Text, TTL, Unique).")

# Password hashing
salt = bcrypt.gensalt(12)
hashed_pw = bcrypt.hashpw(b"Password@123", salt).decode('utf-8')

now = datetime.now(timezone.utc)

# Users
admin_id = users_col.insert_one({
    "fullName": "TRAVLO Admin",
    "username": "admin",
    "email": "admin@travlo.ai",
    "password": hashed_pw,
    "role": "admin",
    "country": "India",
    "preferredCurrency": "INR",
    "createdAt": now,
    "updatedAt": now
}).inserted_id

demo_user_id = users_col.insert_one({
    "fullName": "Alex Morgan",
    "username": "alex_travels",
    "email": "alex@example.com",
    "password": hashed_pw,
    "role": "user",
    "country": "India",
    "preferredCurrency": "INR",
    "travelPreferences": ["beach", "nature", "cultural"],
    "budgetPreference": "moderate",
    "createdAt": now,
    "updatedAt": now
}).inserted_id

print("[Atlas Seed] Users seeded.")

destinations_data = [
    {
        "name": "Bengaluru",
        "country": "India",
        "state": "Karnataka",
        "location": {"type": "Point", "coordinates": [77.5946, 12.9716]},
        "images": ["https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=800"],
        "description": "The Silicon Valley of India, famous for its tech hubs, lush parks, vibrant pub culture, and pleasant weather year-round.",
        "category": "city",
        "averageCostPerDay": 4500,
        "bestTimeToVisit": "October to February",
        "popularAttractions": ["Cubbon Park", "Bangalore Palace", "Lalbagh Botanical Garden"],
        "weatherInfo": {"tempRange": "18°C - 30°C", "bestMonths": ["Oct", "Nov", "Dec", "Jan", "Feb"], "climateType": "Tropical Savanna"},
        "safetyScore": 9,
        "rating": 4.6,
        "totalReviews": 85,
        "tags": ["Tech", "Garden City", "Pubs", "Culture"],
        "nearbyCities": ["Mysore", "Coorg", "Chikmagalur"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Goa",
        "country": "India",
        "state": "Goa",
        "location": {"type": "Point", "coordinates": [73.8567, 15.2993]},
        "images": ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800"],
        "description": "India’s beach paradise featuring golden sands, Portuguese heritage churches, lively nightlife, and delicious seafood.",
        "category": "beach",
        "averageCostPerDay": 5000,
        "bestTimeToVisit": "November to February",
        "popularAttractions": ["Baga Beach", "Basilica of Bom Jesus", "Dudhsagar Falls"],
        "weatherInfo": {"tempRange": "20°C - 33°C", "bestMonths": ["Nov", "Dec", "Jan", "Feb"], "climateType": "Tropical Monsoon"},
        "safetyScore": 9,
        "rating": 4.8,
        "totalReviews": 210,
        "tags": ["Beach", "Nightlife", "Seafood", "Water Sports"],
        "nearbyCities": ["Gokarna", "Dandeli"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Manali",
        "country": "India",
        "state": "Himachal Pradesh",
        "location": {"type": "Point", "coordinates": [77.1887, 32.2432]},
        "images": ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800"],
        "description": "A breathtaking Himalayan resort town renowned for snow sports, pine forests, adventure trekking, and scenic valleys.",
        "category": "mountain",
        "averageCostPerDay": 3500,
        "bestTimeToVisit": "October to June",
        "popularAttractions": ["Solang Valley", "Hadimba Temple", "Rohtang Pass"],
        "weatherInfo": {"tempRange": "-5°C - 25°C", "bestMonths": ["Dec", "Jan", "Feb", "May", "Jun"], "climateType": "Alpine"},
        "safetyScore": 8,
        "rating": 4.7,
        "totalReviews": 140,
        "tags": ["Snow", "Mountains", "Adventure", "Trekking"],
        "nearbyCities": ["Kasol", "Shimla", "Dharamshala"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Jaipur",
        "country": "India",
        "state": "Rajasthan",
        "location": {"type": "Point", "coordinates": [75.7873, 26.9124]},
        "images": ["https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800"],
        "description": "The Pink City of Rajasthan, steeped in royal history, majestic forts, grand palaces, and rich artisanal handicrafts.",
        "category": "historical",
        "averageCostPerDay": 4000,
        "bestTimeToVisit": "November to March",
        "popularAttractions": ["Amer Fort", "Hawa Mahal", "City Palace"],
        "weatherInfo": {"tempRange": "10°C - 35°C", "bestMonths": ["Nov", "Dec", "Jan", "Feb", "Mar"], "climateType": "Semi-Arid"},
        "safetyScore": 9,
        "rating": 4.8,
        "totalReviews": 195,
        "tags": ["Forts", "Heritage", "Palaces", "Royalty"],
        "nearbyCities": ["Udaipur", "Jodhpur", "Pushkar"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Kashmir",
        "country": "India",
        "state": "Jammu & Kashmir",
        "location": {"type": "Point", "coordinates": [74.7973, 34.0837]},
        "images": ["https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&q=80&w=800"],
        "description": "Paradise on Earth, celebrated for Dal Lake houseboats, shikara rides, Gulmarg gondola skiing, and tulip gardens.",
        "category": "nature",
        "averageCostPerDay": 5500,
        "bestTimeToVisit": "March to October",
        "popularAttractions": ["Dal Lake", "Gulmarg Gondola", "Pahalgam Valley"],
        "weatherInfo": {"tempRange": "-2°C - 28°C", "bestMonths": ["Apr", "May", "Jun", "Jul", "Aug", "Sep"], "climateType": "Subtropical Highland"},
        "safetyScore": 8,
        "rating": 4.9,
        "totalReviews": 320,
        "tags": ["Paradise", "Houseboats", "Skiing", "Shikara"],
        "nearbyCities": ["Srinagar", "Gulmarg", "Sonamarg"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Kerala",
        "country": "India",
        "state": "Kerala",
        "location": {"type": "Point", "coordinates": [76.2711, 9.9312]},
        "images": ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800"],
        "description": "God’s Own Country, famed for tranquil Alleppey backwaters, Munnar tea plantations, Ayurvedic wellness, and palm-fringed coastlines.",
        "category": "nature",
        "averageCostPerDay": 4800,
        "bestTimeToVisit": "September to March",
        "popularAttractions": ["Alleppey Backwaters", "Munnar Tea Gardens", "Varkala Beach"],
        "weatherInfo": {"tempRange": "22°C - 32°C", "bestMonths": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], "climateType": "Tropical Wet"},
        "safetyScore": 9,
        "rating": 4.9,
        "totalReviews": 280,
        "tags": ["Backwaters", "Ayurveda", "Tea Gardens", "Nature"],
        "nearbyCities": ["Kochi", "Alleppey", "Munnar"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Paris",
        "country": "France",
        "state": "Île-de-France",
        "location": {"type": "Point", "coordinates": [2.3522, 48.8566]},
        "images": ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"],
        "description": "The City of Light, world-renowned for iconic architecture, high fashion, world-class art museums, and gourmet bakeries.",
        "category": "cultural",
        "averageCostPerDay": 18000,
        "bestTimeToVisit": "June to August, September to October",
        "popularAttractions": ["Eiffel Tower", "Louvre Museum", "Cathédrale Notre-Dame"],
        "weatherInfo": {"tempRange": "5°C - 26°C", "bestMonths": ["May", "Jun", "Jul", "Sep", "Oct"], "climateType": "Oceanic"},
        "safetyScore": 9,
        "rating": 4.8,
        "totalReviews": 450,
        "tags": ["Eiffel Tower", "Art", "Fashion", "Romantic"],
        "nearbyCities": ["Versailles", "Lyon", "Nice"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Tokyo",
        "country": "Japan",
        "state": "Kanto",
        "location": {"type": "Point", "coordinates": [139.6917, 35.6895]},
        "images": ["https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800"],
        "description": "A futuristic metropolis where ultra-modern skyscrapers and neon-lit avenues coexist with historic Shinto shrines.",
        "category": "city",
        "averageCostPerDay": 16000,
        "bestTimeToVisit": "March to May, September to November",
        "popularAttractions": ["Shibuya Crossing", "Tokyo Skytree", "Senso-ji Temple"],
        "weatherInfo": {"tempRange": "2°C - 31°C", "bestMonths": ["Mar", "Apr", "May", "Oct", "Nov"], "climateType": "Humid Subtropical"},
        "safetyScore": 10,
        "rating": 4.9,
        "totalReviews": 510,
        "tags": ["Futuristic", "Anime", "Sushi", "Shrines"],
        "nearbyCities": ["Kyoto", "Osaka", "Hakone"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Dubai",
        "country": "United Arab Emirates",
        "state": "Dubai",
        "location": {"type": "Point", "coordinates": [55.2708, 25.2048]},
        "images": ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800"],
        "description": "The global luxury hub famous for the Burj Khalifa, desert safaris, mega shopping centers, and artificial islands.",
        "category": "adventure",
        "averageCostPerDay": 20000,
        "bestTimeToVisit": "November to March",
        "popularAttractions": ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah"],
        "weatherInfo": {"tempRange": "19°C - 41°C", "bestMonths": ["Nov", "Dec", "Jan", "Feb", "Mar"], "climateType": "Desert"},
        "safetyScore": 10,
        "rating": 4.8,
        "totalReviews": 390,
        "tags": ["Luxury", "Burj Khalifa", "Desert Safari", "Shopping"],
        "nearbyCities": ["Abu Dhabi", "Sharjah"],
        "createdAt": now,
        "updatedAt": now
    },
    {
        "name": "Bali",
        "country": "Indonesia",
        "state": "Bali",
        "location": {"type": "Point", "coordinates": [115.1889, -8.4095]},
        "images": ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800"],
        "description": "The Island of Gods, known for volcanic mountains, iconic rice terraces, coral reefs, and spiritual Hindu temples.",
        "category": "island",
        "averageCostPerDay": 7000,
        "bestTimeToVisit": "April to October",
        "popularAttractions": ["Ubud Rice Terraces", "Uluwatu Temple", "Seminyak Beach"],
        "weatherInfo": {"tempRange": "23°C - 31°C", "bestMonths": ["May", "Jun", "Jul", "Aug", "Sep"], "climateType": "Tropical"},
        "safetyScore": 9,
        "rating": 4.9,
        "totalReviews": 600,
        "tags": ["Islands", "Temples", "Surfing", "Wellness"],
        "nearbyCities": ["Lombok", "Nusa Penida"],
        "createdAt": now,
        "updatedAt": now
    }
]

dest_ids = {}
for dest in destinations_data:
    inserted = destinations_col.insert_one(dest)
    dest_ids[dest["name"]] = inserted.inserted_id

print(f"[Atlas Seed] Seeded {len(dest_ids)} destinations.")

# Insert child attractions, hotels, restaurants, trips, reviews
for dest_name, dest_id in dest_ids.items():
    attractions_col.insert_one({
        "destination": dest_id,
        "name": f"Famous Sight in {dest_name}",
        "description": f"Must-visit landmark in {dest_name}.",
        "category": "landmark",
        "location": {"type": "Point", "coordinates": [77.0, 28.0]},
        "images": ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34"],
        "estimatedVisitTime": "2 hours",
        "entryFee": {"amount": 500, "currency": "INR", "isFree": False},
        "rating": 4.8,
        "createdAt": now
    })

    hotels_col.insert_one({
        "destination": dest_id,
        "hotelName": f"Grand Resort {dest_name}",
        "priceRange": "luxury",
        "pricePerNight": 7500,
        "rating": 4.7,
        "address": f"Central Avenue, {dest_name}",
        "location": {"type": "Point", "coordinates": [77.0, 28.0]},
        "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
        "amenities": ["Free WiFi", "Pool", "Spa", "Breakfast Included"],
        "createdAt": now
    })

    restaurants_col.insert_one({
        "destination": dest_id,
        "restaurantName": f"The Royal {dest_name} Bistro",
        "cuisine": ["Local", "Authentic"],
        "priceRange": "$$$",
        "rating": 4.6,
        "location": {"type": "Point", "coordinates": [77.0, 28.0]},
        "images": ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"],
        "createdAt": now
    })

# Sample Trip & Review for Goa
goa_id = dest_ids["Goa"]
trip_id = trips_col.insert_one({
    "user": demo_user_id,
    "destination": "Goa",
    "destinationId": goa_id,
    "numberOfDays": 3,
    "numberOfTravelers": 2,
    "travelStyle": "couple",
    "budget": 15000,
    "startDate": now,
    "endDate": now,
    "status": "planned",
    "itinerary": [
        {
            "day": 1,
            "theme": "Arrival & Beach Exploration",
            "morningActivity": [{"title": "Resort Check-in", "timeSlot": "morning", "estimatedCost": 1000}],
            "afternoonActivity": [{"title": "Baga Beach Walk", "timeSlot": "afternoon", "estimatedCost": 1500}],
            "eveningActivity": [{"title": "Seafood Dinner", "timeSlot": "evening", "estimatedCost": 2500}],
            "estimatedCost": 5000
        }
    ],
    "totalBudget": 15000,
    "createdAt": now
}).inserted_id

reviews_col.insert_one({
    "user": demo_user_id,
    "destination": goa_id,
    "trip": trip_id,
    "rating": 5,
    "review": "Visiting Goa was an amazing experience! The itinerary generated by TRAVLO was spot on.",
    "createdDate": now
})

print("[Atlas Seed] Database seeded successfully!")
print("   Database Name: travlo")
print("   Destinations: 10")
print("   Users: Admin (admin@travlo.ai) & Demo (alex@example.com)")
