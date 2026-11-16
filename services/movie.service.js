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
    const movie = await Movie.findById(id);
    if (!movie) {
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
    if (!mongoose.isValidObjectId(id)) {
        return { err: "Invalid movie id provided", code: 400 };
    }
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
        return { err: "No movie found for the corresponding id provided", code: 404 };
    }
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
        if (!mongoose.isValidObjectId(id)) {
            return { err: "Invalid movie id provided", code: 400 };
        }
        // `new: true` returns the updated document instead of the pre-update one;
        // `runValidators: true` re-runs schema validators on the update payload.
        const movie = await Movie.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!movie) {
            return { err: "No movie found for the corresponding id provided", code: 404 };
        }
        return { movie };
    } catch (error) {
        // Flatten Mongoose ValidationError into a per-field error map.
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
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
        const movies = await Movie.find(query);
        return { movies };
    } catch (err) {
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
