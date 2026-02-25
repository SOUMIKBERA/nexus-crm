const Contact = require('../models/Contact.model');
const Activity = require('../models/Activity.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Log an activity
 */
const logActivity = async (action, contact, userId, changes = null) => {
  try {
    await Activity.create({
      action,
      entity: 'Contact',
      entityId: contact._id,
      entityName: contact.name,
      performedBy: userId,
      changes,
    });
  } catch (error) {
    logger.error('Failed to log activity:', error);
  }
};

/**
 * @desc    Get all contacts (paginated, searchable, filterable)
 * @route   GET /api/contacts
 * @access  Private
 */
const getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { createdBy: req.user._id };

    // Admin can see all contacts
    if (req.user.role === 'admin') {
      delete query.createdBy;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && ['Lead', 'Prospect', 'Customer'].includes(status)) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate('createdBy', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contact.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalContacts: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single contact by ID
 * @route   GET /api/contacts/:id
 * @access  Private
 */
const getContactById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    // Non-admin can only see their own contacts
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const contact = await Contact.findOne(query).populate('createdBy', 'name email');

    if (!contact) {
      return next(new ApiError('Contact not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new contact
 * @route   POST /api/contacts
 * @access  Private
 */
const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      status,
      notes,
      createdBy: req.user._id,
    });

    await logActivity('CREATE', contact, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update contact
 * @route   PUT /api/contacts/:id
 * @access  Private
 */
const updateContact = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const existing = await Contact.findOne(query);
    if (!existing) {
      return next(new ApiError('Contact not found.', 404));
    }

    const { name, email, phone, company, status, notes } = req.body;

    // Track changes for activity log
    const changes = {};
    ['name', 'email', 'phone', 'company', 'status', 'notes'].forEach((field) => {
      if (req.body[field] !== undefined && existing[field] !== req.body[field]) {
        changes[field] = { from: existing[field], to: req.body[field] };
      }
    });

    const contact = await Contact.findOneAndUpdate(
      query,
      { name, email, phone, company, status, notes },
      { new: true, runValidators: true }
    );

    await logActivity('UPDATE', contact, req.user._id, changes);

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete contact
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
const deleteContact = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const contact = await Contact.findOneAndDelete(query);

    if (!contact) {
      return next(new ApiError('Contact not found.', 404));
    }

    await logActivity('DELETE', contact, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export contacts as CSV data
 * @route   GET /api/contacts/export
 * @access  Private
 */
const exportContacts = async (req, res, next) => {
  try {
    const query = { createdBy: req.user._id };
    if (req.user.role === 'admin') delete query.createdBy;

    const contacts = await Contact.find(query).lean();

    const csvHeaders = 'Name,Email,Phone,Company,Status,Notes,Created At\n';
    const csvRows = contacts.map((c) =>
      [
        `"${c.name || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.company || ''}"`,
        `"${c.status || ''}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`,
      ].join(',')
    );

    const csv = csvHeaders + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { getContacts, getContactById, createContact, updateContact, deleteContact, exportContacts };