const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

const userRoutes = require('./api/routes/user');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use('/users', userRoutes);

// Error state for non existent URLs
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Error state for everything else (database error, etc.)
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;