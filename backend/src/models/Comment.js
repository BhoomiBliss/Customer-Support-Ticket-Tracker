// backend/models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// Performance index for fetching a ticket's comments thread in reverse-chronological order
commentSchema.index({ ticketId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
