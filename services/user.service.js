const User = require('../models/user.model');

const createUser = async (data) => {
    try{
        const response = await User.create(data);
        return response;
    }catch(err){
        console.error('Error creating user:', err);
        if(err.name == 'ValidationError') {
            let error = {};
            Object.keys(err.errors).forEach((key) => {
                error[key] = err.errors[key].message;
            });
            throw {err: err, code: 422};
        }
        throw err;
    }
}


    module.exports = {
        createUser,
    };
