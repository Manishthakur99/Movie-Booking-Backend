const theatreService = require('../services/theatre.service');
const { successResponseBody, errorResponseBody } = require('../utils/responsebody');

// Local status codes referenced by the controller handlers below.
const STATUS = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND: 404
};

// NOTE: `successResponseBody` / `errorResponseBody` are shared singleton objects
// (see utils/responsebody.js). Mutating them here is unsafe under concurrency;
// this file was kept as-is but should ideally build a fresh object per request.

/**
 * Creates a new theatre.
 * @param {Request} req - Express request; theatre payload is in `req.body`.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 201 on success or an error status.
 */
const create = async (req, res) => {
    try {
        // Copy request body to avoid mutating the original
        const data = { ...req.body };
        // If an authenticated user is attached (by a future auth middleware),
        // set them as the theatre owner.
        if (req.user) {
            data.owner = req.user;
        }

        // Call service to create theatre
        const response = await theatreService.createTheatre(data);
        if (response.err) {
            // Return validation error response if service returned an error
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to create the theatre",
                data: {}
            });
        }

        // Return success response with 201 Created status
        return res.status(201).json({
            success: true,
            err: {},
            message: "Successfully created the theatre",
            data: response.theatre
        });
    } catch (err) {
        // Log and return 500 Internal Server Error for unexpected errors
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
};

/**
 * Deletes a theatre by id.
 * @param {Request} req - Express request; `req.params.id` is the theatre id.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const destroy = async (req, res) => {
    try {
        // Call service to delete theatre by id
        const response = await theatreService.deleteTheatre(req.params.id);
        // Set success response data and message
        successResponseBody.data = response;
        successResponseBody.message = "Successfully deleted the given theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        // Handle unexpected errors with 500 status
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Fetches a single theatre by id.
 * @param {Request} req - Express request; `req.params.id` is the theatre id.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const getTheatre = async (req, res) => {
    try {
        // Call service to get theatre by id
        const response = await theatreService.getTheatre(req.params.id);
        // Set success response data and message
        successResponseBody.data = response;
        successResponseBody.message = "Successfully fetched the data of the theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        // Handle unexpected errors with 500 status
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Fetches a list of theatres.
 * @param {Request} req - Express request; optional filters are in `req.query`.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const getAllTheatres = async (req, res) => {
    try {
        // Call service to get all theatres with optional filters from query params
        const response = await theatreService.getAllTheatres(req.query);
        if (response.err) {
            // Return error response if service returned an error
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to fetch theatres",
                data: {}
            });
        }
        // Return success response with list of theatres
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully fetched theatres",
            data: response.theatres
        });
    } catch (err) {
        // Log and return 500 Internal Server Error for unexpected errors
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
}

/**
 * Updates a theatre by id (full or partial).
 * @param {Request} req - Express request; `req.params.id` is the theatre id, `req.body` holds the fields to update.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const updateTheatre = async (req, res) => {
    try {
        // Call service to update theatre by id with data from request body
        const response = await theatreService.updateTheatre(req.params.id, req.body);
        if (response.err) {
            // Return error response if service returned an error
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to update the theatre",
                data: {}
            });
        }
        // Return success response with updated theatre
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully updated the theatre",
            data: response.theatre
        });
    } catch (err) {
        // Log and return 500 Internal Server Error for unexpected errors
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
}

/**
 * Adds or removes movies from a theatre.
 * @param {Request} req - Express request; `req.params.id` is the theatre id, `req.body.movieIds` is the array of movie ids, `req.body.insert` is a boolean (true to add, false to remove).
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const updateMovies = async (req, res) => {
    try {
        // Call service to add or remove movies from theatre
        const response = await theatreService.updateMoviesInTheatres(
            req.params.id,
            req.body.movieIds,
            req.body.insert
        );
        // Set success response data and message
        successResponseBody.data = response;
        successResponseBody.message = "Successfully updated movies in the theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        // Handle service errors with error code
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        // Handle unexpected errors with 500 status
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Updates a theatre by id (full or partial).
 * @param {Request} req - Express request; `req.params.id` is the theatre id, `req.body` holds the fields to update.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const update = async (req, res) => {
    try {
        // Call service to update theatre by id with data from request body
        const response = await theatreService.updateTheatre(req.params.id, req.body);
        // Set success response data and message
        successResponseBody.data = response;
        successResponseBody.message = "Successfully updated the theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        // Handle service errors with error code
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        // Handle unexpected errors with 500 status
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Fetches movies associated with a theatre.
 * @param {Request} req - Express request; `req.params.id` is the theatre id.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const getMovies = async (req, res) => {
    try {
        // Call service to get movies for a theatre
        const response = await theatreService.getMoviesInATheatre(req.params.id);
        // Set success response data and message
        successResponseBody.data = response;
        successResponseBody.message = "Successfully fetched the movies for the theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        // Handle service errors with error code
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        // Handle unexpected errors with 500 status
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Checks if a movie is associated with a theatre.
 * @param {Request} req - Express request; `req.params.theatreId` is the theatre id, `req.params.movieId` is the movie id.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const checkMovie = async (req, res) => {
    try {
        // Call service to check if movie is in theatre
        const response = await theatreService.checkMovieInATheatre(req.params.theatreId, req.params.movieId);
        // Set success response data and message
        successResponseBody.data = response;
        successResponseBody.message = "Successfully checked if movie is present in the theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        // Handle service errors with error code
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        // Handle unexpected errors with 500 status
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

module.exports = {
    create,
    destroy,
    getTheatre,
    getAllTheatres,
    updateTheatre,
    updateMovies,
    update,
    getMovies,
    checkMovie
};
