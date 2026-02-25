const express = require('express');
const { body, query } = require('express-validator');
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  exportContacts,
} = require('../controllers/contact.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(apiLimiter);

// Contact validation rules
const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone')
    .optional()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number'),
  body('company').optional().isLength({ max: 100 }).withMessage('Company max 100 chars'),
  body('status')
    .optional()
    .isIn(['Lead', 'Prospect', 'Customer'])
    .withMessage('Status must be Lead, Prospect, or Customer'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes max 1000 characters'),
];

const updateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone')
    .optional()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number'),
  body('status')
    .optional()
    .isIn(['Lead', 'Prospect', 'Customer'])
    .withMessage('Invalid status'),
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];

// Routes
router.get('/export', exportContacts);
router.get('/', paginationValidation, validate, getContacts);
router.get('/:id', getContactById);
router.post('/', contactValidation, validate, createContact);
router.put('/:id', updateValidation, validate, updateContact);
router.delete('/:id', deleteContact);

module.exports = router;