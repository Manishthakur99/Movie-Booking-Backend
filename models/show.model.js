const mongoose = require('mongoose');

/**
 * Mongoose schema for a Show document.
 * Represents a movie screening at a specific theatre with timing, seat count, and pricing.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
 */
const showSchema = new mongoose.Schema({
    /**
     * Reference to the Theatre where the show is screening.
     * @type {import('mongoose').Types.ObjectId}
     */
    theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Theatre'
    },
    /**
     * Reference to the Movie being screened.
     * @type {import('mongoose').Types.ObjectId}
     */
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Movie'
    },
    /**
     * Show timing in string format (e.g., "2024-01-15 18:00").
     * @type {string}
     */
    timing: {
        type: String,
        required: true
    },
    /**
     * Total number of seats available for this show.
     * @type {number}
     */
    noOfSeats: {
        type: Number,
        required: true
    },
    /**
     * Price per seat for this show.
     * @type {number}
     */
    price: {
        type: Number,
        required: true
    },
    /**
     * Optional format of the show (e.g., "2D", "3D", "IMAX").
     * @type {string}
     */
    format: {
        type: String
    }
}, {timestamps: true});

/**
 * Show model registered with Mongoose.
 * @type {import('mongoose').Model<import('mongoose').Document>}
 */
const Show = mongoose.model('Show', showSchema);

module.exports = Show;