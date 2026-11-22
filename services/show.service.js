const mongoose = require('mongoose');
const Show = require('../models/show.model');
const Theatre = require('../models/theatre.model');
const { STATUS } = require('../utils/constants');

// Service layer convention: every function returns a plain object.
// On failure it returns `{ err, code }`; on success it returns the created/found document(s).
// Controllers translate that object into the HTTP response.

/**
 * Creates a new show document.
 * Validates that the theatre exists and the movie is available at that theatre.
 * @param {Object} data - Show fields matching the Show schema (theatreId, movieId, timing, noOfSeats, price, format).
 * @returns {Promise<Object>} Created show document, or throws an error object on failure.
 */
const createShow = async (data) => {
    try {
        // Verify theatre exists
        const theatre = await Theatre.findById(data.theatreId);
        if (!theatre) {
            throw {
                err: 'No theatre found',
                code: STATUS.NOT_FOUND
            };
        }
        // Verify movie is available at this theatre
        if (theatre.movies.indexOf(data.movieId) === -1) {
            throw {
                err: 'Movie is currently not available in the requested theatre',
                code: STATUS.NOT_FOUND
            };
        }
        // Create the show
        const response = await Show.create(data);
        return response;
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach(key => {
                err[key] = error.errors[key].message;
            });
            throw {
                err,
                code: STATUS.UNPROCESSABLE_ENTITY
            };
        }
        throw error;
    }
};

/**
 * Fetches shows matching optional filters.
 * @param {Object} [data={}] - Query filters (supports `theatreId`, `movieId`).
 * @returns {Promise<Object[]>} List of shows matching the filters.
 * @throws {Object} Throws `{ err, code }` on error.
 */
const getShows = async (data) => {
    try {
        let filter = {};
        if (data.theatreId) {
            filter.theatreId = data.theatreId;
        } 
        if (data.movieId) {
            filter.movieId = data.movieId;
        }
        const response = await Show.find(filter);
        if (!response || response.length === 0) {
            throw {
                err: 'No shows found',
                code: STATUS.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Deletes a show by id.
 * @param {string} id - Show ObjectId as a string.
 * @returns {Promise<Object>} Deleted show document.
 * @throws {Object} Throws `{ err, code: 404 }` if show not found.
 */
const deleteShow = async (id) => {
    try {
        const response = await Show.findByIdAndDelete(id);
        if (!response) {
            throw {
                err: 'No show found',
                code: STATUS.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Updates a show by id (full or partial).
 * @param {string} id - Show ObjectId as a string.
 * @param {Object} data - Fields to update.
 * @returns {Promise<Object>} Updated show document.
 * @throws {Object} Throws `{ err, code }` on validation error or not found.
 */
const updateShow = async (id, data) => {
    try {
        // `new: true` returns the updated document; `runValidators: true` re-runs schema validators.
        const response = await Show.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!response) {
            throw {
                err: 'No show found for the given id',
                code: STATUS.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach(key => {
                err[key] = error.errors[key].message;
            });
            throw {
                err,
                code: STATUS.UNPROCESSABLE_ENTITY
            };
        }
        throw error;
    }
};

/**
 * Finds a show by theatre, movie, and timing combination.
 * Used for booking to calculate total cost from show price.
 * @param {string} theatreId - Theatre ObjectId.
 * @param {string} movieId - Movie ObjectId.
 * @param {string} timing - Show timing string.
 * @returns {Promise<Object>} Show document.
 * @throws {Object} Throws `{ err, code: 404 }` if show not found.
 */
const getShowByTheatreMovieTiming = async (theatreId, movieId, timing) => {
    try {
        const show = await Show.findOne({ theatreId, movieId, timing });
        if (!show) {
            throw {
                err: 'No show found for the given theatre, movie, and timing',
                code: STATUS.NOT_FOUND
            };
        }
        return show;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createShow,
    getShows,
    deleteShow,
    updateShow,
    getShowByTheatreMovieTiming
};