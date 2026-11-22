const Booking = require('../models/booking.model');
const Show = require('../models/show.model');

const { STATUS } = require('../utils/constants');

// Service layer convention: every function returns a plain object.
// On failure it returns `{ err, code }`; on success it returns the created/found document(s).
// Controllers translate that object into the HTTP response.

/**
 * Creates a new booking document.
 * Automatically calculates totalCost based on show price and number of seats.
 * @param {Object} data - Booking fields (theatreId, movieId, userId, timing, noOfSeats).
 * @returns {Promise<Object>} Created booking document with calculated totalCost.
 * @throws {Object} Throws `{ err, code }` on validation error or show not found.
 */
const createBooking = async (data) => {
    try {
        // Find the show to get the price for totalCost calculation
        const show = await Show.findOne({
            movieId: data.movieId, 
            theatreId: data.theatreId, 
            timing: data.timing
        });
        
        if (!show) {
            throw {
                err: 'Show not found for the given movie, theatre, and timing',
                code: STATUS.NOT_FOUND
            };
        }
        
        // Calculate total cost: number of seats * price per seat
        data.totalCost = data.noOfSeats * show.price;
        const response = await Booking.create(data);
        return response;
    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach(key => {
                err[key] = error.errors[key].message;
            });
            throw { err, code: STATUS.UNPROCESSABLE_ENTITY };
        }
        throw error;
    }
};

/**
 * Updates a booking by id (full or partial).
 * @param {Object} data - Fields to update.
 * @param {string} bookingId - Booking ObjectId as a string.
 * @returns {Promise<Object>} Updated booking document.
 * @throws {Object} Throws `{ err, code }` on validation error or not found.
 */
const updateBooking = async (data, bookingId) => {
    try {
        // `new: true` returns the updated document; `runValidators: true` re-runs schema validators.
        const response = await Booking.findByIdAndUpdate(bookingId, data, {
            new: true, 
            runValidators: true
        });
        if (!response) {
            throw {
                err: "No booking found for the given id",
                code: STATUS.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach(key => {
                err[key] = error.errors[key].message;
            });
            throw { err, code: STATUS.UNPROCESSABLE_ENTITY };
        }
        console.log(error);
        throw error;
    }
};

/**
 * Fetches bookings matching the given filter.
 * Typically used to get bookings for a specific user.
 * @param {Object} [data={}] - Query filter (e.g., { userId: '...' }).
 * @returns {Promise<Object[]>} List of bookings matching the filter.
 * @throws {Object} Throws `{ err, code }` on error.
 */
const getBookings = async (data) => {
    try {
        const response = await Booking.find(data);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetches all bookings (admin only).
 * @returns {Promise<Object[]>} List of all bookings.
 * @throws {Object} Throws `{ err, code }` on error.
 */
const getAllBookings = async () => {
    try {
        const response = await Booking.find();
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetches a booking by id with user authorization check.
 * Ensures the requesting user owns the booking (or is admin).
 * @param {string} id - Booking ObjectId as a string.
 * @param {string} userId - User ObjectId making the request.
 * @returns {Promise<Object>} Booking document.
 * @throws {Object} Throws `{ err, code: 404 }` if not found, `{ err, code: 401 }` if unauthorized.
 */
const getBookingById = async (id, userId) => {
    try {
        const response = await Booking.findById(id);
        if (!response) {
            throw {
                err: 'No booking records found for the id',
                code: STATUS.NOT_FOUND
            };
        }
        // Ensure user owns this booking (comparing ObjectId as strings)
        if (response.userId.toString() !== userId) {
            throw {
                err: 'Not able to access the booking',
                code: STATUS.UNAUTHORISED
            };
        }
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}; 

module.exports = { 
    createBooking,
    updateBooking,
    getBookings,
    getAllBookings,
    getBookingById
};