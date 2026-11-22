/**
 * Show Validation Middlewares
 * 
 * Validates show creation and update requests before they reach the controller.
 * Performs presence, format, and business logic validation.
 * Note: `errorResponseBody` is a shared singleton object (see utils/responsebody.js).
 */

const { STATUS } = require('../utils/constants');
const { errorResponseBody } = require('../utils/responsebody');
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Middleware that runs before POST /mba/api/v1/shows.
 * Validates required fields for show creation:
 * - theatreId (valid ObjectId, required)
 * - movieId (valid ObjectId, required)
 * - timing (string, required)
 * - noOfSeats (number, required)
 * - price (number, required)
 * Note: format is optional
 * @param {Request} req - Express request; show payload in req.body.
 * @param {Response} res - Express response used to send 400 on invalid input.
 * @param {Function} next - Next handler.
 * @returns {Promise<void>}
 */
const validateCreateShowRequest = async (req, res, next) => {
    // Validate theatreId presence and format
    if (!req.body.theatreId) {
        errorResponseBody.err = "No theatre provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    if (!ObjectId.isValid(req.body.theatreId)) {
        errorResponseBody.err = "Invalid theatre id";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate movieId presence and format
    if (!req.body.movieId) {
        errorResponseBody.err = "No movie provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    if (!ObjectId.isValid(req.body.movieId)) {
        errorResponseBody.err = "Invalid movie id";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate timing presence
    if (!req.body.timing) {
        errorResponseBody.err = "No timing provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate noOfSeats presence
    if (!req.body.noOfSeats) {
        errorResponseBody.err = "No seat info provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    // Validate price presence
    if (!req.body.price) {
        errorResponseBody.err = "No price information provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    next();
};

/**
 * Middleware that runs before PATCH /mba/api/v1/shows/:id.
 * Prevents modification of theatreId or movieId for existing shows.
 * These fields are immutable after creation to maintain data integrity.
 * @param {Request} req - Express request; update payload in req.body.
 * @param {Response} res - Express response used to send 400 on invalid input.
 * @param {Function} next - Next handler.
 * @returns {Promise<void>}
 */
const validateShowUpdateRequest = async (req, res, next) => {
    if (req.body.theatreId || req.body.movieId) {
        errorResponseBody.err = "We cannot update theatre or movie for an already added show";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    next();
};

module.exports = {
    validateCreateShowRequest,
    validateShowUpdateRequest
};