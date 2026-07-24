import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening'], required: true },
    estimatedCost: { type: Number, default: 0 },
    travelTime: String,
    transportationMode: String,
    locationName: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const dailyItinerarySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    date: Date,
    theme: String,
    morningActivity: [activitySchema],
    afternoonActivity: [activitySchema],
    eveningActivity: [activitySchema],
    estimatedCost: { type: Number, default: 0 },
    travelTime: String,
    transportation: String,
    weather: {
      condition: String,
      temperature: Number,
      icon: String,
    },
    restaurants: [
      {
        name: String,
        cuisine: String,
        mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
        estimatedCost: Number,
        rating: Number,
      },
    ],
    nearbyAttractions: [
      {
        name: String,
        category: String,
        estimatedVisitTime: String,
        entryFee: Number,
      },
    ],
    hotels: [
      {
        name: String,
        pricePerNight: Number,
        rating: Number,
        amenities: [String],
      },
    ],
    safetyTips: [String],
    packingTips: [String],
    notes: String,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip must belong to a user'],
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      index: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    numberOfDays: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Trip must be at least 1 day'],
      max: [60, 'Trip cannot exceed 60 days'],
    },
    numberOfTravelers: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 traveler'],
    },
    travelStyle: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends', 'business', 'adventure', 'luxury', 'backpacking'],
      default: 'solo',
    },
    budget: {
      type: Number,
      required: [true, 'Trip budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
      index: true,
    },
    itinerary: [dailyItinerarySchema],
    totalBudget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareableLinkToken: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ destination: 1, createdAt: -1 });
tripSchema.index({ startDate: 1, endDate: 1 });

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
export default Trip;
