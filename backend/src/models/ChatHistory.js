import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    conversationId: {
      type: String,
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Travel Planning Chat',
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
    },
    response: {
      type: String,
      required: [true, 'Response is required'],
    },
    metadata: {
      destination: String,
      tokensUsed: Number,
      aiModel: { type: String, default: 'gemini-1.5-flash' },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast history retrieval per user/conversation
chatHistorySchema.index({ user: 1, conversationId: 1, timestamp: -1 });

const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
