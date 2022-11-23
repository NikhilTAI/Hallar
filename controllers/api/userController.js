const Page = require('../../models/pageModel');
const Subscription = require('../../models/subscriptionModel');

const multilingual = require('../../utils/multilingual');

exports.getTerms = async (req, res, next) => {
    try {
        let page = await Page.findOne();
        page = multilingual(page, req);
        const content = page.content;
        res.json({ status: 'success', content });
    } catch (error) {
        next(error);
    }
};

exports.getSubscriptions = async (req, res, next) => {
    try {
        let subscriptions = await Subscription.find().select('-__v');
        subscriptions = subscriptions.map(el => multilingual(el, req));
        res.json({ status: 'success', subscriptions });
    } catch (error) {
        next(error);
    }
};
