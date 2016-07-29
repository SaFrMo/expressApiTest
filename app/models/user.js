"use strict";

const   mongoose    = require('mongoose'),
        Schema      = mongoose.Schema;

let User = new Schema({
    name: String,
    secret: {
        password: String
    }
});

module.exports = mongoose.model('User', User);