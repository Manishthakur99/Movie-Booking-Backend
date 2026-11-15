const theatreService = require('../services/theatre.service');

const create = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.user) {
            data.owner = req.user;
        }

        const response = await theatreService.createTheatre(data);
        if (response.err) {
            return res.status(response.code).json({
                success: false,
                err: response.err,
                message: "Unable to create the theatre",
                data: {}
            });
        }

        return res.status(201).json({
            success: true,
            err: {},
            message: "Successfully created the theatre",
            data: response.theatre
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            err: err.message,
            message: "Internal server error",
            data: {}
        });
    }
};

module.exports = {
    create
};
