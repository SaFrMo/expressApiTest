"use strict";

const   express     = require('express'),
        router      = express.Router();

// Heartbeat
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API up and running!',
        routes: [
            'users/create [req "name" and "password" in body] [no auth]',
            'users/ [displays all users] [optional auth]',
            'users/:name [displays single user] [req auth]',
            'users/update [optional "name" and/or "password" in body to update user] [req auth]',
            'users/delete [req "id" in body to delete user] [req auth]',
            'users/auth [req "name" and "password" in body to retrieve token] [no auth]'
        ]
    });
});

router.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    req.authenticated = false;

    if( token ){
        // verifies secret, checks expiration
        jwt.verify(token, config.secret, (err, decoded) => {
            if( ! err ) {
                req.authenticated = decoded;
            }
            next();
        });
    } else {
        // no token
        next();
    }
});

// Create a user (no auth)
router.post('/users/create', (req, res, next) => {
    let name        = req.body.name,
        password    = req.body.password;

    User.findOne({ name: name }, (err, user) => {
        if( err ) throw err;

        if( user ){
            // We found an existing user, so let's try to update them (code 307 preserves POST method)
            res.redirect(307, '../users/update');
        } else {
            // Create a new user
            let newUser = new User({
                name: name,
                'secret.password': password
            });
            // Save to DB
            newUser.save((err) => {
               if( err ) throw err;

               res.json({
                   success: true,
                   message: 'User ' + newUser.name + ' created!'
               });
            });
        }
    });
});

router.get('/users/:name?', (req, res) => {

    let authenticated = req.authenticated;

    if( !req.params.name ){
        // All users requested
        User.find({}, (err, users) => {
            if( err ){
                res.json({
                    success: false,
                    message: 'Error connecting to DB!'
                });
            } else {
                res.json({
                    success: true,
                    message: authenticated ? 'Retrieving full information for all users.' : 'User not authenticated, retrieving limited information for all users.',
                    users: utilities.getUser(users, authenticated)
                });
            }
        });

    } else {
        // Single user requested
        User.find({ name: req.params.name }, (err, singleUser) => {
            if( err ) throw err;

            res.json({
                success: true,
                message: singleUser.length ? ( authenticated ? singleUser : singleUser.publicInfo() ) : 'No user with name ' + req.params.name + ' found!'
            });
        });

    }
});

// Update a user (auth)
router.post('/users/update', (req, res) => {
    let auth = req.authenticated;

    if( !auth ){
        res.json({
            success: false,
            message: 'User not authenticated!'
        });
    } else {
        let user = auth['$__'].scope;
        User.findOne({ name: user.name }, (err, result) => {
            if( err ) throw err;

            result.name = req.body.name || result.name;
            result.secret.password = req.body.password || result.secret.password;
            result.save();

            res.json({
                success: true,
                message: 'User ' + result.name + ' updated!',
                user: result
            });
        });
    }
});

// Delete a user (auth)
router.post('/users/delete', (req, res) => {
    let auth = req.authenticated;

    if( !auth ){
        res.json({
            success: false,
            message: 'User not authenticated!'
        });
    } else {
        User.findOne({ _id: req.body.id }, (err, result) => {
            if( err ) throw err;

            if( !result ){
                res.json({
                    success: false,
                    message: 'Couldn\'t find user!'
                });
            } else {
                result.remove((err2) => {
                    if( err2 ) throw err2;

                    res.json({
                        success: true,
                        message: 'User ' + result.name + ' deleted!'
                    });
                });
            }
        });
    }
});

// Login (retrieve auth)
router.post('/auth', (req, res) => {
    let name        = req.body.name,
        password    = req.body.password;

    // Try to find the user
    User.findOne({ name: name }, (err, user) => {
        if( err ) throw err;

        if( !user ){
            // No user found
            res.json({
                success: false,
                message: 'Authentication failed, no user \'' + name + '\' found!'
            });
        } else {
            // User found - check password
            if( password != user.secret.password ){
                // Incorrect password
                res.json({
                    success: false,
                    message: 'Authentication failed, incorrect password!'
                });
            } else {
                // Correct password - create token
                let token = jwt.sign(user, config.secret, {
                    expiresIn: 86400 // 24 hours
                });

                res.json({
                    success: true,
                    message: 'Logged in!',
                    token: token
                });
            }
        }
    });
});

module.exports = router;
