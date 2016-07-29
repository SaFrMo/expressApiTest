"use strict";

const   express     = require('express'),
        router      = express.Router(),
        jade        = require('jade');

router.get('/', (req, res) => {
    res.render('login', {
        title: 'Login'
    });
});

module.exports = router;