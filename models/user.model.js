const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { USER_ROLE, USER_STATUS } = require('../utils/constants');

/**
 * Mongoose schema for a User document.
 * Defines the shape of a user in the `users` collection.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
 */
const userSchema = new mongoose.Schema({
    /**
     * Name of the user.
     * @type {string}
     */
    name: {
        type: String,
        required: true,
        unique: true,
    },
    /**
     * Email address of the user.
     * @type {string}
     */
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email'],
        lowercase: true,
        trim: true
    },
    /**
     * Hashed password of the user.
     * @type {string}
     */
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    /**
     * Role of the user (CUSTOMER, ADMIN, or CLIENT).
     * @type {string}
     */
    userRole: {
        type: String,
        required: true,
        enum: {
            values: [USER_ROLE.customer, USER_ROLE.admin, USER_ROLE.client],
            message: "Invalid user role given"
        },
        default: USER_ROLE.customer
    },
    /**
     * Account status of the user (APPROVED, PENDING, or REJECTED).
     * @type {string}
     */
    userStatus: {
        type: String,
        required: true,
        enum: {
            values: [USER_STATUS.approved, USER_STATUS.pending, USER_STATUS.rejected],
            message: "Invalid status for user given"
        },
        default: USER_STATUS.approved
    },
}, {timestamps: true});

/**
 * Mongoose pre-save middleware that hashes the user's password before saving.
 * Only re-hashes if the password field has been modified.
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Instance method to compare a plain-text password against the hashed password.
 * @param {string} plainPassword - The plain-text password to verify.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
userSchema.methods.isValidPassword = async function (plainPassword) {
    const currentUser = this;
    const compare = await bcrypt.compare(plainPassword, currentUser.password);
    return compare;
};

/**
 * User model registered with Mongoose.
 * @type {import('mongoose').Model<import('mongoose').Document>}
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
