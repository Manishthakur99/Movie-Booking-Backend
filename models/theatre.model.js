const mongoose = require('mongoose');

/**
 * Mongoose schema for a Theatre document.
 */
const theatreSchema = new mongoose.Schema({
    /**
     * Name of the theatre.
     * @type {string}
     */
    name: {
        type: String,
        required: true,
        minLength: 5
    },
    /**
     * Description of the theatre.
     * @type {string}
     */
    description: String,
    /**
     * City where the theatre is located.
     * @type {string}
     */
    city: {
        type: String,
        required: true
    },
    /**
     * Pincode of the theatre location.
     * @type {number}
     */
    pincode: {
        type: Number,
        required: true
    },
    /**
     * Address of the theatre.
     * @type {string}
     */
    address: String,
    /**
     * Reference to the User who owns this theatre.
     * Required so every theatre has an accountable owner.
     * @type {import('mongoose').Types.ObjectId}
     */
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    /**
     * List of movies currently screening at this theatre (movie ObjectIds).
     * @type {import('mongoose').Types.ObjectId[]}
     */
    movies: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Movie'
    }
}, {timestamps: true});

/**
 * Theatre model registered with Mongoose.
 * @type {import('mongoose').Model<import('mongoose').Document>}
 */
const Theatre = mongoose.model('Theatre', theatreSchema);

module.exports = Theatre;