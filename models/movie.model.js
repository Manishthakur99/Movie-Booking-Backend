const mongoose = require('mongoose'); 

// Mongoose schema defines the shape of a Movie document in the `movies` collection.
// `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2
    },
    description: {
        type: String,
        required: true,
        minLength: 5
    },
    casts: {
        type: [String],
        required: true
    },
    trailerUrl: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        default: "English"
    },
    // NOTE: stored as a string (e.g. "2022-03-04") rather than a Date
    // to keep the API contract simple; format is not validated here.
    releaseDate: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    // Lifecycle state of the movie. Typical values: "RELEASED", "UPCOMING", "BLOCKED".
    releaseStatus: {
        type: String,
        required: true,
        default: "RELEASED",
    },
    poster: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const Movie = mongoose.model('Movie', movieSchema); // registers the model with Mongoose

module.exports = Movie; 