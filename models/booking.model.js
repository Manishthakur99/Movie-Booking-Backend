const mongoose = require('mongoose');

const { BOOKING_STATUS } = require('../utils/constants');

/**
 * Mongoose schema for a Booking document.
 * Represents a user's movie ticket booking with seat count, total cost, and status.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
 */
const bookingSchema = new mongoose.Schema({
    /**
     * Reference to the Theatre where the movie is being screened.
     * @type {import('mongoose').Types.ObjectId}
     */
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Theatre'
    },
    /**
     * Reference to the Movie being booked.
     * @type {import('mongoose').Types.ObjectId}
     */
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Movie'
    },
    /**
     * Reference to the User who made the booking.
     * @type {import('mongoose').Types.ObjectId}
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    /**
     * Show timing in string format (e.g., "2024-01-15 18:00").
     * @type {string}
     */
    timing: {
        type: String,
        required: true
    },
    /**
     * Number of seats booked.
     * @type {number}
     */
    noOfSeats: {
        type: Number,
        required: true,
    },
    /**
     * Total cost of the booking (noOfSeats * show price).
     * @type {number}
     */
    totalCost: {
        type: Number,
        required: true
    },
    /**
     * Current status of the booking.
     * Possible values: PROCESSING, CANCELLED, SUCCESSFULL, EXPIRED
     * @type {string}
     */
    status: {
        type: String,
        required: true,
        enum: {
            values: [BOOKING_STATUS.processing, BOOKING_STATUS.cancelled, BOOKING_STATUS.successfull, BOOKING_STATUS.expired],
            message: "Invalid booking status"
        },
        default: BOOKING_STATUS.processing
    }
},{timestamps: true});

/**
 * Booking model registered with Mongoose.
 * @type {import('mongoose').Model<import('mongoose').Document>}
 */
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;