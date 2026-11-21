const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const { STATUS, PAYMENT_STATUS, BOOKING_STATUS } = require('../utils/constants');

// Service layer convention: success -> { payment } / { payments }, failure -> { err, code }

/**
 * Creates a payment record for a booking.
 * @param {Object} data - Payment data (bookingId, amount).
 * @returns {Promise<Object>} Created payment or error object.
 */
const createPayment = async (data) => {
    try {
        // Validate booking exists and is in PROCESSING state
        const booking = await Booking.findById(data.bookingId);
        if (!booking) {
            return { err: 'Booking not found', code: STATUS.NOT_FOUND };
        }

        if (booking.status !== BOOKING_STATUS.processing) {
            return { err: 'Booking is not in a payable state', code: STATUS.BAD_REQUEST };
        }

        // Validate amount matches booking totalCost
        if (data.amount !== booking.totalCost) {
            return { err: 'Payment amount does not match booking total', code: STATUS.BAD_REQUEST };
        }

        // Check if payment already exists for this booking
        const existingPayment = await Payment.findOne({ booking: data.bookingId });
        if (existingPayment) {
            return { err: 'Payment already exists for this booking', code: STATUS.BAD_REQUEST };
        }

        const payment = await Payment.create({
            booking: data.bookingId,
            amount: data.amount,
            status: PAYMENT_STATUS.pending
        });

        return { payment };
    } catch (error) {
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
            return { err, code: STATUS.UNPROCESSABLE_ENTITY };
        }
        throw error;
    }
};

/**
 * Updates payment status and updates booking accordingly.
 * @param {string} paymentId - Payment ObjectId.
 * @param {string} status - New payment status (SUCCESS/FAILED).
 * @returns {Promise<Object>} Updated payment or error object.
 */
const updatePaymentStatus = async (paymentId, status) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findById(paymentId).session(session);
        if (!payment) {
            throw { err: 'Payment not found', code: STATUS.NOT_FOUND };
        }

        if (payment.status !== PAYMENT_STATUS.pending) {
            throw { err: 'Payment already processed', code: STATUS.BAD_REQUEST };
        }

        payment.status = status;
        await payment.save({ session });

        // Update booking status based on payment result
        const booking = await Booking.findById(payment.booking).session(session);
        if (!booking) {
            throw { err: 'Associated booking not found', code: STATUS.NOT_FOUND };
        }

        if (status === PAYMENT_STATUS.success) {
            booking.status = BOOKING_STATUS.successfull;
        } else if (status === PAYMENT_STATUS.failed) {
            booking.status = BOOKING_STATUS.cancelled;
        }
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Populate booking for response
        await payment.populate('booking');
        return { payment };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Gets payment by ID.
 * @param {string} id - Payment ObjectId.
 * @returns {Promise<Object>} Payment or error object.
 */
const getPaymentById = async (id) => {
    try {
        if (!mongoose.isValidObjectId(id)) {
            return { err: 'Invalid payment ID', code: STATUS.BAD_REQUEST };
        }

        const payment = await Payment.findById(id).populate('booking');
        if (!payment) {
            return { err: 'Payment not found', code: STATUS.NOT_FOUND };
        }

        return { payment };
    } catch (error) {
        throw error;
    }
};

/**
 * Gets payments for a booking.
 * @param {string} bookingId - Booking ObjectId.
 * @returns {Promise<Object>} Payments or error object.
 */
const getPaymentsByBooking = async (bookingId) => {
    try {
        if (!mongoose.isValidObjectId(bookingId)) {
            return { err: 'Invalid booking ID', code: STATUS.BAD_REQUEST };
        }

        const payments = await Payment.find({ booking: bookingId }).populate('booking');
        return { payments };
    } catch (error) {
        throw error;
    }
};

/**
 * Simulates a payment gateway callback (for testing).
 * In production, this would be a webhook endpoint called by the payment provider.
 * @param {string} paymentId - Payment ObjectId.
 * @param {string} gatewayStatus - Status from payment gateway (success/failed).
 * @returns {Promise<Object>} Updated payment or error object.
 */
const handlePaymentCallback = async (paymentId, gatewayStatus) => {
    const statusMap = {
        success: PAYMENT_STATUS.success,
        failed: PAYMENT_STATUS.failed,
        failure: PAYMENT_STATUS.failed
    };

    const status = statusMap[gatewayStatus?.toLowerCase()];
    if (!status) {
        return { err: 'Invalid gateway status', code: STATUS.BAD_REQUEST };
    }

    return updatePaymentStatus(paymentId, status);
};

module.exports = {
    createPayment,
    updatePaymentStatus,
    getPaymentById,
    getPaymentsByBooking,
    handlePaymentCallback
};