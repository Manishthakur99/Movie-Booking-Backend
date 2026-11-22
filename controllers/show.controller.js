const showService = require('../services/show.service');
const { STATUS } = require('../utils/constants');

const create = async (req, res) => {
    try {
        const response = await showService.createShow(req.body);
        return res.status(STATUS.CREATED).json({
            success: true,
            err: {},
            message: "Successfully created the show",
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to create show",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

/**
 * Fetches a list of shows.
 */
const getShows = async (req, res) => {
    try {
        const response = await showService.getShows(req.query);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the movie shows",
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to fetch shows",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const destroy = async (req, res) => {
    try {
        const response = await showService.deleteShow(req.params.id);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully deleted the show",
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to delete show",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const update = async (req, res) => {
    try {
        const response = await showService.updateShow(req.params.id, req.body);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully updated the show",
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to update show",
                data: {}
            });
        }
        console.log(error);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

module.exports = {
    create,
    getShows,
    destroy,
    update
}