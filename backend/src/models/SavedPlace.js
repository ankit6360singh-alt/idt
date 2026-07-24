import mongoose from 'mongoose';

const savedPlaceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      index: true,
    },
    placeType: {
      type: String,
      enum: ['destination', 'attraction', 'hotel', 'restaurant'],
      required: true,
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'placeModel',
    },
    placeModel: {
      type: String,
      required: true,
      enum: ['Destination', 'Attraction', 'Hotel', 'Restaurant'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    savedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved items for the same user and place
savedPlaceSchema.index({ user: 1, placeId: 1 }, { unique: true });
savedPlaceSchema.index({ user: 1, placeType: 1 });

const SavedPlace = mongoose.models.SavedPlace || mongoose.model('SavedPlace', savedPlaceSchema);
export default SavedPlace;
