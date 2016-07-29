"use strict";

const   express     = require('express'),
        router      = express.Router();

router.get('/', (req, res) => {
    res.send('Views route contacted');
});

module.exports = router;