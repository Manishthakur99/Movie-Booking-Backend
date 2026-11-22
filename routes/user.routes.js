/**
 * User Admin Routes Module
 * 
 * Defines admin-only endpoints for user management.
 * Base path: /mba/api/v1/user
 * 
 * Authentication Requirements:
 * - All endpoints require valid JWT + ADMIN role
 */

const userController = require('../controllers/user.controller');
const userMiddleware = require('../middlewares/user.middlewares');
const authMiddleware = require('../middlewares/auth.middlewares');

/**
 * Registers all user admin endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const route = (app) => {
    // UPDATE - Update a user's role or status (requires auth + admin role + validation)
    // PATCH /mba/api/v1/user/:id
    // Body: { userRole?, userStatus? } - at least one required
    // userRole: CUSTOMER | ADMIN | CLIENT
    // userStatus: APPROVED | PENDING | REJECTED
    app.patch(
        '/mba/api/v1/user/:id',
        userMiddleware.validateUpdateUserRequest,
        authMiddleware.isAuthenticated,
        authMiddleware.isAdmin,
        userController.update
    );
};

module.exports = route;