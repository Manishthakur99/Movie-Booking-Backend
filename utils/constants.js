/**
 * User account status constants.
 */
const USER_STATUS = {
    approved: "APPROVED",
    pending: "PENDING",
    rejected: "REJECTED"
};

/**
 * User role constants.
 */
const USER_ROLE = {
    customer: "CUSTOMER",
    admin: "ADMIN",
    client: "CLIENT"
};

/**
 * HTTP status code constants used across the application.
 */
const STATUS = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500,
    CREATED: 201,
    UNAUTHORISED: 401,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    UNPROCESSABLE_ENTITY: 422,
    GONE: 410,
    PAYMENT_REQUIRED: 402
};

const BOOKING_STATUS = {
    cancelled: "CANCELLED",
    successfull: "SUCCESSFULL",
    processing: "IN_PROCESS",
    expired: "EXPIRED"
}


module.exports = {
    USER_ROLE,
    USER_STATUS,
    STATUS,
    BOOKING_STATUS
};