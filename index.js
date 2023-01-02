"use strict";

const express = require('express');
const path = require('path');

try {
    require('dotenv').config();
}
catch {
    // No-op
}

const PORT = process.env.PORT || 3000;
const MEDIA_FILE = process.env.MEDIA_FILE || '/dist/media/worms.gif';

const app = express();
app.set('view engine', 'pug')

app.use('/js', express.static(__dirname + '/dist/js'));
app.use('/media', express.static(__dirname + MEDIA_FILE));
app.use('/favicon.ico', express.static(__dirname + '/dist/favicon.ico'));

app.get('/', function (req, res) {
    res.render(path.join(__dirname, '/dist/index'), function (err, html) {
        res.send(html);
    });
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});
