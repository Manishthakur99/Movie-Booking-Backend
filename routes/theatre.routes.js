/**
 * Theatre Routes Module
 * 
 * Defines all routes for theatre-related operations.
 * Base path: /mba/api/v1/theatres
 * 
 * Authentication Requirements:
 * - POST, PUT, PATCH, DELETE: Require valid JWT + ADMIN or CLIENT role
 * - GET (list, single, movies, checkMovie): Public access (no auth required)
 */

const theatreController = require('../controllers/theatre.controller');
const theatreMiddleware = require('../middlewares/theatre.middleware');
const authMiddleware = require('../middlewares/auth.middlewares');

/**
 * Registers all theatre endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE - Create a new theatre (requires auth + validation)
    // POST /mba/api/v1/theatres
    // Body: { name, city, pincode, [description], [address] }
    // Owner is automatically set from authenticated user
    app.post(
        '/mba/api/v1/theatres',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        theatreMiddleware.validateTheatreCreateRequest,
        theatreController.create
    );

    // DELETE - Delete a theatre by ID (requires auth)
    // DELETE /mba/api/v1/theatres/:id
    app.delete(
        '/mba/api/v1/theatres/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        theatreController.destroy
    );

    // READ (single) - Get a single theatre by ID (public)
    // GET /mba/api/v1/theatres/:id
    app.get(
        '/mba/api/v1/theatres/:id',
        theatreController.getTheatre
    );

    // READ (list) - Get all theatres with optional filters (public)
    // GET /mba/api/v1/theatres?name=<filter>&city=<filter>&pincode=<filter>
    app.get(
        '/mba/api/v1/theatres',
        theatreController.getAllTheatres
    );

    // UPDATE (PUT for full replace) - Update a theatre by ID (requires auth)
    // PUT /mba/api/v1/theatres/:id
    app.put(
        '/mba/api/v1/theatres/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        theatreController.updateTheatre
    );

    // UPDATE (PATCH for partial update) - Update a theatre by ID (requires auth)
    // PATCH /mba/api/v1/theatres/:id
    app.patch(
        '/mba/api/v1/theatres/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        theatreController.updateTheatre
    );

    // UPDATE - Add or remove movies from a theatre (requires auth + validation)
    // PATCH /mba/api/v1/theatres/:id/movies
    // Body: { movieIds: [], insert: true|false }
    app.patch(
        '/mba/api/v1/theatres/:id/movies',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        theatreMiddleware.validateUpdateMoviesRequest,
        theatreController.updateMovies
    );
    
    // READ - Get all movies screening in a theatre (public)
    // GET /mba/api/v1/theatres/:id/movies
    app.get(
        '/mba/api/v1/theatres/:id/movies',
        theatreController.getMovies
    );

    // READ - Check if a specific movie is screening in a theatre (public)
    // GET /mba/api/v1/theatres/:theatreId/movies/:movieId
    app.get(
        '/mba/api/v1/theatres/:theatreId/movies/:movieId',
        theatreController.checkMovie
    );
};

module.exports = routes;