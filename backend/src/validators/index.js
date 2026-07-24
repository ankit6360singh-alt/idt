import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

export const registerValidator = [
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Username contains invalid characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors,
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const tripValidator = [
  body('destination').notEmpty().withMessage('Destination is required').trim(),
  body('numberOfDays').isInt({ min: 1, max: 60 }).withMessage('Number of days must be between 1 and 60'),
  body('numberOfTravelers').optional().isInt({ min: 1 }).withMessage('Must be at least 1 traveler'),
  body('budget').isNumeric().withMessage('Budget must be a valid number'),
  handleValidationErrors,
];

export const destinationValidator = [
  body('name').notEmpty().withMessage('Destination name is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('category').isIn(['city', 'beach', 'mountain', 'historical', 'nature', 'cultural', 'adventure', 'island']).withMessage('Invalid category'),
  body('averageCostPerDay').isNumeric().withMessage('Average cost per day must be a number'),
  handleValidationErrors,
];

export const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters'),
  handleValidationErrors,
];
