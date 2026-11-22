/**
 * Booking Routes Module
 * 
 * Defines all routes for booking-related operations.
 * Base path: /mba/api/v1/bookings
 * 
 * Authentication Requirements:
 * - All endpoints require valid JWT (isAuthenticated)
 * - GET /bookings/all additionally requires ADMIN role
 * - PATCH /bookings/:id enforces role-based status change via canChangeStatus middleware
 */

const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const bookingMiddleware = require('../middlewares/booking.middlewares');

/**
 * Registers all booking endpoints on the Express app.
 * @param {import('express').Application} app - The Express app instance.
 * @returns {void}
 */
const routes = (app) => {
    // CREATE - Create a new booking (requires auth + validation)
    // POST /mba/api/v1/bookings
    // Body: { theatreId, movieId, timing, noOfSeats }
    // totalCost is calculated automatically from show price * noOfSeats
    app.post(
        '/mba/api/v1/bookings',
        authMiddleware.isAuthenticated,
        bookingMiddleware.validateBookingCreateRequest,
        bookingController.create
    );

    // UPDATE - Update booking status (requires auth + role check)
    // PATCH /mba/api/v1/bookings/:id
    // Body: { status }
    // Customers can only cancel (CANCELLED); Admins/Clients can set any status
    app.patch(
        '/mba/api/v1/bookings/:id',
        authMiddleware.isAuthenticated,
        bookingMiddleware.canChangeStatus,
        bookingController.update
    );

    // READ - Get bookings for authenticated user (requires auth)
    // GET /mba/api/v1/bookings
    app.get(
        '/mba/api/v1/bookings',
        authMiddleware.isAuthenticated,
        bookingController.getBookings
    );

    // READ - Get all bookings (admin only)
    // GET /mba/api/v1/bookings/all
    app.get(
        '/mba/api/v1/bookings/all',
        authMiddleware.isAuthenticated,
        authMiddleware.isAdmin,
        bookingController.getAllBookings
    );

    // READ - Get booking by ID (requires auth + ownership check)
    // GET /mba/api/v1/bookings/:id
    app.get(
        '/mba/api/v1/bookings/:id',
        authMiddleware.isAuthenticated,
        bookingController.getBookingById
    );
};

module.exports = routes;