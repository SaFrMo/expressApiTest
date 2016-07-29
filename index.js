// USERS
// ========
//
// what:
// A proof-of-concept API where a user can create, read, update, and delete
// their username and password. Updating and deleting require authentication;
// reading while not authenticated provides only the username; reading while
// authenticated provides the user name and password.
//
// file structure:
// - index.js
// - app/
// - - models/
// - - - user.js
// - - routes/
// - - - api.js
// - - - views.js
// - config.js
// - utilities.js
// - package.json

"use strict";

        // Load modules
const   express     = require('express'),
        app         = express(),
        bodyParser  = require('body-parser'),
        morgan      = require('morgan'),
        mongoose    = require('mongoose'),
        jwt         = require('jsonwebtoken'),

        // Misc. utilities
        config      = require('./config'),
        utilities   = require('./utilities'),

        // Models
        User        = require('./app/models/user'),

        // Routes
        apiRouter   = require('./app/routes/api'),

        // Views
        viewRouter  = require('./app/routes/views');

// PREP SERVER
// ========
const   port        = 3000;
mongoose.connect(config.db);
app.set('secret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use( morgan('dev') );

// Set up view engine
app.set('view engine', 'jade');
app.set('views', './app/views');

// PREP ROUTES
// ========

app.use('/', viewRouter);
app.use('/api', apiRouter);

// RUN SERVER
// ========
app.listen(port);
console.log('Listening on port ' + port);