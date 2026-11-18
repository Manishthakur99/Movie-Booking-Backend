const User = require('../models/user.model');

const createUser = async (data) => {
    try{
        const response = await User.create(data);
        return response;
    }catch(err){
        console.error('Error creating user:', err);
        throw err;
    }
}


    module.exports = {
        createUser,
    };
