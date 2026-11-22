const { STATUS, USER_ROLE, BOOKING_STATUS } = require('../utils/constants');
const { errorResponseBody } = require('../utils/responsebody');
const ObjectId = require('mongoose').Types.ObjectId;

const theatreService = require('../services/theatre.service');
const userService = require('../services/user.service');

/**
 * Booking Validation Middlewares
 * 
 * Validates booking creation requests and enforces role-based status change permissions.
 * All middlewares use shared errorResponseBody for consistent error formatting.
 */

/**
 * Middleware that validates the booking creation request body.
 * Performs comprehensive validation:
 * - Theatre ID presence, format, and existence
 * - Movie ID presence, format, and availability at the theatre
 * - Timing presence
 * - Number of seats presence
 * Note: totalCost is calculated in the service layer from show price * seats
 * @param {Request} req - Express request; booking payload in `req.body`.
 * @param {Response} res - Express response used to send 400/404 on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending an error response.
 */
const validateBookingCreateRequest = async (req, res, next) => {
    // Validate theatre ID presence
    if (!req.body.theatreId) {
        errorResponseBody.err = "No theatre id provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate theatre ID format (must be valid MongoDB ObjectId)
    if (!ObjectId.isValid(req.body.theatreId)) {
        errorResponseBody.err = "Invalid theatreid provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Check if theatre exists in database
    const theatre = await theatreService.getTheatre(req.body.theatreId);
    if (!theatre) {
        errorResponseBody.err = "No theatre found for the given id";
        return res.status(STATUS.NOT_FOUND).json(errorResponseBody);
    }

    // Validate movie ID presence
    if (!req.body.movieId) {
        errorResponseBody.err = "No movie id present";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate movie ID format
    if (!ObjectId.isValid(req.body.movieId)) {
        errorResponseBody.err = "Invalid movie id format";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate movie is available at this theatre
    if (theatre.movies.indexOf(req.body.movieId) === -1) {
        errorResponseBody.err = "Given movie is not available in the requested theatre";
        return res.status(STATUS.NOT_FOUND).json(errorResponseBody);
    }

    // Validate timing presence
    if (!req.body.timing) {
        errorResponseBody.err = "No movie timing passed";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate number of seats presence
    if (!req.body.noOfSeats) {
        errorResponseBody.err = "No seat provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // All validations passed
    next();
};

/**
 * Middleware that enforces role-based booking status change permissions.
 * Customers can only cancel bookings (set status to CANCELLED).
 * Admins and Clients can change to any status.
 * Requires `isAuthenticated` to have run before this middleware.
 * @param {Request} req - Express request; `req.user` set by `isAuthenticated`, new status in `req.body.status`.
 * @param {Response} res - Express response used to send 401 if unauthorized.
 * @param {Function} next - Passes control to the next handler when authorized.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 401 response.
 */
const canChangeStatus = async (req, res, next) => {
    const user = await userService.getUserById(req.user);
    
    // Customers can only cancel their own bookings
    // Admins/Clients can change to any status
    if (user.userRole === USER_ROLE.customer && 
        req.body.status && 
        req.body.status !== BOOKING_STATUS.cancelled) {
        errorResponseBody.err = "You are not allowed to change the booking status";
        return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
    }
    next();
};

module.exports = {
    validateBookingCreateRequest,
    canChangeStatus
};