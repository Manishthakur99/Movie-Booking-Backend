/**
 * Movie Routes Module
 * Defines all routes for movie-related operations.
 */

const movieController = require('../controllers/movie.controllers');
const movieMiddlewares = require('../middlewares/movie.middlewares');

/**
 * Registers all movie endpoints on the Express app.
 * Base path: /mba/api/v1/movies
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE - Create a new movie (requires validation middleware)
    app.post(
        '/mba/api/v1/movies', 
        movieMiddlewares.validateMovieCreateRequest,
        movieController.createMovie
    );

    // DELETE - Delete a movie by ID
    app.delete(
        '/mba/api/v1/movies/:id',
        movieController.deleteMovie
    );

     // READ (single) - Get a single movie by ID
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

    // READ (list) - Get all movies with optional filters
    app.get(
        '/mba/api/v1/movies',
        movieController.getMovies
    );
}

module.exports = routes;