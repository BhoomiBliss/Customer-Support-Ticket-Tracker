// backend/models/Ticket.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// 🔥 INDEXING (VERY IMPORTANT FOR PERFORMANCE)
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdAt: -1 });

export default mongoose.model('Ticket', ticketSchema);
