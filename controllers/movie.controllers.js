const Movie = require('../models/movie.model');
const mongoose = require('mongoose');

const createMovie = async (req, res) => {
        try{
            const movie = await Movie.create(req.body);
            return res.status(201).json({
                success: true,
                error: {},
                message: "Movie created successfully",
                data: movie
            });
        }catch(err){
            console.error('Error while creating movie:', err);
            return res.status(500).json({
                success: false,
                error: err.message,
                message: "Internal server error",
                data: {}
            });
        }
}

const getAllMovies = async (req, res) => {
    try{
        const movies = await Movie.find();
        return res.status(200).json({
            success: true,
            error: {},
            message: "Movies fetched successfully",
            data: movies
        });
    }catch(err){
        console.error('Error while fetching movies:', err);
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const getMovieById = async (req, res) => {
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                success: false,
                error: {},
                message: "Invalid movie id",
                data: {}
            });
        }
        const movie = await Movie.findById(req.params.id);
        if(!movie){
            return res.status(404).json({
                success: false,
                error: {},
                message: "Movie not found",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            error: {},
            message: "Movie fetched successfully",
            data: movie
        });
    }catch(err){
        console.error('Error while fetching movie:', err);
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "Internal server error",
            data: {}
        });
    }
}

module.exports = {
    createMovie,
    getAllMovies,
    getMovieById
}