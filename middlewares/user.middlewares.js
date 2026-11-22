/**
 * User Validation Middlewares
 * 
 * Validates user update requests (admin only) before they reach the controller.
 * Note: `errorResponseBody` is a shared singleton object (see utils/responsebody.js).
 */

const { errorResponseBody } = require("../utils/responsebody");
const { STATUS } = require("../utils/constants");

/**
 * Middleware that validates the request body for updating a user (PATCH /mba/api/v1/user/:id).
 * Ensures at least one of `userRole` or `userStatus` is present.
 * Admin-only endpoint; authentication and admin check happen in route middleware.
 * @param {Request} req - Express request; update payload is in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateUpdateUserRequest = (req, res, next) => {
    if (!(req.body.userRole || req.body.userStatus)) {
        errorResponseBody.err = 'Malformed request, please send atleast one parameter';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }
    next();
};

module.exports = {
    validateUpdateUserRequest
};