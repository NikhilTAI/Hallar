const enPeriod = ['Week', 'Month', 'Year'];
const frPeriod = ['la semaine', 'Mois', 'An'];

module.exports = (doc, req) => {
    const accepted = ['en', 'fr'];
    let language = accepted.includes(req.headers['accept-language'])
        ? req.headers['accept-language']
        : 'en';
    const lang = doc[language];
    let spread = doc.toObject ? doc.toObject() : doc;
    const newDoc = { ...spread, ...lang };

    if (newDoc.period)
        if (language == 'fr')
            newDoc.period = frPeriod[enPeriod.indexOf(newDoc.period)];

    delete newDoc.en;
    delete newDoc.fr;
    return newDoc;
};
