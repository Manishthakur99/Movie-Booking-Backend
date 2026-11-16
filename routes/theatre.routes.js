const theatreController = require('../controllers/theatre.controller');
const theatreMiddleware = require('../middlewares/theatre.middleware');

const routes = (app) => {
    // routes function takes express app object as parameter

    // CREATE
    app.post(
        '/mba/api/v1/theatres',
        theatreMiddleware.validateTheatreCreateRequest,
        theatreController.create
    );

    app.delete(
        '/mba/api/v1/theatres/:id',
        theatreController.destroy
    );

    // READ
    app.get(
        '/mba/api/v1/theatres/:id',
        theatreController.getTheatre
    );

    app.get(
        '/mba/api/v1/theatres',
        theatreController.getAllTheatres
    );

    app.put(
        '/mba/api/v1/theatres/:id',
        theatreController.updateTheatre
    );

    app.patch(
        '/mba/api/v1/theatres/:id',
        theatreController.updateTheatre
    );
    
}

module.exports = routes;