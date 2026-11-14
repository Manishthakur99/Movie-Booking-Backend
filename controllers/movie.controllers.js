const movieService = require('../services/movie.service');

const createMovie = async (req, res) => {
    try {
        const response = await movieService.createMovie(req.body);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Validation failed on few parameters of the request body",
                data: {}
            });
        }
        return res.status(201).json({
            success: true,
            err: {},
            message: "Successfully created the movie",
            data: response.movie
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const response = await movieService.deleteMovie(req.params.id);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to delete the movie",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully deleted the movie",
            data: response.movie
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
};

const getMovie = async (req, res) => {
    try {
        const response = await movieService.getMovieById(req.params.id);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to fetch the movie",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully fetched the movie",
            data: response.movie
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
};

module.exports = {
    createMovie,
    deleteMovie,
    getMovie
};
