const mongoose = require('mongoose');

// Mongoose schema for a Theatre document.
const theatreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 5
    },
    description: String,
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    address: String,
    // Reference to the User who owns this theatre.
    // Required so every theatre has an accountable owner.
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // List of movies currently screening at this theatre (movie ObjectIds).
    movies: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Movie'
    }
}, {timestamps: true});

const Theatre = mongoose.model('Theatre', theatreSchema);

module.exports = Theatre;