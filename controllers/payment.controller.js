const paymentService = require('../services/payment.service');
const sendMail = require('../services/email.service');
const User = require('../models/user.model');
const Movie = require('../models/movie.model');
const Theatre = require('../models/theatre.model');
const { STATUS, BOOKING_STATUS } = require('../utils/constants');

/**
 * Processes payment for a booking.
 * Handles 5-minute expiry, payment validation, seat reduction, and sends confirmation email.
 * @param {Request} req - Express request; bookingId and amount in req.body, user in req.user.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with booking details on success.
 */
const createPayment = async (req, res) => {
    try {
        const response = await paymentService.createPayment(req.body);
        
        // Handle expired booking
        if (response.status === BOOKING_STATUS.expired) {
            return res.status(STATUS.GONE).json({
                success: false,
                err: 'The payment took more than 5 minutes to get processed, hence your booking got expired, please try again',
                data: response
            });
        }
        
        // Handle cancelled/failed payment
        if (response.status === BOOKING_STATUS.cancelled) {
            return res.status(STATUS.PAYMENT_REQUIRED).json({
                success: false,
                err: 'The payment failed due to some reason, booking was not successful, please try again',
                data: response
            });
        }

        // Successful booking - send email notification
        const user = await User.findById(response.userId);
        const movie = await Movie.findById(response.movieId);
        const theatre = await Theatre.findById(response.theatreId);
        
        sendMail(
            'Your booking is Successful', 
            response.userId,
            `Your booking for ${movie.name} in ${theatre.name} for ${response.noOfSeats} seats on ${response.timing} is successful. Your booking id is ${response._id}`
        );

        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Booking completed successfully',
            data: response
        });
    } catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: 'Failed to process payment',
                data: {}
            });
        }
        console.error('Error processing payment:', error);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

/**
 * Gets payment details by payment ID.
 * @param {Request} req - Express request; payment ID in req.params.id.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with payment details.
 */
const getPaymentDetailsById = async (req, res) => {
    try {
        const response = await paymentService.getPaymentById(req.params.id);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Successfully fetched the booking and payment details',
            data: response
        });
    } catch (error) {
        if (error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: 'Failed to fetch payment',
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

/**
 * Gets all payments (admin gets all, user gets own).
 * @param {Request} req - Express request; user in req.user.
 * @param {Response} res - Express response.
 * @returns {Promise<Response>} JSON response with payments list.
 */
const getAllPayments = async (req, res) => {
    try {
        const response = await paymentService.getAllPayments(req.user);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: 'Successfully fetched all the payments',
            data: response
        });
    } catch (error) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: 'Internal server error',
            data: {}
        });
    }
};

module.exports = {
    createPayment,
    getPaymentDetailsById,
    getAllPayments
};