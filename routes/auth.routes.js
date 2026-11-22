/**
 * Auth Routes Module
 * 
 * Defines all authentication-related endpoints.
 * Base path: /mba/api/v1/auth
 * 
 * Authentication Requirements:
 * - POST /signup: Public (no auth)
 * - POST /signin: Public (no auth)
 * - PATCH /reset: Requires valid JWT (isAuthenticated)
 */

const authMiddleware = require('../middlewares/auth.middlewares');
const authController = require('../controllers/auth.controller');

/**
 * Registers all auth endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // SIGNUP - Register a new user (public, requires validation)
    // POST /mba/api/v1/auth/signup
    // Body: { name, email, password, [userRole], [userStatus] }
    // Note: userRole defaults to CUSTOMER; non-CUSTOMER roles get PENDING status
    app.post(
        '/mba/api/v1/auth/signup',
        authMiddleware.validateSignupRequest,
        authController.signup
    );

    // SIGNIN - Sign in an existing user (public, requires validation)
    // POST /mba/api/v1/auth/signin
    // Body: { email, password }
    // Returns: { email, role, status, token } - JWT token valid for 1 day
    app.post(
        '/mba/api/v1/auth/signin',
        authMiddleware.validateSigninRequest,
        authController.signin
    );

    // RESET PASSWORD - Reset user password (requires auth + validation)
    // PATCH /mba/api/v1/auth/reset
    // Headers: x-access-token (JWT)
    // Body: { oldPassword, newPassword }
    // Verifies old password before updating to new password
    app.patch(
        '/mba/api/v1/auth/reset',
        authMiddleware.isAuthenticated,
        authMiddleware.validateResetPasswordRequest,
        authController.resetPassword
    );
};

module.exports = routes;