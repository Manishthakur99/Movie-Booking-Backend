/**
 * Theatre Validation Middlewares
 * 
 * Validates theatre creation and movie update requests before they reach the controller.
 * Performs lightweight presence and format checks; deeper schema-level validation
 * is handled by Mongoose.
 * Note: `errorResponseBody` is a shared singleton object (see utils/responsebody.js).
 */

const { errorResponseBody } = require('../utils/responsebody');
const { STATUS } = require('../utils/constants');

/**
 * Middleware that runs before POST /mba/api/v1/theatres.
 * Validates required fields for theatre creation:
 * - name (string, min 5 chars)
 * - city (string, required)
 * - pincode (number, required)
 * Note: description, address are optional; owner is set from auth middleware
 * @param {Request} req - Express request; theatre payload is in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateTheatreCreateRequest = async (req, res, next) => {
    // Validate required field: name
    if (!req.body.name) {
        errorResponseBody.err = "The name of the theatre is not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // Validate required field: pincode
    if (!req.body.pincode) {
        errorResponseBody.err = "The pincode of the theatre is not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // Validate required field: city
    if (!req.body.city) {
        errorResponseBody.err = "The city of the theatre is not present";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // All validations passed, proceed to next middleware/controller
    next();
};

/**
 * Middleware that runs before PATCH /mba/api/v1/theatres/:id/movies.
 * Validates the presence and correctness of required fields for movie list updates:
 * - insert (boolean, required): true to add movies, false to remove
 * - movieIds (array, required): non-empty array of Movie ObjectIds
 * @param {Request} req - Express request; update payload is in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateUpdateMoviesRequest = async (req, res, next) => {
    // Validate required field: insert (boolean flag for add/remove)
    if (req.body.insert === undefined) {
        errorResponseBody.err = "The insert parameter is missing in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // Validate required field: movieIds presence
    if (!req.body.movieIds) {
        errorResponseBody.err = "No movies present in the request to be updated in theatre";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // Validate that movieIds is an array
    if (!(req.body.movieIds instanceof Array)) {
        errorResponseBody.err = "Expected array of movies but found something else";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // Validate that movieIds array is not empty
    if (req.body.movieIds.length === 0) {
        errorResponseBody.err = "No movies present in the array provided";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    // All validations passed, proceed to next middleware/controller
    next();
};

module.exports = {
    validateTheatreCreateRequest,
    validateUpdateMoviesRequest
};