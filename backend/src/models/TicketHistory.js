// backend/models/TicketHistory.js
import mongoose from 'mongoose';

const ticketHistorySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    oldStatus: String,
    newStatus: String,
    note: String,
  },
  { timestamps: true }
);

// Performance index for loading progress history timelines on ticket details screens
ticketHistorySchema.index({ ticketId: 1, createdAt: -1 });

export default mongoose.model('TicketHistory', ticketHistorySchema);
