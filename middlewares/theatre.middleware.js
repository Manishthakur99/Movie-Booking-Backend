const { errorResponseBody } = require('../utils/responsebody');

/**
 * Middleware that runs before POST /mba/api/v1/theatres.
 * Validates presence of the required create fields (name, pincode, city).
 * Note: `errorResponseBody` is a shared singleton object (see utils/responsebody.js).
 * @param {Request} req - Express request; theatre payload is in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateTheatreCreateRequest = async (req, res, next) => {
    if(!req.body.name) {
        errorResponseBody.err = "The name of the theatre is not present in the request";
        return res.status(400).json(errorResponseBody)
    }
    if(!req.body.pincode) {
        errorResponseBody.err = "The pincode of the theatre is not present in the request";
        return res.status(400).json(errorResponseBody);
    }
    if(!req.body.city) {
        errorResponseBody.err = "The city of the theatre is not present";
        return res.status(400).json(errorResponseBody);
    }
    next();
}

module.exports = {
    validateTheatreCreateRequest
}