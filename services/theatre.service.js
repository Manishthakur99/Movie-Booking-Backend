const Theatre = require('../models/theatre.model');

// HTTP status codes used when a service needs to signal a specific error.
const STATUS = {
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// Service layer convention mirrors movie.service.js:
// success -> `{ theatre }` / `{ theatres }`, failure -> `{ err, code }`.

/**
 * Creates a theatre document.
 * @param {Object} data - Theatre fields matching the Theatre schema.
 * @returns {Promise<{theatre?: Object, err?: string, code?: number}>} Created theatre, or an error object.
 */
const createTheatre = async (data) => {
    try {
        const theatre = await Theatre.create(data);
        return { theatre };
    } catch (error) {
        // Flatten Mongoose ValidationError into a per-field error map.
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
            return { err, code: 422 };
        }
        console.log(error);
        throw error;
    }
}

/**
 * Finds a theatre by id.
 * @param {string} id - Theatre ObjectId as a string.
 * @returns {Promise<Object>} Found theatre document.
 * @throws {Object} Throws `{ err, code: 404 }` when no theatre matches the id.
 */
const getTheatre = async (id) => {
    try {
        const response = await Theatre.findById(id);
        if (!response) {
            // Thrown as an object so the controller can read `.err` and `.code`.
            throw {
                err: "No theatre found for the given id",
                code: STATUS.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Deletes a theatre by id.
 * @param {string} id - Theatre ObjectId as a string.
 * @returns {Promise<{theatre?: Object, err?: string, code?: number}>} Deleted theatre, or an error object.
 */
const deleteTheatre = async (id) => {
    try {
        const theatre = await Theatre.findByIdAndDelete(id);
        if (!theatre) {
            return { err: "No theatre found for the given id", code: STATUS.NOT_FOUND };
        }
        return { theatre };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Updates a theatre by id (full or partial).
 * @param {string} id - Theatre ObjectId as a string.
 * @param {Object} data - Fields to update.
 * @returns {Promise<{theatre?: Object, err?: string, code?: number}>} Updated theatre, or an error object.
 */
const updateTheatre = async (id, data) => {
    try {
        // `new: true` returns the updated doc; `runValidators: true` re-validates updates.
        const theatre = await Theatre.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!theatre) {
            return { err: "No theatre found for the given id", code: STATUS.NOT_FOUND };
        }
        return { theatre };
    } catch (error) {
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
 * Fetches theatres matching optional filters.
 * @param {Object} [filter={}] - Query filters (currently supports `name` and `city`).
 * @returns {Promise<{theatres?: Object[], err?: string, code?: number}>} List of theatres, or an error object.
 */
const getAllTheatres = async (filter = {}) => {
    try {
        // Build a dynamic query; only supported filters (name, city) are applied.
        const query = {};
        if (filter.name) {
            query.name = filter.name;
        }
        if (filter.city) {
            query.city = filter.city;
        }
        const theatres = await Theatre.find(query);
        return { theatres };
    } catch (err) {
        return { err: err.message, code: STATUS.INTERNAL_SERVER_ERROR };
    }
}

const updateMoviesInTheatres = async (theatreId, movieIds, insert) => {
    try {
        let theatre;
        if (insert) {
            // we need to add movies
            theatre = await Theatre.findByIdAndUpdate(
                {_id: theatreId},
                {$addToSet: {movies: {$each: movieIds}}},
                {new: true}
            );
        } else {
            // we need to remove movies
            theatre = await Theatre.findByIdAndUpdate(
                {_id: theatreId},
                {$pull: {movies: {$in: movieIds}}},
                {new: true}
            );
        }
        
        return theatre.populate('movies');
    } catch (error) {
        if(error.name == 'TypeError') {
            throw {
                code: STATUS.NOT_FOUND,
                err: 'No theatre found for the given id'
            }
        }
        console.log("Error is", error);
        throw error;
    }
}

module.exports = {
    createTheatre,
    getTheatre,
    deleteTheatre,
    updateTheatre,
    getAllTheatres,
    updateMoviesInTheatres
}