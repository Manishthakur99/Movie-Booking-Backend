const { errorResponseBody } = require('../utils/responsebody');
const { USER_ROLE, STATUS } = require('../utils/constants');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

const validateSignupRequest = async (req, res, next) => {

    if(!req.body.name) {
        errorResponseBody.err = "Name of the user not present in the request";
        return res.status(400).json(errorResponseBody);
    }

     if(!req.body.email) {
        errorResponseBody.err = "Email of the user not present in the request";
        return res.status(400).json(errorResponseBody);
    }

    if(!req.body.password) {
        errorResponseBody.err = "Password of the user not present in the request";
        return res.status(400).json(errorResponseBody);
    }

    next();
}

const validateSigninRequest = async (req, res, next) => {

    if(!req.body.email) {
        errorResponseBody.err = "Email of the user not present in the request";
        return res.status(400).json(errorResponseBody);
    }

    if(!req.body.password) {
        errorResponseBody.err = "Password of the user not present in the request";
        return res.status(400).json(errorResponseBody);
    }

    next();
}

const isAuthenticated = async (req, res, next) => {
    try{
        const token = req.headers["x-access-token"];
    if(!token) {
            errorResponseBody.err = "No token provided";
            return res.status(STATUS.FORBIDDEN).json(errorResponseBody);
        }
        const response = jwt.verify(token, process.env.JWT_SECRET);
        if(!response) {
            errorResponseBody.err = "Token not verified";
            return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
        }
        const user = await userService.getUserById(response.id);
        req.user = user.id;
        next();

    }catch(err) {
         if(error.name == "JsonWebTokenError") {
            errorResponseBody.err = error.message;
            return res.status(STATUS.UNAUTHORISED).json(errorResponseBody);
        }
        
            if(err.code == STATUS.NOT_FOUND) {
            errorResponseBody.err = "User doesn't exist";
            return res.status(err.code).json(errorResponseBody);
        }
        errorResponseBody.err = err;
        return res.status(STATUS.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}


module.exports = {
    validateSignupRequest,
    validateSigninRequest,
    isAuthenticated
}