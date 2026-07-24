import mongoose from 'mongoose';

const attractionSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Attraction name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['monument', 'museum', 'park', 'landmark', 'viewpoint', 'entertainment', 'beach', 'temple', 'shopping'],
      required: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    images: [String],
    estimatedVisitTime: {
      type: String,
      default: '1-2 hours',
    },
    entryFee: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isFree: { type: Boolean, default: false },
    },
    openingHours: {
      open: { type: String, default: '09:00 AM' },
      close: { type: String, default: '06:00 PM' },
      closedDays: [String],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    contactInformation: {
      phone: String,
      email: String,
    },
    website: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
attractionSchema.index({ location: '2dsphere' });
attractionSchema.index({ destination: 1, category: 1 });

const Attraction = mongoose.models.Attraction || mongoose.model('Attraction', attractionSchema);
export default Attraction;
