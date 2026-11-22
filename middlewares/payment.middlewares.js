/**
 * Payment Validation Middlewares
 * 
 * Validates payment initiation and callback requests before they reach the controller.
 * Performs presence, format, and value validation.
 * Note: `errorResponseBody` is a shared singleton object (see utils/responsebody.js).
 */

const { STATUS } = require('../utils/constants');
const { errorResponseBody } = require('../utils/responsebody');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Middleware that validates the payment initiation request (POST /mba/api/v1/payments).
 * Ensures:
 * - bookingId is present and a valid MongoDB ObjectId
 * - amount is present and a positive number
 * @param {Request} req - Express request; payment payload in req.body.
 * @param {Response} res - Express response used to send 400 on invalid input.
 * @param {Function} next - Next handler.
 * @returns {Promise<void>}
 */
const validateInitiatePaymentRequest = async (req, res, next) => {
    // Validate bookingId presence
    if (!req.body.bookingId) {
        errorResponseBody.err = 'Booking ID is required';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate bookingId format (must be valid MongoDB ObjectId)
    if (!ObjectId.isValid(req.body.bookingId)) {
        errorResponseBody.err = 'Invalid booking ID format';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate amount presence
    if (!req.body.amount) {
        errorResponseBody.err = 'Payment amount is required';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate amount is a positive number
    if (typeof req.body.amount !== 'number' || req.body.amount <= 0) {
        errorResponseBody.err = 'Payment amount must be a positive number';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    next();
};

/**
 * Middleware that validates the payment callback request (POST /mba/api/v1/payments/callback).
 * Used for payment gateway webhooks (simulated for testing).
 * Ensures:
 * - paymentId is present and a valid MongoDB ObjectId
 * - status is present and one of: 'success', 'failed', 'failure'
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @param {Function} next - Next handler.
 * @returns {Promise<void>}
 */
const validatePaymentCallbackRequest = (req, res, next) => {
    if (!req.body.paymentId) {
        errorResponseBody.err = 'Payment ID is required';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    if (!ObjectId.isValid(req.body.paymentId)) {
        errorResponseBody.err = 'Invalid payment ID format';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    if (!req.body.status) {
        errorResponseBody.err = 'Payment status is required';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    const validStatuses = ['success', 'failed', 'failure'];
    if (!validStatuses.includes(req.body.status.toLowerCase())) {
        errorResponseBody.err = 'Invalid payment status. Must be "success" or "failed"';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    next();
};

/**
 * Alias for validateInitiatePaymentRequest (used in routes for clarity).
 * @type {Function}
 */
const verifyPaymentCreateRequest = validateInitiatePaymentRequest;

module.exports = {
    validateInitiatePaymentRequest,
    validatePaymentCallbackRequest,
    verifyPaymentCreateRequest
};