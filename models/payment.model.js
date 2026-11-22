const mongoose = require('mongoose');

const { PAYMENT_STATUS } = require('../utils/constants');

/**
 * Mongoose schema for a Payment document.
 * Represents a payment transaction linked to a booking.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
 */
const paymentSchema = new mongoose.Schema({
    /**
     * Reference to the Booking this payment is for.
     * @type {import('mongoose').Types.ObjectId}
     */
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Booking'
    },
    /**
     * Payment amount in the smallest currency unit (e.g., paise for INR).
     * @type {number}
     */
    amount: {
        type: Number,
        required: true,
    },
    /**
     * Current status of the payment.
     * Possible values: PENDING, SUCCESS, FAILED
     * @type {string}
     */
    status: {
        type: String,
        required: true,
        enum: {
            values: [PAYMENT_STATUS.pending, PAYMENT_STATUS.failed, PAYMENT_STATUS.success],
            message: "Invalid payment status"
        },
        default: PAYMENT_STATUS.pending
    }
}, {timestamps: true});

/**
 * Payment model registered with Mongoose.
 * @type {import('mongoose').Model<import('mongoose').Document>}
 */
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;