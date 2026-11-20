const User = require('../models/user.model');
const { USER_ROLE, USER_STATUS, STATUS } = require('../utils/constants');

// Service layer convention: every function returns a plain object.
// On failure it returns `{ err, code }`; on success it returns the created/found user document.
// Controllers translate that object into the HTTP response.

/**
 * Creates a new user document.
 * @param {Object} data - User fields matching the User schema.
 * @returns {Promise<Object>} Created user document, or throws an error object on failure.
 */
const createUser = async (data) => {
    try{
        if(!data.userRole || data.userRole == USER_ROLE.customer) {
            if(data.userStatus && data.userStatus != USER_STATUS.approved) {
                throw {
                    err: "We cannot set any other status for customer", 
                    code: STATUS.BAD_REQUEST
                };
            }
        }
        if(data.userRole && data.userRole != USER_ROLE.customer) {
            data.userStatus = USER_STATUS.pending;
        }
        const response = await User.create(data);
        return response;
    }catch(err){
        console.error('Error creating user:', err);
        if(err.name == 'ValidationError') {
            let error = {};
            Object.keys(err.errors).forEach((key) => {
                error[key] = err.errors[key].message;
            });
            throw {err: error, code: STATUS.UNPROCESSABLE_ENTITY};
        }
        throw err;
    }
}

/**
 * Finds a user by email.
 * @param {string} email - User email address.
 * @returns {Promise<Object>} Found user document, or throws `{ err, code: 404 }` if not found.
 */
const getUserByEmail = async (email) => {
    try {
        const response = await User.findOne({
            email: email
        });
        if(!response) {
            throw {err: "No user found for the given email", code: STATUS.NOT_FOUND};
        }
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Finds a user by id.
 * @param {string} id - User ObjectId as a string.
 * @returns {Promise<Object>} Found user document, or throws `{ err, code: 404 }` if not found.
 */
const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        if(!user) {
            throw {err: "No user found for the given id", code: STATUS.NOT_FOUND};
        }
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Updates a user's role and/or status by id.
 * @param {Object} data - Fields to update (userRole and/or userStatus).
 * @param {string} userId - User ObjectId as a string.
 * @returns {Promise<Object>} Updated user document, or throws an error object on failure.
 */
const updateUserRoleOrStatus = async (data, userId) => {
    try{
        let updateQuery = {};
        if(data.userRole) updateQuery.userRole = data.userRole;
        if(data.userStatus) updateQuery.userStatus = data.userStatus;

        let response = await User.findByIdAndUpdate(userId, updateQuery, { returnDocument: 'after', runValidators: true });
         if(!response) throw {err: 'No user found for the given id', code: STATUS.NOT_FOUND};
        return response;
    }
    catch(err) {
        if(err.name == 'ValidationError') {
            let errMap = {};
            Object.keys(err.errors).forEach(key => {
                errMap[key] = err.errors[key].message;
            });
            throw {err: errMap, code: STATUS.UNPROCESSABLE_ENTITY};
        }
        throw err;
    }
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    updateUserRoleOrStatus
};