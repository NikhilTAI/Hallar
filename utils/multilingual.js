module.exports = (doc, req) => {
    const accepted = ['en', 'fr'];
    let language = accepted.includes(req.headers['accept-language'])
        ? req.headers['accept-language']
        : 'en';
    const lang = doc[language];
    let spread = doc.toObject ? doc.toObject() : doc;
    const newDoc = { ...spread, ...lang };
    delete newDoc.en;
    delete newDoc.fr;
    return newDoc;
};
