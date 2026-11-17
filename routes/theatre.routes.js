const theatreController = require('../controllers/theatre.controller');
const theatreMiddleware = require('../middlewares/theatre.middleware');

/**
 * Registers all theatre endpoints on the Express app.
 * Base path: /mba/api/v1/theatres
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE
    app.post(
        '/mba/api/v1/theatres',
        theatreMiddleware.validateTheatreCreateRequest,
        theatreController.create
    );

    // DELETE
    app.delete(
        '/mba/api/v1/theatres/:id',
        theatreController.destroy
    );

    // READ (single)
    app.get(
        '/mba/api/v1/theatres/:id',
        theatreController.getTheatre
    );

    // READ (list)
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

    app.patch(
        '/mba/api/v1/theatres/:id/movies',
        theatreMiddleware.validateUpdateMoviesRequest,
        theatreController.updateMovies
    );
    
    app.get(
        '/mba/api/v1/theatres/:id/movies',
        theatreController.getMovies
    )
}

module.exports = routes;