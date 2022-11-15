const Page = require('../../models/pageModel.js');

exports.getTerms = async (req, res) => {
    try {
        const page = await Page.findOne();
        res.render('terms', { page, photo: req.admin.photo });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.postTerms = async (req, res) => {
    try {
        await Page.findOneAndUpdate(
            { title: 'terms' },
            {
                en: { content: req.body.EnContent },
                fr: { content: req.body.FrContent },
            }
        );
        req.flash('green', 'Terms & Conditions updated successfully.');
        res.redirect('/cms/terms');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};
