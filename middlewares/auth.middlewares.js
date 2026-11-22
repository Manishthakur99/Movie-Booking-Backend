const { errorResponseBody } = require('../utils/responsebody');
const { USER_ROLE, STATUS } = require('../utils/constants');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

/**
 * Authentication Middlewares
 * 
 * Provides request validation and role-based access control for the API.
 * All middlewares follow the pattern: validate -> set error response -> call next() or return error.
 * Uses shared errorResponseBody for consistent error formatting.
 */

// --- Request Validation Middlewares ---

/**
 * Middleware that validates the signup request body.
 * Ensures `name`, `email`, and `password` are present.
 * @param {Request} req - Express request; user payload is in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateSignupRequest = async (req, res, next) => {
    if (!req.body.name) {
        errorResponseBody.err = "Name of the user not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    if (!req.body.email) {
        errorResponseBody.err = "Email of the user not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    if (!req.body.password) {
        errorResponseBody.err = "Password of the user not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    next();
};

/**
 * Middleware that validates the signin request body.
 * Ensures `email` and `password` are present.
 * @param {Request} req - Express request; credentials are in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateSigninRequest = async (req, res, next) => {
    if (!req.body.email) {
        errorResponseBody.err = "Email of the user not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    if (!req.body.password) {
        errorResponseBody.err = "Password of the user not present in the request";
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    next();
};

/**
 * Middleware that validates the reset password request body.
 * Ensures `oldPassword` and `newPassword` are present.
 * @param {Request} req - Express request; passwords are in `req.body`.
 * @param {Response} res - Express response used to send a 400 error on invalid input.
 * @param {Function} next - Passes control to the next handler when validation succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 400 response.
 */
const validateResetPasswordRequest = (req, res, next) => {
    if (!req.body.oldPassword) {
        errorResponseBody.err = 'Missing the old password in the request';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    if (!req.body.newPassword) {
        errorResponseBody.err = 'Missing the new password in the request';
        return res.status(STATUS.BAD_REQUEST).json(errorResponseBody);
    }

    next();
};

// --- Authentication & Authorization Middlewares ---

/**
 * Middleware that authenticates a user via JWT token.
 * Verifies the `x-access-token` header and attaches the user id to `req.user`.
 * @param {Request} req - Express request; JWT token is in `x-access-token` header.
 * @param {Response} res - Express response used to send 401/403/500 on auth failure.
 * @param {Function} next - Passes control to the next handler when authentication succeeds.
 * @returns {Promise<void>} Resolves after calling `next()` or sending an error response.
 */
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers["x-access-token"];
        if (!token) {
            errorResponseBody.err = "No token provided";
            return res.status(STATUS.FORBIDDEN).json(errorResponseBody);
        }
        
        // Verify token using JWT_SECRET from environment
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            errorResponseBody.err = "Token not verified";
            return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
        }
        
        // Fetch user from database to ensure they still exist
        const user = await userService.getUserById(decoded.id);
        req.user = user.id;
        next();

    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            errorResponseBody.err = err.message;
            return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
        }

        if (err.code === STATUS.NOT_FOUND) {
            errorResponseBody.err = "User doesn't exist";
            return res.status(err.code).json(errorResponseBody);
        }
        
        errorResponseBody.err = err;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

/**
 * Middleware that checks if the authenticated user has the ADMIN role.
 * Requires `isAuthenticated` to have run before this middleware.
 * @param {Request} req - Express request; `req.user` is set by `isAuthenticated`.
 * @param {Response} res - Express response used to send 401 if user is not an admin.
 * @param {Function} next - Passes control to the next handler when user is an admin.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 401 response.
 */
const isAdmin = async (req, res, next) => {
    const user = await userService.getUserById(req.user);
    if (user.userRole !== USER_ROLE.admin) {
        errorResponseBody.err = "User is not an admin, cannot proceed with the request";
        return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
    }
    next();
};

/**
 * Middleware that checks if the authenticated user has the CLIENT role.
 * Requires `isAuthenticated` to have run before this middleware.
 * @param {Request} req - Express request; `req.user` is set by `isAuthenticated`.
 * @param {Response} res - Express response used to send 401 if user is not a client.
 * @param {Function} next - Passes control to the next handler when user is a client.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 401 response.
 */
const isClient = async (req, res, next) => {
    const user = await userService.getUserById(req.user);
    if (user.userRole !== USER_ROLE.client) {
        errorResponseBody.err = "User is not a client, cannot proceed with the request";
        return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
    }
    next();
};

/**
 * Middleware that checks if the authenticated user has either ADMIN or CLIENT role.
 * Requires `isAuthenticated` to have run before this middleware.
 * @param {Request} req - Express request; `req.user` is set by `isAuthenticated`.
 * @param {Response} res - Express response used to send 401 if user is neither admin nor client.
 * @param {Function} next - Passes control to the next handler when user is admin or client.
 * @returns {Promise<void>} Resolves after calling `next()` or sending a 401 response.
 */
const isAdminOrClient = async (req, res, next) => {
    const user = await userService.getUserById(req.user);
    if (user.userRole !== USER_ROLE.admin && user.userRole !== USER_ROLE.client) {
        errorResponseBody.err = "User is neither a client nor an admin, cannot proceed with the request";
        return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
    }
    next();
};

module.exports = {
    validateSignupRequest,
    validateSigninRequest,
    isAuthenticated,
    validateResetPasswordRequest,
    isAdmin,
    isClient,
    isAdminOrClient
};