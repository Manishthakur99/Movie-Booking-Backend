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

    // DELETE - Delete a show by id
    app.delete(
        '/mba/api/v1/shows/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        showController.destroy
    );

     app.patch(
        '/mba/api/v1/shows/:id',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdminOrClient,
        showMiddleware.validateShowUpdateRequest,
        showController.update
    );
}

module.exports = routes;