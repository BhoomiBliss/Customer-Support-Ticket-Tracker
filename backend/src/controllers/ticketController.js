// backend/controllers/ticketController.js
import Ticket from '../models/Ticket.js';
import Comment from '../models/Comment.js';
import TicketHistory from '../models/TicketHistory.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Create a new support ticket
 * @route   POST /api/tickets
 * @access  Private (Customers only)
 */
export const createTicket = async (req, res) => {
  const { title, description, priority } = req.body;

  try {
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can raise support tickets' });
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      createdBy: req.user.id,
    });

    // Create Audit Log for ticket creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE_TICKET',
      meta: { ticketId: ticket._id, title: ticket.title }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(`Create Ticket Error: ${error.message}`);
    res.status(500).json({ message: 'Server error creating ticket.' });
  }
};

/**
 * @desc    Get support tickets (Paginated, filtered, and searched)
 *          Customers retrieve only self-submitted; Agents/Admins retrieve all
 * @route   GET /api/tickets
 * @access  Private
 */
export const getTickets = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Filters and search keyword states
    const { status, priority, search } = req.query;
    let filterQuery = {};

    // Role boundary checks (Customers see own; Agents/Admins see all)
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      filterQuery.createdBy = req.user.id;
    }

    // Base query for global user stats (ignoring status/priority/search filters)
    const statsQuery = {};
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      statsQuery.createdBy = req.user.id;
    }

    // Apply status and priority filter flags
    if (status && status !== 'all') {
      filterQuery.status = status;
    }
    if (priority && priority !== 'all') {
      filterQuery.priority = priority;
    }

    // Apply search query across title or description fields
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Run queries concurrently for optimal performance
    const [tickets, total, totalAll, totalOpen, totalInProgress, totalResolved] = await Promise.all([
      Ticket.find(filterQuery)
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(filterQuery),
      Ticket.countDocuments(statsQuery),
      Ticket.countDocuments({ ...statsQuery, status: 'open' }),
      Ticket.countDocuments({ ...statsQuery, status: 'in-progress' }),
      Ticket.countDocuments({ ...statsQuery, status: 'resolved' })
    ]);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTickets: total,
      stats: {
        total: totalAll,
        open: totalOpen,
        inProgress: totalInProgress,
        resolved: totalResolved
      }
    });
  } catch (error) {
    console.error(`Get Tickets Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving tickets.' });
  }
};

/**
 * @desc    Get detailed properties for a single support ticket
 * @route   GET /api/tickets/:id
 * @access  Private
 */
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    const isOwner = ticket.createdBy._id.toString() === req.user.id;
    const isAgent = req.user.role === 'agent' || req.user.role === 'admin';

    if (!isOwner && !isAgent) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(`Get Ticket Detail Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving ticket details.' });
  }
};

/**
 * @desc    Update support ticket details
 * @route   PUT /api/tickets/:id
 * @access  Private
 */
export const updateTicket = async (req, res) => {
  const { title, description, priority, assignedTo } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    const isOwner = ticket.createdBy.toString() === req.user.id;
    const isAgent = req.user.role === 'agent' || req.user.role === 'admin';

    if (!isOwner && !isAgent) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    // Customer can edit title & description only if status is still 'open'
    if (isOwner && req.user.role === 'customer') {
      if (ticket.status !== 'open') {
        return res.status(400).json({ message: 'Cannot edit tickets already in progress or resolved' });
      }
      if (title) ticket.title = title;
      if (description) ticket.description = description;
    }

    // Agent can adjust priority or re-assign ticket
    if (isAgent) {
      if (priority) ticket.priority = priority;
      if (assignedTo !== undefined) ticket.assignedTo = assignedTo; // can assign to self (or null)
    }

    await ticket.save();
    const populated = await ticket.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    res.json(populated);
  } catch (error) {
    console.error(`Update Ticket Error: ${error.message}`);
    res.status(500).json({ message: 'Server error updating ticket.' });
  }
};

