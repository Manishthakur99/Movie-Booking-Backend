const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const Show = require('../models/show.model');
const User = require('../models/user.model');
const { STATUS, PAYMENT_STATUS, BOOKING_STATUS, USER_ROLE } = require('../utils/constants');

/**
 * Creates a payment record for a booking and processes the payment.
 * Handles 5-minute booking expiry and seat count reduction on success.
 * @param {Object} data - Payment data (bookingId, amount).
 * @returns {Promise<Object>} Updated booking object (for email notification) or error object.
 */
const createPayment = async (data) => {
    try {
        const booking = await Booking.findById(data.bookingId);
        if (!booking) {
            throw { err: 'No booking found', code: STATUS.NOT_FOUND };
        }

        if (booking.status === BOOKING_STATUS.successfull) {
            throw { err: 'Booking already done, cannot make a new payment against it', code: STATUS.FORBIDDEN };
        }

        // Check 5-minute expiry
        const bookingTime = booking.createdAt;
        const currentTime = Date.now();
        const minutes = Math.floor(((currentTime - bookingTime) / 1000) / 60);
        
        if (minutes > 5) {
            booking.status = BOOKING_STATUS.expired;
            await booking.save();
            return booking;
        }

        const show = await Show.findOne({
            movieId: booking.movieId,
            theatreId: booking.theatreId,
            timing: booking.timing
        });

        if (!show) {
            throw { err: 'Show not found', code: STATUS.NOT_FOUND };
        }

        // Validate amount matches booking totalCost
        if (data.amount !== booking.totalCost) {
            throw { err: 'Payment amount does not match booking total', code: STATUS.BAD_REQUEST };
        }

        // Check if payment already exists for this booking
        const existingPayment = await Payment.findOne({ booking: data.bookingId });
        if (existingPayment) {
            throw { err: 'Payment already exists for this booking', code: STATUS.BAD_REQUEST };
        }

        const payment = await Payment.create({
            booking: data.bookingId,
            amount: data.amount,
            status: PAYMENT_STATUS.pending
        });

        // Simulate payment processing - fail if amount mismatch
        if (payment.amount !== booking.totalCost) {
            payment.status = PAYMENT_STATUS.failed;
        }

        if (!payment || payment.status === PAYMENT_STATUS.failed) {
            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();
            await payment.save();
            return booking;
        }

        // Payment successful
        payment.status = PAYMENT_STATUS.success;
        booking.status = BOOKING_STATUS.successfull;
        
        // Reduce seat count
        show.noOfSeats -= booking.noOfSeats;
        if (show.noOfSeats < 0) show.noOfSeats = 0;
        
        await show.save();
        await booking.save();
        await payment.save();
        
        return booking;
    } catch (error) {
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
            return { err, code: STATUS.UNPROCESSABLE_ENTITY };
        }
        if (error.err) throw error;
        throw error;
    }
};

/**
 * Gets payment by ID.
 * @param {string} id - Payment ObjectId.
 * @returns {Promise<Object>} Payment with populated booking or error object.
 */
const getPaymentById = async (id) => {
    try {
        if (!mongoose.isValidObjectId(id)) {
            return { err: 'Invalid payment ID', code: STATUS.BAD_REQUEST };
        }

        const payment = await Payment.findById(id).populate('booking');
        if (!payment) {
            return { err: 'No payment record found', code: STATUS.NOT_FOUND };
        }
        return payment;
    } catch (error) {
        throw error;
    }
};

/**
 * Gets all payments (admin gets all, user gets own).
 * @param {string} userId - User ObjectId.
 * @returns {Promise<Object[]>} Payments list.
 */
const getAllPayments = async (userId) => {
    try {
        const user = await User.findById(userId);
        let filter = {};
        if (user.userRole !== USER_ROLE.admin) {
            filter.userId = user.id;
        }
        const bookings = await Booking.find(filter, '_id');
        const bookingIds = bookings.map(b => b._id);
        const payments = await Payment.find({ booking: { $in: bookingIds } }).populate('booking');
        return payments;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPayment,
    getPaymentById,
    getAllPayments
};