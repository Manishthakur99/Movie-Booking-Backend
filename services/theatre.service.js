const Theatre = require('../models/theatre.model');

const STATUS = {
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

const createTheatre = async (data) => {
    try {
        const theatre = await Theatre.create(data);
        return { theatre };
    } catch (error) {
        if (error.name === 'ValidationError') {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });
            return { err, code: 422 };
        }
        console.log(error);
        throw error;
    }
}

const getTheatre = async (id) => {
    try {
        const response = await Theatre.findById(id);
        if (!response) {
            throw {
                err: "No theatre found for the given id",
                code: STATUS.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const deleteTheatre = async (id) => {
    try {
        const theatre = await Theatre.findByIdAndDelete(id);
        if (!theatre) {
            return { err: "No theatre found for the given id", code: STATUS.NOT_FOUND };
        }
        return { theatre };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateTheatre = async (id, data) => {
    try {
        const theatre = await Theatre.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!theatre) {
            return { err: "No theatre found for the given id", code: STATUS.NOT_FOUND };
        }
        return { theatre };
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

const getAllTheatres = async (filter = {}) => {
    try {
        const query = {};
        if (filter.name) {
            query.name = filter.name;
        }
        if (filter.city) {
            query.city = filter.city;
        }
        const theatres = await Theatre.find(query);
        return { theatres };
    } catch (err) {
        return { err: err.message, code: STATUS.INTERNAL_SERVER_ERROR };
    }
}

module.exports = {
    createTheatre,
    getTheatre,
    deleteTheatre,
    updateTheatre,
    getAllTheatres
}