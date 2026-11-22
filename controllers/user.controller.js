const userService = require('../services/user.service');
const { STATUS } = require('../utils/constants');

/**
 * Updates a user's role or status by id.
 * @param {Request} req - Express request; `req.params.id` is the user id, `req.body` holds the fields to update.
 * @param {Response} res - Express response used to send the result.
 * @returns {Promise<Response>} JSON response on success or an error status.
 */
const update = async (req, res) => {
    try {
        const response = await userService.updateUserRoleOrStatus(req.body, req.params.id);

        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Successfully updated the user',
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: 'Failed to update user',
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: 'Internal server error',
            data: {}
        });
    }
}

module.exports = {
    update
}