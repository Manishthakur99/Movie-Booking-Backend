// Shared bad-request template for movie validation failures.
const badRequestResponse = {
    success: false,
    err: "",
    data: {},
    message: "Malformed Request | Bad Request"
};

/**
 * Middleware that runs before POST /mba/api/v1/movies.
 * Performs lightweight presence checks on the request body; deeper
 * schema-level validation (minLength, required) is left to Mongoose.
 * @param {Request} req - Express request; movie payload is in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateMovieCreateRequest = async (req, res, next) => {
    // Validate required field: name
    if(!req.body.name) {
        badRequestResponse.err = "The name of the movie is not present in the request";
        return res.status(400).json(badRequestResponse);
    }

    // Validate required field: description
    if(!req.body.description) {
        badRequestResponse.err = "The description of the movie is not present in the request";
        return res.status(400).json(badRequestResponse);
    }

    // Validate required field: casts (must be a non-empty array)
    if(!req.body.casts || 
       !(req.body.casts instanceof Array) ||
       req.body.casts.length <= 0
    ) {
        badRequestResponse.err = "The casts of the movie is not present in the request";
        return res.status(400).json(badRequestResponse);
    }

    // Validate required field: trailerUrl
    if(!req.body.trailerUrl) {
        badRequestResponse.err = "The trailerUrl of the movie is not present in the request";
        return res.status(400).json(badRequestResponse);
    }

    // Validate required field: releaseDate
    if(!req.body.releaseDate) {
        badRequestResponse.err = "The releaseDate of the movie is not present in the request";
        return res.status(400).json(badRequestResponse);
    }

    // Validate required field: director
    if(!req.body.director) {
        badRequestResponse.err = "The director of the movie is not present in the request";
        return res.status(400).json(badRequestResponse);
    }
    // All validations passed, proceed to next middleware/controller
    next();
}

module.exports = {
    validateMovieCreateRequest
}