const mongoose = require('mongoose');
const Show = require('../models/show.model');
const Theatre = require('../models/theatre.model');
const { STATUS } = require('../utils/constants');

const createShow = async (data) => {
    try {
        const theatre = await Theatre.findById(data.theatreId);
        if(!theatre) {
            throw {
                err: 'No theatre found',
                code: STATUS.NOT_FOUND
            }
        }
        if(theatre.movies.indexOf(data.movieId) == -1) {
            throw {
                err: 'Movie is currently not available in the requested theatre',
                code: STATUS.NOT_FOUND
            }
        }
        const response = await Show.create(data);
        return response;
    } catch (error) {
        if(error.name == 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach(key => {
                err[key] = error.errors[key].message;
            });
            throw {
                err,
                code: STATUS.UNPROCESSABLE_ENTITY
            }
        }
        throw error;
    }
}

/**
 * Fetches a single show by id.
 * @param {string} id - Show ObjectId as a string.
 * @returns {Promise<Object>} Found show document, or throws `{ err, code: 404 }` if not found.
 */
const getShowById = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return { err: "Invalid show id provided", code: STATUS.BAD_REQUEST };
    }
    const show = await Show.findById(id);
    if (!show) {
        throw { err: "No show found for the given id", code: STATUS.NOT_FOUND };
    }
    return show;
};

/**
 * Fetches shows matching optional filters.
 * @param {Object} [filter={}] - Query filters (currently supports `theatreId`, `movieId`).
 * @returns {Promise<{shows?: Object[], err?: string, code?: number}>} List of shows, or an error object.
 */
const fetchShows = async (filter = {}) => {
    try {
        const query = {};
        if (filter.theatreId) {
            query.theatreId = filter.theatreId;
        }
        if (filter.movieId) {
            query.movieId = filter.movieId;
        }
        const shows = await Show.find(query);
        return { shows };
    } catch (err) {
        return { err: err.message, code: STATUS.INTERNAL_SERVER_ERROR };
    }
}

module.exports = {
    createShow,
    getShowById,
    fetchShows
}