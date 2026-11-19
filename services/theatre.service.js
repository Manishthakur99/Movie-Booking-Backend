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
        // Create a new theatre document in MongoDB with the provided data
        const theatre = await Theatre.create(data);
        return { theatre };
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
        // Query MongoDB for theatre by its ObjectId
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
        // Log and re-throw any unexpected errors
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
        // Find theatre by id and delete it in one operation
        const theatre = await Theatre.findByIdAndDelete(id);
        if (!theatre) {
            // Return error if theatre doesn't exist
            return { err: "No theatre found for the given id", code: STATUS.NOT_FOUND };
        }
        // Return the deleted theatre document
        return { theatre };
    } catch (error) {
        // Log and re-throw any unexpected errors
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
        // `returnDocument: 'after'` returns the updated doc; `runValidators: true` re-validates updates.
        const theatre = await Theatre.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
        if (!theatre) {
            // Return error if theatre doesn't exist
            return { err: "No theatre found for the given id", code: STATUS.NOT_FOUND };
        }
        return { theatre };
    } catch (error) {
        // Handle validation errors
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
 * Fetches theatres matching optional filters.
 * @param {Object} [filter={}] - Query filters (currently supports `name`, `city`, `pincode`).
 * @returns {Promise<{theatres?: Object[], err?: string, code?: number}>} List of theatres, or an error object.
 */
const getAllTheatres = async (filter = {}) => {
    try {
        // Build a dynamic query; only supported filters (name, city, pincode) are applied.
        const query = {};
        if (filter.name) {
            query.name = filter.name;
        }
        if (filter.city) {
            query.city = filter.city;
        }
        if (filter.pincode) {
            query.pincode = filter.pincode;
        }
        // Execute query with the built filter
        const theatres = await Theatre.find(query);
        return { theatres };
    } catch (err) {
        // Return 500 Internal Server Error for any unexpected errors
        return { err: err.message, code: STATUS.INTERNAL_SERVER_ERROR };
    }
}

/**
 * Adds or removes movies from a theatre's movie list.
 * @param {string} theatreId - Theatre ObjectId as a string.
 * @param {string[]} movieIds - Array of Movie ObjectIds to add or remove.
 * @param {boolean} insert - If true, adds movies; if false, removes movies.
 * @returns {Promise<Object>} Updated theatre document with movies populated.
 * @throws {Object} Throws `{ err, code: 404 }` when no theatre matches the id.
 */
const updateMoviesInTheatres = async (theatreId, movieIds, insert) => {
    try {
        let theatre;
        if (insert) {
            // we need to add movies
            theatre = await Theatre.findByIdAndUpdate(
                {_id: theatreId},
                {$addToSet: {movies: {$each: movieIds}}},
                { returnDocument: 'after' }
            );
        } else {
            // we need to remove movies
            theatre = await Theatre.findByIdAndUpdate(
                {_id: theatreId},
                {$pull: {movies: {$in: movieIds}}},
                { returnDocument: 'after' }
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

/**
 * Fetches a theatre with its associated movies populated.
 * @param {string} id - Theatre ObjectId as a string.
 * @returns {Promise<Object>} Theatre document with movies populated.
 * @throws {Object} Throws `{ err, code: 404 }` when no theatre matches the id.
 */
const getMoviesInATheatre = async (id) => {
    try {
        const theatre = await Theatre.findById(id, {name: 1, movies: 1, address: 1}).populate('movies');
        if(!theatre) {
            throw {
                err: 'No theatre with the given id found',
                code: STATUS.NOT_FOUND
            }
        }
        return theatre;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Checks if a movie is associated with a theatre.
 * @param {string} theatreId - Theatre ObjectId as a string.
 * @param {string} movieId - Movie ObjectId as a string.
 * @returns {Promise<boolean>} True if the movie is in the theatre's movie list, false otherwise.
 * @throws {Object} Throws `{ err, code: 404 }` when no theatre matches the id.
 */
const checkMovieInATheatre = async (theatreId, movieId) => {
    try {
        let response = await Theatre.findById(theatreId);
        if(!response) {
            throw {
                err: "No such theatre found for the given id",
                code: STATUS.NOT_FOUND
            }
        }
        return response.movies.indexOf(movieId) != -1;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    createTheatre,
    getTheatre,
    deleteTheatre,
    updateTheatre,
    getAllTheatres,
    updateMoviesInTheatres,
    getMoviesInATheatre,
    checkMovieInATheatre
};