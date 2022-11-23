const User = require('../../models/userModel');

exports.getProfile = async (req, res, next) => {
    try {
        // hide fields
        const user = req.user.toObject();
        user.blocked = undefined;

        res.json({ status: 'success', user });
    } catch (error) {
        next(error);
    }
};

exports.postProfile = async (req, res, next) => {
    try {
        // if (req.file)

        const user = await User.findOneAndUpdate(
            { _id: req.user.id },
            req.body,
            { new: true, runValidators: true }
        ).select('-__v');

        res.json({ status: 'success', user });
    } catch (error) {
        next(error);
    }
};
