/**
 * Booking Controller
 * 
 * Handles booking operations: create, update status, fetch user bookings, admin fetch all.
 * All responses follow the standard envelope: { success, err, message, data }
 */

const bookingService = require('../services/booking.services');
const { STATUS } = require('../utils/constants');

/**
 * Creates a new booking for the authenticated user.
 * Total cost is calculated in service layer from show price * number of seats.
 * @param {Request} req - Express request; `req.user` is authenticated user id.
 *   Body: { theatreId, movieId, timing, noOfSeats }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 201 on success or error status.
 */
const create = async (req, res) => {
    try {
        const userId = req.user;
        const response = await bookingService.createBooking({ ...req.body, userId: userId });
        return res.status(STATUS.CREATED).json({
            success: true,
            err: {},
            message: "Successfully created a booking",
            data: response
        });
    } catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to create booking",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
};

/**
 * Updates a booking's status (e.g., cancel booking).
 * Customers can only cancel (set to CANCELLED); Admins/Clients can set any status.
 * Authorization enforced by `canChangeStatus` middleware.
 * @param {Request} req - Express request; `req.params.id` is booking id.
 *   Body: { status }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 200 on success or error status.
 */
const update = async (req, res) => {
    try {
        const response = await bookingService.updateBooking(req.body, req.params.id);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully updated the booking",
            data: response
        });
    } catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to update booking",
                data: {}
            });
        }
        console.log(error);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
};

/**
 * Fetches all bookings for the authenticated user.
 * @param {Request} req - Express request; `req.user` is authenticated user id.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with user's bookings.
 */
const getBookings = async (req, res, next) => {
    try {
        const response = await bookingService.getBookings({ userId: req.user });
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the bookings",
            data: response
        });
    } catch (error) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
};

/**
 * Fetches all bookings (admin only).
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with all bookings.
 */
const getAllBookings = async (req, res, next) => {
    try {
        const response = await bookingService.getAllBookings();
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the bookings",
            data: response
        });
    } catch (error) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
};

/**
 * Fetches a specific booking by ID with ownership verification.
 * Ensures the requesting user owns the booking.
 * @param {Request} req - Express request; `req.params.id` is booking id, `req.user` is authenticated user id.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with booking details or error.
 */
const getBookingById = async (req, res, next) => {
    try {
        const response = await bookingService.getBookingById(req.params.id, req.user);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the booking",
            data: response
        });
    } catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to fetch booking",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
};

module.exports = {
    create,
    update,
    getBookings,
    getAllBookings,
    getBookingById
};