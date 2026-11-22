/**
 * Authentication Controller
 * 
 * Handles user authentication: registration, login, and password reset.
 * All responses follow the standard envelope: { success, err, message, data }
 */

const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const { STATUS } = require('../utils/constants');

/**
 * Registers a new user.
 * Creates user with role CUSTOMER (default) or specified role.
 * Non-CUSTOMER roles (ADMIN, CLIENT) get PENDING status requiring admin approval.
 * @param {Request} req - Express request; user payload in `req.body`.
 *   Body: { name, email, password, [userRole], [userStatus] }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with 201 on success or error status.
 */
const signup = async (req, res) => {
    try {
        const response = await userService.createUser(req.body);
        return res.status(STATUS.CREATED).json({
            success: true,
            err: {},
            message: 'User created successfully',
            data: response
        });
    }
    catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: 'Failed to create user',
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

/**
 * Authenticates a user and returns a JWT token.
 * Validates email/password, generates 1-day JWT with user id, email, and role.
 * @param {Request} req - Express request; credentials in `req.body`.
 *   Body: { email, password }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with user data and token on success.
 */
const signin = async (req, res) => {
    try {
        const user = await userService.getUserByEmail(req.body.email);
        const isValidPassword = await user.isValidPassword(req.body.password);
        if (!isValidPassword) {
            throw { err: 'Invalid password for the given email', code: STATUS.UNAUTHORISED };
        }
        
        // Generate JWT token (1 day expiry)
        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.userRole },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully logged in",
            data: {
                email: user.email,
                role: user.userRole,
                status: user.userStatus,
                token: token
            }
        });

    } catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: 'Failed to sign in',
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

/**
 * Resets a user's password after verifying the old password.
 * Requires authentication (JWT in x-access-token header).
 * @param {Request} req - Express request; `req.user` is authenticated user id.
 *   Body: { oldPassword, newPassword }
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response on success or error status.
 */
const resetPassword = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user);
        const isOldPasswordCorrect = await user.isValidPassword(req.body.oldPassword);
        if (!isOldPasswordCorrect) {
            throw { err: 'Invalid old password, please write the correct old password', code: STATUS.FORBIDDEN };
        }
        user.password = req.body.newPassword;
        await user.save();
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Successfully updated the password for the given user',
            data: user
        });
    } catch (err) {
        if (err.err) {
            return res.status(err.code).json({
                success: false,
                err: err.err,
                message: 'Failed to reset password',
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: err.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

module.exports = {
    signup,
    signin,
    resetPassword
};