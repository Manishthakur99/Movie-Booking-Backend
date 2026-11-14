const MovieController = require('../controllers/movie.controllers');

const routes = (app) => {
    app.post('/mba/api/v1/movie', MovieController.createMovie);
    app.get('/mba/api/v1/movies', MovieController.getAllMovies);
    app.get('/mba/api/v1/movie/:id', MovieController.getMovieById);
}

module.exports = routes;