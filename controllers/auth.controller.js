const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const { STATUS } = require('../utils/constants');

const { successResponseBody, errorResponseBody } = require('../utils/responsebody');

const signup = async (req, res) => {
    try {
        const response = await userService.createUser(req.body);
        successResponseBody.data = response;
        successResponseBody.message = 'User created successfully';
        return res.status(STATUS.CREATED).json(successResponseBody);
    }
    catch (error) {
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.error = error;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const signin = async (req, res) => {
    try {
        const user = await userService.getUserByEmail(req.body.email);
        const isValidPassword = await user.isValidPassword(req.body.password);
        if(!isValidPassword) {
            throw {err: 'Invalid password for the given email', code: STATUS.UNAUTHORISED};
        }
        
        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.userRole },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
        
        successResponseBody.message = "Successfully logged in";
        successResponseBody.data = {
            email: user.email,
            role: user.userRole,
            status: user.userStatus,
            token: token
        }; 
        return res.status(STATUS.OK).json(successResponseBody);

    } catch (error) {
        if(error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }
         errorResponseBody.err = error;
         return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const resetPassword = async (req, res) => {
        try{
            const user = await userService.getUserById(req.user);
            const isOldPasswordCorrect = await user.isValidPassword(req.body.oldPassword);
            if(!isOldPasswordCorrect) {
            throw {err: 'Invalid old password, please write the correct old password', code: STATUS.FORBIDDEN};
        }
        user.password = req.body.newPassword;
        await user.save();
        successResponseBody.data = user;
        successResponseBody.message = 'Successfully updated the password for the given user';
        return res.status(STATUS.OK).json(successResponseBody);

        }
        catch(err) {
            if(err.err) {
            errorResponseBody.err = err.err;
            return res.status(err.code).json(errorResponseBody);
        }
            errorResponseBody.err = err;
           return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
        }
}


module.exports = {
    signup,
    signin,
    resetPassword
}