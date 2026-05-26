// backend/models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
    }, // E.g., LOGIN, CREATE_TICKET, UPDATE_STATUS, DELETE_TICKET
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Performance index to support chronologically sorted security audits
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
