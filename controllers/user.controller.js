/**
 * User Admin Controller
 * 
 * Handles admin-only user management operations.
 * All responses follow the standard envelope: { success, err, message, data }
 */

const userService = require('../services/user.service');
const { STATUS } = require('../utils/constants');

/**
 * Updates a user's role and/or status by ID (admin only).
 * @param {Request} req - Express request; `req.params.id` is the user id.
 *   Body: { userRole?, userStatus? } - at least one required
 *   userRole: CUSTOMER | ADMIN | CLIENT
 *   userStatus: APPROVED | PENDING | REJECTED
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 200 on success or error status.
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
        if (error.err) {
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
};

module.exports = {
    update
};