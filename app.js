const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const i18n = require('i18next');
const i18nFsBackend = require('i18next-node-fs-backend');
const i18nMiddleware = require('i18next-http-middleware');

const globalErrorHandler = require('./controllers/errorController.js');

// Start express app
const app = express();

// multilingual
i18n.use(i18nFsBackend)
    .use(i18nMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath: __dirname + '/locales/{{lng}}.json',
        },
        fallbackLng: 'en',
        lowerCaseLng: true,
        preload: ['en', 'fr'],
        saveMissing: true,
    });

app.use(
    i18nMiddleware.handle(i18n, {
        removeLngFromUrl: false,
    })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// session
app.use(
    require('cookie-session')({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// caching disabled for every route
app.use(function (req, res, next) {
    res.set(
        'Cache-Control',
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    );
    next();
});

// 2) API ROUTES
app.use('/api/', require('./routes/api/authRoutes'));
app.use('/api/', require('./routes/api/profileRoutes'));
app.use('/api/', require('./routes/api/userRoutes'));

// 404 api
app.all('/api/*', (req, res, next) => {
    if (req.originalUrl.startsWith('/app-assets'))
        return res.status(404).send();
    next(createError.NotFound(`Can't find ${req.originalUrl} on this server!`));
});

// 3) ADMIN ROUTES
app.use(function (req, res, next) {
    res.locals.url = req.originalUrl;
    next();
});

app.use('/cms', require('./routes/admin/cmsRoutes'));
app.use('/subscription', require('./routes/admin/subscriptionRoutes'));
app.use('/user', require('./routes/admin/userRoutes'));
app.use('/', require('./routes/admin/authRoutes'));

// 4) ERROR HANDLING
// 404 uploads
app.all('/uploads/*', (req, res) => {
    res.status(404).send();
});

// 404 admin
app.all('/*', (req, res) => {
    res.status(404).render('404', { message: `Page not found!` });
});

app.use(globalErrorHandler);

module.exports = app;
