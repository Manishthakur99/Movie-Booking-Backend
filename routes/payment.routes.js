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
    // POST - Process payment for a booking (requires auth + validation)
    app.post(
        '/mba/api/v1/payments',
        authMiddleware.isAuthenticated,
        paymentMiddleware.validateInitiatePaymentRequest,
        paymentController.createPayment
    );

    // GET - Get payment details by payment ID (requires auth)
    app.get(
        '/mba/api/v1/payments/:id',
        authMiddleware.isAuthenticated,
        paymentController.getPaymentDetailsById
    );

    // GET - Get all payments (admin gets all, user gets own)
    app.get(
        '/mba/api/v1/payments',
        authMiddleware.isAuthenticated,
        paymentController.getAllPayments
    );
};

module.exports = routes;