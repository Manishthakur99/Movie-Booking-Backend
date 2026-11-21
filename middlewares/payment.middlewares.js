const { STATUS } = require('../utils/constants');
const { errorResponseBody } = require('../utils/responsebody');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Middleware that validates the payment initiation request.
 * Ensures bookingId and amount are present and valid.
 * @param {Request} req - Express request; payment payload in req.body.
 * @param {Response} res - Express response.
 * @param {Function} next - Next handler.
 * @returns {Promise<void>}
 */
const validateInitiatePaymentRequest = async (req, res, next) => {
    // Validate bookingId presence
    if (!req.body.bookingId) {
        errorResponseBody.err = 'Booking ID is required';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate bookingId format
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
 * Middleware that validates the payment callback request.
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

module.exports = {
    validateInitiatePaymentRequest,
    validatePaymentCallbackRequest
};