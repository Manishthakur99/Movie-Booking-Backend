const mongoose = require('mongoose'); 

/**
 * Mongoose schema defines the shape of a Movie document in the `movies` collection.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
 */
const movieSchema = new mongoose.Schema({
    /**
     * Name of the movie.
     * @type {string}
     */
    name: {
        type: String,
        required: true,
        minLength: 2
    },
    /**
     * Description of the movie.
     * @type {string}
     */
    description: {
        type: String,
        required: true,
        minLength: 5
    },
    /**
     * List of cast members.
     * @type {string[]}
     */
    casts: {
        type: [String],
        required: true
    },
    /**
     * URL to the movie trailer.
     * @type {string}
     */
    trailerUrl: {
        type: String,
        required: true
    },
    /**
     * Language of the movie.
     * @type {string}
     */
    language: {
        type: String,
        required: true,
        default: "English"
    },
    /**
     * Release date of the movie.
     * NOTE: stored as a string (e.g. "2022-03-04") rather than a Date
     * to keep the API contract simple; format is not validated here.
     * @type {string}
     */
    releaseDate: {
        type: String,
        required: true
    },
    /**
     * Director of the movie.
     * @type {string}
     */
    director: {
        type: String,
        required: true
    },
    /**
     * Lifecycle state of the movie. Typical values: "RELEASED", "UPCOMING", "BLOCKED".
     * @type {string}
     */
    releaseStatus: {
        type: String,
        required: true,
        default: "RELEASED",
    },
    /**
     * URL to the movie poster.
     * @type {string}
     */
    poster: {
        type: String,
        required: true,
    }
}, {timestamps: true});

/**
 * Movie model registered with Mongoose.
 * @type {import('mongoose').Model<import('mongoose').Document>}
 */
const Movie = mongoose.model('Movie', movieSchema); // registers the model with Mongoose

module.exports = Movie; 