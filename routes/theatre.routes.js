/**
 * Theatre Routes Module
 * Defines all routes for theatre-related operations.
 */

const theatreController = require('../controllers/theatre.controller');
const theatreMiddleware = require('../middlewares/theatre.middleware');

/**
 * Registers all theatre endpoints on the Express app.
 * Base path: /mba/api/v1/theatres
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE - Create a new theatre (requires validation middleware)
    app.post(
        '/mba/api/v1/theatres',
        theatreMiddleware.validateTheatreCreateRequest,
        theatreController.create
    );

    // DELETE - Delete a theatre by ID
    app.delete(
        '/mba/api/v1/theatres/:id',
        theatreController.destroy
    );

    // READ (single) - Get a single theatre by ID
    app.get(
        '/mba/api/v1/theatres/:id',
        theatreController.getTheatre
    );

    // READ (list) - Get all theatres with optional filters
    app.get(
        '/mba/api/v1/theatres',
        theatreController.getAllTheatres
    );

    // UPDATE (PUT for full replace, PATCH for partial update)
    app.put(
        '/mba/api/v1/theatres/:id',
        theatreController.updateTheatre
    );

    app.patch(
        '/mba/api/v1/theatres/:id',
        theatreController.updateTheatre
    );

    // UPDATE - Add or remove movies from a theatre (requires validation middleware)
    app.patch(
        '/mba/api/v1/theatres/:id/movies',
        theatreMiddleware.validateUpdateMoviesRequest,
        theatreController.updateMovies
    );
    
    // READ - Get all movies screening in a theatre
    app.get(
        '/mba/api/v1/theatres/:id/movies',
        theatreController.getMovies
    )

    // READ - Check if a specific movie is screening in a theatre
    app.get(
        '/mba/api/v1/theatres/:theatreId/movies/:movieId',
        theatreController.checkMovie
    );
}

module.exports = routes;