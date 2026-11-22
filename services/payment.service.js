const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const Show = require('../models/show.model');
const User = require('../models/user.model');
const { STATUS, PAYMENT_STATUS, BOOKING_STATUS, USER_ROLE } = require('../utils/constants');

// Service layer convention: every function returns a plain object.
// On failure it returns `{ err, code }`; on success it returns the created/found document(s).
// Controllers translate that object into the HTTP response.

/**
 * Creates a payment record for a booking and processes the payment.
 * Implements business logic:
 * - 5-minute booking expiry (auto-cancels stale bookings)
 * - Prevents duplicate payments for same booking
 * - Validates payment amount matches booking total
 * - On success: reduces show seat count, updates booking status to SUCCESSFULL
 * - On failure: cancels booking, marks payment as FAILED
 * Returns the booking object (with updated status) for email notification.
 * @param {Object} data - Payment data (bookingId, amount).
 * @returns {Promise<Object>} Updated booking object or error object.
 */
const createPayment = async (data) => {
    try {
        const booking = await Booking.findById(data.bookingId);
        if (!booking) {
            throw { err: 'No booking found', code: STATUS.NOT_FOUND };
        }

        // Prevent double payment on already completed booking
        if (booking.status === BOOKING_STATUS.successfull) {
            throw { err: 'Booking already done, cannot make a new payment against it', code: STATUS.FORBIDDEN };
        }

        // Check 5-minute booking expiry - auto-expire stale bookings
        const bookingTime = booking.createdAt;
        const currentTime = Date.now();
        const minutes = Math.floor(((currentTime - bookingTime) / 1000) / 60);
        
        if (minutes > 5) {
            booking.status = BOOKING_STATUS.expired;
            await booking.save();
            return booking;
        }

        // Find the associated show to reduce seat count on successful payment
        const show = await Show.findOne({
            movieId: booking.movieId,
            theatreId: booking.theatreId,
            timing: booking.timing
        });

        if (!show) {
            throw { err: 'Show not found', code: STATUS.NOT_FOUND };
        }

        // Validate payment amount matches booking total cost
        if (data.amount !== booking.totalCost) {
            throw { err: 'Payment amount does not match booking total', code: STATUS.BAD_REQUEST };
        }

        // Prevent duplicate payment records
        const existingPayment = await Payment.findOne({ booking: data.bookingId });
        if (existingPayment) {
            throw { err: 'Payment already exists for this booking', code: STATUS.BAD_REQUEST };
        }

        // Create payment record with PENDING status
        const payment = await Payment.create({
            booking: data.bookingId,
            amount: data.amount,
            status: PAYMENT_STATUS.pending
        });

        // Simulate payment processing (in real app, this would call external payment gateway)
        // Fail if amount doesn't match (shouldn't happen due to validation above, but defensive)
        if (payment.amount !== booking.totalCost) {
            payment.status = PAYMENT_STATUS.failed;
        }

        // Handle failed payment
        if (!payment || payment.status === PAYMENT_STATUS.failed) {
            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();
            await payment.save();
            return booking;
        }

        // Payment successful - update all related documents
        payment.status = PAYMENT_STATUS.success;
        booking.status = BOOKING_STATUS.successfull;
        
        // Reduce available seat count for the show
        show.noOfSeats -= booking.noOfSeats;
        if (show.noOfSeats < 0) show.noOfSeats = 0;
        
        // Save all changes atomically (sequential saves, no transaction for standalone MongoDB)
        await show.save();
        await booking.save();
        await payment.save();
        
        // Return booking with updated status for email notification
        return booking;
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
            return { err, code: STATUS.UNPROCESSABLE_ENTITY };
        }
        // Re-throw known error objects
        if (error.err) throw error;
        throw error;
    }
};

/**
 * Gets payment by ID with populated booking details.
 * @param {string} id - Payment ObjectId as a string.
 * @returns {Promise<Object>} Payment document with populated booking, or error object.
 */
const getPaymentById = async (id) => {
    try {
        // Validate ObjectId format before querying
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
 * Gets all payments based on user role.
 * Admin sees all payments; regular users see only their own.
 * @param {string} userId - User ObjectId making the request.
 * @returns {Promise<Object[]>} Array of payment documents with populated bookings.
 */
const getAllPayments = async (userId) => {
    try {
        const user = await User.findById(userId);
        let filter = {};
        
        // Non-admin users can only see their own payments
        if (user.userRole !== USER_ROLE.admin) {
            filter.userId = user.id;
        }
        
        // Find bookings belonging to the user (or all for admin)
        const bookings = await Booking.find(filter, '_id');
        const bookingIds = bookings.map(b => b._id);
        
        // Find payments linked to those bookings
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