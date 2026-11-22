/**
 * Show Controller
 * 
 * Handles movie screening (show) operations: create, read, update, delete.
 * All responses follow the standard envelope: { success, err, message, data }
 */

const showService = require('../services/show.service');
const { STATUS } = require('../utils/constants');

/**
 * Creates a new show (movie screening at a theatre).
 * Validates theatre exists and movie is available at that theatre.
 * @param {Request} req - Express request; show payload in `req.body`.
 *   Body: { theatreId, movieId, timing, noOfSeats, price, [format] }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 201 on success or error status.
 */
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
        if (error.err) {
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
};

/**
 * Fetches a list of shows with optional filters.
 * @param {Request} req - Express request; filters in `req.query`.
 *   Query: { theatreId?, movieId? }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with shows list.
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
        if (error.err) {
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
};

/**
 * Deletes a show by ID.
 * @param {Request} req - Express request; `req.params.id` is show id.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 200 on success or error status.
 */
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
        if (error.err) {
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
};

/**
 * Updates a show by ID (partial update).
 * Note: theatreId and movieId cannot be changed after creation (enforced by middleware).
 * @param {Request} req - Express request; `req.params.id` is show id.
 *   Body: { timing?, noOfSeats?, price?, format? }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 200 on success or error status.
 */
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
        if (error.err) {
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
};

module.exports = {
    create,
    getShows,
    destroy,
    update
};