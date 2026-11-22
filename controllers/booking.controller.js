const bookingService = require('../services/booking.services');
const { STATUS } = require('../utils/constants');

const create = async (req, res) => {
    try {
        let userId = req.user;
        const response = await bookingService.createBooking({...req.body, userId: userId});
        return res.status(STATUS.CREATED).json({
            success: true,
            err: {},
            message: "Successfully created a booking",
            data: response
        });
    } catch(error) {
         if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to create booking",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const update = async (req, res) => {
    try {
        const response = await bookingService.updateBooking(req.body, req.params.id);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully updated the booking",
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to update booking",
                data: {}
            });
        }
        console.log(error);
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const getBookings = async (req, res, next) => {
    try {
        const response = await bookingService.getBookings({userId: req.user});
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the bookings",
            data: response
        });
    } catch (error) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const getAllBookings = async (req, res, next) => {
    try {
        const response = await bookingService.getAllBookings();
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the bookings",
            data: response
        });
    } catch (error) {
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}

const getBookingById = async (req, res, next) => {
    try {
        const response = await bookingService.getBookingById(req.params.id, req.user);
        return res.status(STATUS.OK).json({
            success: true,
            err: {},
            message: "Successfully fetched the booking",
            data: response
        });
    } catch (error) {
        if(error.err) {
            return res.status(error.code).json({
                success: false,
                err: error.err,
                message: "Failed to fetch booking",
                data: {}
            });
        }
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            err: error.message,
            message: "Internal server error",
            data: {}
        });
    }
}


module.exports = {
    create,
    update,
    getBookings,
    getAllBookings,
    getBookingById
}