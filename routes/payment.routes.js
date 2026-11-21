const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const paymentMiddleware = require('../middlewares/payment.middlewares');

/**
 * Registers all payment endpoints on the Express app.
 * Base path: /mba/api/v1/payments
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // POST - Initiate payment for a booking (requires auth + validation)
    app.post(
        '/mba/api/v1/payments',
        authMiddleware.isAuthenticated,
        paymentMiddleware.validateInitiatePaymentRequest,
        paymentController.initiatePayment
    );

    // GET - Get payment status by payment ID (requires auth)
    app.get(
        '/mba/api/v1/payments/:id',
        authMiddleware.isAuthenticated,
        paymentController.getPaymentStatus
    );

    // GET - Get all payments for a booking (requires auth)
    app.get(
        '/mba/api/v1/payments/booking/:bookingId',
        authMiddleware.isAuthenticated,
        paymentController.getPaymentsByBooking
    );

    // POST - Payment gateway callback (simulated for testing)
    // In production, this would be a webhook with signature verification
    app.post(
        '/mba/api/v1/payments/callback',
        paymentMiddleware.validatePaymentCallbackRequest,
        paymentController.paymentCallback
    );
};

module.exports = routes;