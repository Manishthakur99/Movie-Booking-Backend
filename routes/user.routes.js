const userController = require('../controllers/user.controller');
const userMiddleware = require('../middlewares/user.middlewares');
const authMiddleware = require('../middlewares/auth.middlewares');

/**
 * Registers all user-related endpoints on the Express app.
 * Base path: /mba/api/v1/user
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const route = (app) => {
    // UPDATE - Update a user's role or status (requires auth + admin role)
    app.patch(
        '/mba/api/v1/user/:id',
        userMiddleware.validateUpdateUserRequest,
        authMiddleware.isAuthenticated,
        authMiddleware.isAdmin,
        userController.update
    )
}

module.exports = route;