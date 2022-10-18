const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
// const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController.js');

// Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
// app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

// app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// Set security HTTP headers
// app.use(helmet());

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

// 2) ROUTES
// app.use('/api/tours', tourRouter);
app.use(function (req, res, next) {
    res.locals.url = req.originalUrl;
    next();
});
app.use('/', require('./routes/admin/adminAuthRoutes'));

// 3) ERROR HANDLING
// 404 uploads
app.all('/uploads/*', (req, res) => {
    res.status(404).send();
});

// 404 api
app.all('/api/*', (req, res, next) => {
    if (req.originalUrl.startsWith('/app-assets')) return;
    next(createError.NotFound(`Can't find ${req.originalUrl} on this server!`));
});

// 404 admin
app.all('/*', (req, res) => {
    res.status(404).render("404", { message: `Page not found!` });
});

app.use(globalErrorHandler);

module.exports = app;