/**
 * @desc    Update support ticket status, logging transitions to TicketHistory and AuditLog
 * @route   PUT /api/tickets/:id/status
 * @access  Private (Agents/Admins only)
 */
export const updateTicketStatus = async (req, res) => {
  const { status, note } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: 'Please provide a valid status update value' });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Security check: Only agents or admins can modify statuses
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only support agents can modify ticket status' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    
    // Automatically assign to the acting agent if it was unassigned
    if (!ticket.assignedTo) {
      ticket.assignedTo = req.user.id;
    }

    await ticket.save();

    // Log the transition in TicketHistory
    await TicketHistory.create({
      ticketId: ticket._id,
      changedBy: req.user.id,
      oldStatus,
      newStatus: status,
      note: note || `Status updated from ${oldStatus} to ${status}`,
    });

    // Create Audit Log for status change
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE_STATUS',
      meta: { ticketId: ticket._id, oldStatus, newStatus: status }
    });

    const populated = await ticket.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    res.json(populated);
  } catch (error) {
    console.error(`Update Ticket Status Error: ${error.message}`);
    res.status(500).json({ message: 'Server error updating ticket status.' });
  }
};

/**
 * @desc    Delete support ticket permanently
 * @route   DELETE /api/tickets/:id
 * @access  Private (Agents/Admins only)
 */
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only support representatives can delete tickets' });
    }

    await ticket.deleteOne();

    // Create Audit Log for ticket deletion
    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE_TICKET',
      meta: { ticketId: req.params.id, title: ticket.title }
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(`Delete Ticket Error: ${error.message}`);
    res.status(500).json({ message: 'Server error deleting ticket.' });
  }
};

// ─── COMMENTS BUSINESS LOGIC ────────────────────────────────────────────────

/**
 * @desc    Create a comment under a support ticket
 * @route   POST /api/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
  const { ticketId, message } = req.body;

  try {
    if (!ticketId || !message) {
      return res.status(400).json({ message: 'Ticket ID and message are required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Associated support ticket not found' });
    }

    // Verify user ownership or agent access
    const isOwner = ticket.createdBy.toString() === req.user.id;
    const isAgent = req.user.role === 'agent' || req.user.role === 'admin';

    if (!isOwner && !isAgent) {
      return res.status(403).json({ message: 'Not authorized to comment on this ticket' });
    }

    const commentObj = await Comment.create({
      ticketId,
      userId: req.user.id,
      message,
    });

    const populatedComment = await commentObj.populate('userId', 'name email role');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(`Add Comment Error: ${error.message}`);
    res.status(500).json({ message: 'Server error posting comment.' });
  }
};

/**
 * @desc    Retrieve all comments for a specific ticket ID
 * @route   GET /api/comments
 * @access  Private
 */
export const getComments = async (req, res) => {
  const { ticketId } = req.query;

  try {
    if (!ticketId) {
      return res.status(400).json({ message: 'Please specify a ticketId query parameter' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Associated support ticket not found' });
    }

    const isOwner = ticket.createdBy.toString() === req.user.id;
    const isAgent = req.user.role === 'agent' || req.user.role === 'admin';

    if (!isOwner && !isAgent) {
      return res.status(403).json({ message: 'Not authorized to view comments for this ticket' });
    }

    const comments = await Comment.find({ ticketId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(`Get Comments Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving comments.' });
  }
};

/**
 * @desc    Retrieve status changes history logs for a ticket
 * @route   GET /api/tickets/:id/history
 * @access  Private
 */
export const getTicketHistory = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Associated support ticket not found' });
    }

    const isOwner = ticket.createdBy.toString() === req.user.id;
    const isAgent = req.user.role === 'agent' || req.user.role === 'admin';

    if (!isOwner && !isAgent) {
      return res.status(403).json({ message: 'Not authorized to view history for this ticket' });
    }

    const history = await TicketHistory.find({ ticketId: req.params.id })
      .populate('changedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error(`Get Ticket History Error: ${error.message}`);
    res.status(500).json({ message: 'Server error retrieving ticket history logs.' });
  }
};
