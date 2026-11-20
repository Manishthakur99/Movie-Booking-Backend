const userService = require('../services/user.service');
const { errorResponseBody, successResponseBody } = require('../utils/responsebody');
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

        successResponseBody.data = response;
        successResponseBody.message = 'Successfully updated the user';
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
    update
}