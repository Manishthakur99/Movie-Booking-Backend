const mongoose = require('mongoose');
const Movie = require('../models/movie.model');

// Service layer convention: every function returns a plain object.
// On failure it returns `{ err, code }`; on success it returns `{ movie }` / `{ movies }`.
// Controllers translate that object into the HTTP response.

/**
 * Creates a movie document.
 * @param {Object} data - Movie fields matching the Movie schema.
 * @returns {Promise<{movie?: Object, err?: string, code?: number}>} Created movie, or an error object.
 */
const createMovie = async (data) => {
    try {
        // Create a new movie document in MongoDB with the provided data
        const movie = await Movie.create(data);
        return { movie };
    } catch (err) {
        // NOTE: unlike updateMovie, this returns a generic 400 rather than a
        // per-field 422 ValidationError — kept as-is, but worth aligning later.
        return { err: err.message, code: 400 };
    }
};

/**
 * Finds a movie by id.
 * @param {string} id - Movie ObjectId as a string.
 * @returns {Promise<{movie?: Object, err?: string, code?: number}>} Found movie, or an error object.
 */
const getMovieById = async (id) => {
    // Guard against malformed ObjectIds so Mongoose doesn't throw a CastError.
    if (!mongoose.isValidObjectId(id)) {
        return { err: "Invalid movie id provided", code: 400 };
    }
    // Query MongoDB for movie by its ObjectId
    const movie = await Movie.findById(id);
    if (!movie) {
        // Return 404 if movie doesn't exist
        return { err: "No movie found for the corresponding id provided", code: 404 };
    }
    return { movie };
};

/**
 * Deletes a movie by id.
 * @param {string} id - Movie ObjectId as a string.
 * @returns {Promise<{movie?: Object, err?: string, code?: number}>} Deleted movie, or an error object.
 */
const deleteMovie = async (id) => {
    // Validate that the id is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return { err: "Invalid movie id provided", code: 400 };
    }
    // Find movie by id and delete it in one operation
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
        // Return 404 if movie doesn't exist
        return { err: "No movie found for the corresponding id provided", code: 404 };
    }
    // Return the deleted movie document
    return { movie };
};

/**
 * Updates a movie by id (full or partial).
 * @param {string} id - Movie ObjectId as a string.
 * @param {Object} data - Fields to update.
 * @returns {Promise<{movie?: Object, err?: string, code?: number}>} Updated movie, or an error object.
 */
const updateMovie = async (id, data) => {
    try {
        // Validate that the id is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return { err: "Invalid movie id provided", code: 400 };
        }
        // `returnDocument: 'after'` returns the updated document instead of the pre-update one;
        // `runValidators: true` re-runs schema validators on the update payload.
        const movie = await Movie.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
        if (!movie) {
            // Return 404 if movie doesn't exist
            return { err: "No movie found for the corresponding id provided", code: 404 };
        }
        return { movie };
    } catch (error) {
        // Flatten Mongoose ValidationError into a per-field error map.
        if (error.name === 'ValidationError') {
            let err = {};
            // Extract error messages for each invalid field
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
            // Return 422 Unprocessable Entity for validation errors
            return { err, code: 422 };
        }
        throw error;
    }
}

/**
 * Fetches movies matching optional filters.
 * @param {Object} [filter={}] - Query filters (currently supports `name`).
 * @returns {Promise<{movies?: Object[], err?: string, code?: number}>} List of movies, or an error object.
 */
const fetchMovies = async (filter = {}) => {
    try {
        // Build a dynamic query; only supported filters are applied.
        const query = {};
        if (filter.name) {
            query.name = filter.name;
        }
        // Execute query with the built filter
        const movies = await Movie.find(query);
        return { movies };
    } catch (err) {
        // Return 500 Internal Server Error for any unexpected errors
        return { err: err.message, code: 500 };
    }
}

module.exports = {
    createMovie,
    getMovieById,
    deleteMovie,
    updateMovie,
    fetchMovies
};
