const movieController = require('../controllers/movie.controllers');
const movieMiddlewares = require('../middlewares/movie.middlewares');

/**
 * Registers all movie endpoints on the Express app.
 * Base path: /mba/api/v1/movies
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE
    app.post(
        '/mba/api/v1/movies', 
        movieMiddlewares.validateMovieCreateRequest,
        movieController.createMovie
    );

    // DELETE
    app.delete(
        '/mba/api/v1/movies/:id',
        movieController.deleteMovie
    );

     // READ (single)
     app.get(
        '/mba/api/v1/movies/:id',
        movieController.getMovie
    );

     // UPDATE (PUT for full replace, PATCH for partial update)
     app.put(
        '/mba/api/v1/movies/:id',
        movieController.updateMovie
    );

    app.patch(
        '/mba/api/v1/movies/:id',
        movieController.updateMovie
    )

    // READ (list)
    app.get(
        '/mba/api/v1/movies',
        movieController.getMovies
    );
}

module.exports = routes;