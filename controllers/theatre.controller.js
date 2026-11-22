const theatreService = require('../services/theatre.service');
const sendMail = require('../services/email.service');
const { STATUS } = require('../utils/constants');

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

        // Send theatre creation notification to owner
        if (req.user) {
            sendMail(
                'Theatre Created',
                req.user,
                `Your theatre "${response.theatre.name}" has been created successfully.`
            );
        }

        // Return success response with 201 Created status
        return res.status(STATUS.CREATED).json({
            success: true,
            err: {},
            message: "Successfully created the theatre",
            data: response.theatre
        });
    } catch (err) {
        // Log and return 500 Internal Server Error for unexpected errors
        console.log(err);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
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
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully deleted the given theatre",
            data: response
        });
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Unable to delete the theatre",
                data: {}
            });
        }
        // Handle unexpected errors with 500 status
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
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
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the data of the theatre",
            data: response
        });
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Unable to fetch the theatre",
                data: {}
            });
        }
        // Handle unexpected errors with 500 status
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
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
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched theatres",
            data: response.theatres
        });
    } catch (err) {
        // Log and return 500 Internal Server Error for unexpected errors
        console.log(err);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
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

        // Send theatre update notification to owner
        if (response.theatre && response.theatre.owner) {
            sendMail(
                'Theatre Updated',
                response.theatre.owner.toString(),
                `Your theatre "${response.theatre.name}" has been updated.`
            );
        }

        // Return success response with updated theatre
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully updated the theatre",
            data: response.theatre
        });
    } catch (err) {
        // Log and return 500 Internal Server Error for unexpected errors
        console.log(err);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
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

        const action = req.body.insert ? 'added to' : 'removed from';
        // Send notification about movies update
        if (response && response.owner) {
            sendMail(
                `Movies ${action.charAt(0).toUpperCase() + action.slice(1)} Theatre`,
                response.owner.toString(),
                `${req.body.movieIds.length} movie(s) have been ${action} theatre "${response.name}".`
            );
        }

        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully updated movies in the theatre",
            data: response
        });
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Unable to update movies in the theatre",
                data: {}
            });
        }
        // Handle unexpected errors with 500 status
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
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
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the movies for the theatre",
            data: response
        });
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Unable to fetch movies for the theatre",
                data: {}
            });
        }
        // Handle unexpected errors with 500 status
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
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
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully checked if movie is present in the theatre",
            data: response
        });
    } catch (error) {
        // Handle service errors with error code
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Unable to check movie in theatre",
                data: {}
            });
        }
        // Handle unexpected errors with 500 status
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

module.exports = {
    create,
    destroy,
    getTheatre,
    getAllTheatres,
    updateTheatre,
    updateMovies,
    getMovies,
    checkMovie
};