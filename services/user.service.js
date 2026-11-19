const User = require('../models/user.model');
const { USER_ROLE, USER_STATUS } = require('../utils/constants');

const createUser = async (data) => {
    try{
        if(!data.userRole || data.userRole == USER_ROLE.customer) {
            if(data.userStatus && data.userStatus != USER_STATUS.approved) {
                throw {
                    err: "We cannot set any other status for customer", 
                    code: 400
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
            throw {err: error, code: 422};
        }
        throw err;
    }
}

const getUserByEmail = async (email) => {
    try {
        const response = await User.findOne({
            email: email
        });
        if(!response) {
            throw {err: "No user found for the given email", code: 404};
        }
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        if(!user) {
            throw {err: "No user found for the given id", code: 404};
        }
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserById
};