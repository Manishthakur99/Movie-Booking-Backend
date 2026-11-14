const mongoose = require('mongoose');
const Movie = require('../models/movie.model');

const createMovie = async (data) => {
    try {
        const movie = await Movie.create(data);
        return { movie };
    } catch (err) {
        return { err: err.message, code: 400 };
    }
};

const getMovieById = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return { err: "Invalid movie id provided", code: 400 };
    }
    const movie = await Movie.findById(id);
    if (!movie) {
        return { err: "No movie found for the corresponding id provided", code: 404 };
    }
    return { movie };
};

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

module.exports = {
    createMovie,
    getMovieById,
    deleteMovie
};
