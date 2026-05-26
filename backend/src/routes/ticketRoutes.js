// backend/routes/ticketRoutes.js
import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  addComment,
  getComments,
  getTicketHistory,
} from '../controllers/ticketController.js';
import { protect, agentOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── TICKET ENDPOINTS ──────────────────────────────────
router.route('/tickets')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/tickets/:id')
  .get(protect, getTicketById)
  .put(protect, updateTicket)
  .delete(protect, agentOnly, deleteTicket);

router.put('/tickets/:id/status', protect, agentOnly, updateTicketStatus);
router.get('/tickets/:id/history', protect, getTicketHistory);

// ── COMMENT ENDPOINTS ─────────────────────────────────
router.post('/comments', protect, addComment);
router.get('/comments', protect, getComments);

export default router;
