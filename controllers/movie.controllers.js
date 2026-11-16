const movieService = require('../services/movie.service');

// Controllers translate the service result (`{ err, code }` or `{ movie }`)
// into a consistent JSON envelope: `{ success, err, message, data }`.
// Status codes: 201 on create, 200 otherwise, service `code` on failure, 500 on unexpected errors.

/**
 * Creates a new movie.
 * @param {Request} req - Express request; movie payload is in `req.body`.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 201 on success or an error status.
 */
const createMovie = async (req, res) => {
    try {
        const response = await movieService.createMovie(req.body);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Validation failed on few parameters of the request body",
                data: {}
            });
        }
        return res.status(201).json({
            success: true,
            err: {},
            message: "Successfully created the movie",
            data: response.movie
        });
    } catch (err) {
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
 * Deletes a movie by id.
 * @param {Request} req - Express request; `req.params.id` is the movie id.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const deleteMovie = async (req, res) => {
    try {
        const response = await movieService.deleteMovie(req.params.id);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to delete the movie",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully deleted the movie",
            data: response.movie
        });
    } catch (err) {
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
 * Fetches a single movie by id.
 * @param {Request} req - Express request; `req.params.id` is the movie id.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const getMovie = async (req, res) => {
    try {
        const response = await movieService.getMovieById(req.params.id);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to fetch the movie",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully fetched the movie",
            data: response.movie
        });
    } catch (err) {
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
 * Updates a movie by id (full or partial).
 * @param {Request} req - Express request; `req.params.id` is the movie id, `req.body` holds the fields to update.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const updateMovie = async (req, res) => {
    try {
        const response = await movieService.updateMovie(req.params.id, req.body);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to update the movie",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully updated the movie",
            data: response.movie
        });
    } catch (err) {
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
 * Fetches a list of movies.
 * @param {Request} req - Express request; optional filters are in `req.query`.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response with status 200 on success or an error status.
 */
const getMovies = async (req, res) => {
    try {
        const response = await movieService.fetchMovies(req.query);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to fetch the movies",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully fetched the movies",
            data: response.movies
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
}


module.exports = {
    createMovie,
    deleteMovie,
    getMovie,
    updateMovie,
    getMovies
};
