const theatreService = require('../services/theatre.service');
const { successResponseBody, errorResponseBody } = require('../utils/responsebody');

const STATUS = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND: 404
};

const create = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.user) {
            data.owner = req.user;
        }

        const response = await theatreService.createTheatre(data);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to create the theatre",
                data: {}
            });
        }

        return res.status(201).json({
            success: true,
            err: {},
            message: "Successfully created the theatre",
            data: response.theatre
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

const destroy = async (req, res) => {
    try {
        const response = await theatreService.deleteTheatre(req.params.id);
        successResponseBody.data = response;
        successResponseBody.message = "Successfully deleted the given theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getTheatre = async (req, res) => {
    try {
        const response = await theatreService.getTheatre(req.params.id);
        successResponseBody.data = response;
        successResponseBody.message = "Successfully fetched the data of the theatre";
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getAllTheatres = async (req, res) => {
    try {
        const response = await theatreService.getAllTheatres(req.query);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to fetch theatres",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully fetched theatres",
            data: response.theatres
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
}

const updateTheatre = async (req, res) => {
    try {
        const response = await theatreService.updateTheatre(req.params.id, req.body);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to update the theatre",
                data: {}
            });
        }
        return res.status(200).json({
            success: true,
            err: {},
            message: "Successfully updated the theatre",
            data: response.theatre
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
}

module.exports = {
    create,
    destroy,
    getTheatre,
    getAllTheatres,
    updateTheatre
};
