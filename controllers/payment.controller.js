const paymentService = require('../services/payment.service');
const { STATUS } = require('../utils/constants');

/**
 * Initiates a payment for a booking.
 * @param {Request} req - Express request; bookingId and amount in req.body, user in req.user.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with payment details.
 */
const initiatePayment = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;
        const userId = req.user;

        // Verify booking belongs to user
        const Booking = require('../models/booking.model');
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(STATUS.NOT_FOUND).json({
                success: false,
                err: 'Booking not found',
                message: 'Booking not found',
                data: {}
            });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(STATUS.UNAUTHORISED).json({
                success: false,
                err: 'Unauthorized to pay for this booking',
                message: 'Unauthorized',
                data: {}
            });
        }

        const response = await paymentService.createPayment({ bookingId, amount });

        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: 'Failed to initiate payment',
                data: {}
            });
        }

        return res.status(STATUS.CREATED).json({
            success: true,
            err: {},
            message: 'Payment initiated successfully',
            data: response.payment
        });
    } catch (err) {
        console.error('Error initiating payment:', err);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: err.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

/**
 * Gets payment status by payment ID.
 * @param {Request} req - Express request; payment ID in req.params.id.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with payment details.
 */
const getPaymentStatus = async (req, res) => {
    try {
        const response = await paymentService.getPaymentById(req.params.id);

        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: 'Failed to fetch payment',
                data: {}
            });
        }

        // Verify user owns the booking
        if (response.payment.booking.userId.toString() !== req.user) {
            return res.status(STATUS.UNAUTHORISED).json({
                success: false,
                err: 'Unauthorized to view this payment',
                message: 'Unauthorized',
                data: {}
            });
        }

        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Payment fetched successfully',
            data: response.payment
        });
    } catch (err) {
        console.error('Error fetching payment:', err);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: err.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

/**
 * Gets all payments for a booking.
 * @param {Request} req - Express request; booking ID in req.params.bookingId.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with payments list.
 */
const getPaymentsByBooking = async (req, res) => {
    try {
        const response = await paymentService.getPaymentsByBooking(req.params.bookingId);

        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: 'Failed to fetch payments',
                data: {}
            });
        }

        // Verify user owns the booking
        const Booking = require('../models/booking.model');
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking || booking.userId.toString() !== req.user) {
            return res.status(STATUS.UNAUTHORISED).json({
                success: false,
                err: 'Unauthorized to view these payments',
                message: 'Unauthorized',
                data: {}
            });
        }

        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Payments fetched successfully',
            data: response.payments
        });
    } catch (err) {
        console.error('Error fetching payments:', err);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: err.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

/**
 * Simulates a payment gateway callback (for testing/demo).
 * In production, this would be a secured webhook endpoint.
 * @param {Request} req - Express request; paymentId and status in req.body.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with updated payment.
 */
const paymentCallback = async (req, res) => {
    try {
        const { paymentId, status } = req.body;

        const response = await paymentService.handlePaymentCallback(paymentId, status);

        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: 'Failed to process payment callback',
                data: {}
            });
        }

        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Payment status updated successfully',
            data: response.payment
        });
    } catch (err) {
        console.error('Error processing payment callback:', err);
        if (err.err) {
            return res.status(err.code).json({
                success: false,
                err: err.err,
                message: 'Failed to process payment callback',
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: err.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

module.exports = {
    initiatePayment,
    getPaymentStatus,
    getPaymentsByBooking,
    paymentCallback
};