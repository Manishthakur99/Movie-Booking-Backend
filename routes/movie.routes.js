/**
 * Movie Routes Module
 * 
 * Defines all routes for movie-related operations.
 * Base path: /mba/api/v1/movies
 * 
 * Authentication Requirements:
 * - POST, PUT, PATCH, DELETE: Require valid JWT + ADMIN or CLIENT role
 * - GET (list, single): Public access (no auth required)
 */

const movieController = require('../controllers/movie.controllers');
const movieMiddlewares = require('../middlewares/movie.middlewares');
const authMiddlewares = require('../middlewares/auth.middlewares');

/**
 * Registers all movie endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE - Create a new movie (requires auth + validation)
    // POST /mba/api/v1/movies
    // Body: { name, description, casts[], trailerUrl, releaseDate, director, [language], [releaseStatus], [poster] }
    app.post(
        '/mba/api/v1/movies', 
        authMiddlewares.isAuthenticated,
        authMiddlewares.isAdminOrClient,
        movieMiddlewares.validateMovieCreateRequest,
        movieController.createMovie
    );

    // DELETE - Delete a movie by ID (requires auth)
    // DELETE /mba/api/v1/movies/:id
    app.delete(
        '/mba/api/v1/movies/:id',
        authMiddlewares.isAuthenticated,
        authMiddlewares.isAdminOrClient,
        movieController.deleteMovie
    );

    // READ (single) - Get a single movie by ID (public)
    // GET /mba/api/v1/movies/:id
    app.get(
        '/mba/api/v1/movies/:id',
        movieController.getMovie
    );

    // UPDATE (PUT for full replace) - Update a movie by ID (requires auth)
    // PUT /mba/api/v1/movies/:id
    app.put(
        '/mba/api/v1/movies/:id',
        authMiddlewares.isAuthenticated,
        authMiddlewares.isAdminOrClient,
        movieController.updateMovie
    );

    // UPDATE (PATCH for partial update) - Update a movie by ID (requires auth)
    // PATCH /mba/api/v1/movies/:id
    app.patch(
        '/mba/api/v1/movies/:id',
        authMiddlewares.isAuthenticated,
        authMiddlewares.isAdminOrClient,
        movieController.updateMovie
    );

    // READ (list) - Get all movies with optional filters (public)
    // GET /mba/api/v1/movies?name=<filter>
    app.get(
        '/mba/api/v1/movies',
        movieController.getMovies
    );
};

module.exports = routes;