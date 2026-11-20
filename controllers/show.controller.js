const showService = require('../services/show.service');
const { successResponseBody, errorResponseBody } = require('../utils/responsebody');
const { STATUS } = require('../utils/constants');

const create = async (req, res) => {
    try {
        const response = await showService.createShow(req.body);
        successResponseBody.message = "Successfully created the show";
        successResponseBody.data = response;
        return res.status(STATUS.CREATED).json(successResponseBody);
    } catch (error) {
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Fetches a list of shows.
 */
const getShows = async (req, res) => {
    try {
        const response = await showService.fetchShows(req.query);
        successResponseBody.message = "Successfully fetched the shows";
        successResponseBody.data = response.shows;
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

/**
 * Fetches a single show by id.
 */
const getShow = async (req, res) => {
    try {
        const response = await showService.getShowById(req.params.id);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to fetch the show",
                data: {}
            });
        }
        successResponseBody.message = "Successfully fetched the show";
        successResponseBody.data = response;
        return res.status(STATUS.OK).json(successResponseBody);
    } catch (error) {
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

module.exports = {
    create,
    getShows,
    getShow
}