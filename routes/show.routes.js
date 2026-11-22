/**
 * Show Routes Module
 * 
 * Defines all routes for show (movie screening) related operations.
 * Base path: /mba/api/v1/shows
 * 
 * Authentication Requirements:
 * - POST, PUT, PATCH, DELETE: Require valid JWT + ADMIN or CLIENT role
 * - GET (list): Public access (no auth required)
 */

const showController = require('../controllers/show.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const showMiddleware = require('../middlewares/show.middlewares');

/**
 * Registers all show endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE - Create a new show (requires auth + validation)
    // POST /mba/api/v1/shows
    // Body: { theatreId, movieId, timing, noOfSeats, price, [format] }
    app.post(
        '/mba/api/v1/shows',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        showMiddleware.validateCreateShowRequest,
        showController.create
    );

    // READ (list) - Get all shows with optional filters (public)
    // GET /mba/api/v1/shows?theatreId=<id>&movieId=<id>
    app.get(
        '/mba/api/v1/shows',
        showController.getShows
    );

    // DELETE - Delete a show by id (requires auth)
    // DELETE /mba/api/v1/shows/:id
    app.delete(
        '/mba/api/v1/shows/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        showController.destroy
    );

    // UPDATE (PATCH for partial update) - Update a show by id (requires auth)
    // PATCH /mba/api/v1/shows/:id
    // Body: { timing, noOfSeats, price, format } (theatreId and movieId cannot be changed)
    app.patch(
        '/mba/api/v1/shows/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        showMiddleware.validateShowUpdateRequest,
        showController.update
    );
};

module.exports = routes;