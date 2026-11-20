const authMiddleware = require('../middlewares/auth.middlewares');
const authController = require('../controllers/auth.controller');

/**
 * Registers all auth-related endpoints on the Express app.
 * Base path: /mba/api/v1/auth
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // POST - Register a new user (requires validation middleware)
    app.post(
        '/mba/api/v1/auth/signup',
        authMiddleware.validateSignupRequest,
        authController.signup
    );

    // POST - Sign in an existing user (returns JWT token)
    app.post(
        '/mba/api/v1/auth/signin',
        authMiddleware.validateSigninRequest,
        authController.signin
    );

    // PATCH - Reset password (requires auth token + validation middleware)
    app.patch(
        '/mba/api/v1/auth/reset',
        authMiddleware.isAuthenticated,
        authMiddleware.validateResetPasswordRequest,
        authController.resetPassword
    );
}

module.exports = routes;