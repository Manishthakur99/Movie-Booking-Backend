/**
 * Payment Routes Module
 * 
 * Defines all routes for payment-related operations.
 * Base path: /mba/api/v1/payments
 * 
 * Authentication Requirements:
 * - All endpoints require valid JWT (isAuthenticated)
 * - POST /payments processes payment for a booking (handles 5-min expiry, seat reduction)
 * - GET /payments returns all payments (admin) or user's own payments
 * - GET /payments/:id returns specific payment with booking details
 * 
 * Note: No callback/webhook endpoint in this version (simplified).
 * Payment is processed synchronously in the createPayment endpoint.
 */

const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const paymentMiddleware = require('../middlewares/payment.middlewares');

/**
 * Registers all payment endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // PROCESS PAYMENT - Process payment for a booking (requires auth + validation)
    // POST /mba/api/v1/payments
    // Body: { bookingId, amount }
    // Handles: 5-min booking expiry, amount validation, seat reduction, status updates
    // Returns: Updated booking with status (SUCCESSFULL/CANCELLED/EXPIRED)
    app.post(
        '/mba/api/v1/payments',
        authMiddleware.isAuthenticated,
        paymentMiddleware.validateInitiatePaymentRequest,
        paymentController.createPayment
    );

    // GET - Get payment details by payment ID (requires auth)
    // GET /mba/api/v1/payments/:id
    // Returns: Payment document with populated booking
    app.get(
        '/mba/api/v1/payments/:id',
        authMiddleware.isAuthenticated,
        paymentController.getPaymentDetailsById
    );

    // GET - Get all payments (admin gets all, user gets own)
    // GET /mba/api/v1/payments
    app.get(
        '/mba/api/v1/payments',
        authMiddleware.isAuthenticated,
        paymentController.getAllPayments
    );
};

module.exports = routes;