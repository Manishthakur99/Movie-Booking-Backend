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

const updateMovie = async (id, data) => {
    try {
        if (!mongoose.isValidObjectId(id)) {
            return { err: "Invalid movie id provided", code: 400 };
        }
        const movie = await Movie.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!movie) {
            return { err: "No movie found for the corresponding id provided", code: 404 };
        }
        return { movie };
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

const fetchMovies = async (filter = {}) => {
    try {
        const query = {};
        if (filter.name) {
            query.name = filter.name;
        }
        const movies = await Movie.find(query);
        return { movies };
    } catch (err) {
        return { err: err.message, code: 500 };
    }
}

module.exports = {
    createMovie,
    getMovieById,
    deleteMovie,
    updateMovie,
    fetchMovies
};
