"use strict";

const express = require('express');
const path = require('path');
require('pug');

try {
    require('dotenv').config();
}
catch {
    // No-op
}

const MEDIA_FILE = process.env.MEDIA_FILE || '/dist/media/worms.gif';
const PORT = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'pug');

app.use('/favicon.ico', express.static(path.join(__dirname, '/dist/favicon.ico')));
app.use('/js', express.static(path.join(__dirname, '/dist/js')));
app.use('/media', express.static(path.join(__dirname, MEDIA_FILE)));

app.get('/', function (req, res) {
    res.locals.lang = process.env.LANG || 'en';
    res.locals.title = process.env.TITLE || 'StreamWorms';
    res.render(path.join(__dirname, '/dist/index'), function (err, html) {
        res.send(html);
    });
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});
