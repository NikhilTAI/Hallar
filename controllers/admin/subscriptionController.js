const fs = require('fs');
const sharp = require('sharp');

const Subscription = require('../../models/subscriptionModel');

exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.render('subscription', { subscriptions });
    } catch (error) {
        res.send(error);
    }
};

exports.getAddSubscription = (req, res) => res.render('subscription_add');

exports.postAddSubscription = async (req, res) => {
    try {
        // upload file
        if (req.file) {
            const filename =
                Date.now() + req.file.originalname.replace(' ', '');

            if (!fs.existsSync('./public/uploads/subscription'))
                fs.mkdirSync('./public/uploads/subscription', {
                    recursive: true,
                });

            await sharp(req.file.buffer).toFile(
                `./public/uploads/subscription/${filename}`
            );
            req.body.image = `/uploads/subscription/${filename}`;
        }

        await Subscription.create({
            en: { description: req.body.enDesc },
            fr: { description: req.body.frDesc },
            ...req.body,
        });
        req.flash('green', 'Subscription added successfully.');
        res.redirect('/subscription');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.getEditSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            req.flash('red', `Subscription not found!`);
            return res.redirect('/subscription');
        }
        res.render('subscription_edit', { subscription });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', `Subscription not found!`);
            res.redirect('/subscription');
        } else {
            res.send(error);
        }
    }
};

exports.postEditSubscription = async (req, res) => {
    try {
        // upload file
        if (req.file) {
            const filename =
                Date.now() + req.file.originalname.replace(' ', '');

            if (!fs.existsSync('./public/uploads/subscription'))
                fs.mkdirSync('./public/uploads/subscription', {
                    recursive: true,
                });

            await sharp(req.file.buffer).toFile(
                `./public/uploads/subscription/${filename}`
            );
            req.body.image = `/uploads/subscription/${filename}`;
        }

        await Subscription.findByIdAndUpdate(req.params.id, {
            en: { description: req.body.enDesc },
            fr: { description: req.body.frDesc },
            ...req.body,
        });
        req.flash('green', 'Subscription updated successfully.');
        res.redirect('/subscription');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.deleteSubscription = async (req, res) => {
    try {
        await Subscription.findByIdAndRemove(req.params.id);
        req.flash('green', 'Subscription deleted successfully.');
        res.redirect('/subscription');
    } catch (error) {
        res.redirect('/subscription');
    }
};
