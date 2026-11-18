const userService = require('../services/user.service');

const { successResponseBody, errorResponseBody } = require('../utils/responsebody');

const signup = async (req, res) => {
    try {
        const response = await userService.createUser(req.body);
        successResponseBody.data = response;
        successResponseBody.message = 'User created successfully';
        return res.status(201).json(successResponseBody);
    }
    catch (error) {
        errorResponseBody.error = error;
        return res.status(500).json(errorResponseBody);
    }
}




module.exports = {
    signup,
}