"use strict";

const express = require('express');
const path = require('path');

const app = express();

// Defining port number
const PORT = process.env.PORT || 3000;
const defaultMediaPath = process.env.mediaPath || '/src/media';

app.use(express.static(__dirname + '/dist'));
app.use(express.static('/media'), express.static(__dirname + defaultMediaPath));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});
