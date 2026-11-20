const showController = require('../controllers/show.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const showMiddleware = require('../middlewares/show.middlewares');

const routes = (app) => {
    // CREATE - Create a new show
    app.post(
        '/mba/api/v1/shows',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        showMiddleware.validateCreateShowRequest,
        showController.create
    );

    // READ (list) - Get all shows
    app.get(
        '/mba/api/v1/shows',
        showController.getShows
    );

    // READ (single) - Get a single show by id
    app.get(
        '/mba/api/v1/shows/:id',
        showController.getShow
    );
}

module.exports = routes;