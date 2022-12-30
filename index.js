"use strict";

const express = require('express');
const path = require('path');
const replace = require('replace-in-file');
require('dotenv').config();

const app = express();

// Set port number
const PORT = process.env.PORT || 3000;

// [TechDebt]: Find a better way to insert the end variable
// Replace [[mediaUrl]]
const options = {

    //Single file
    files: 'dist/index.html',

    //Replacement to make (string or regex)
    from: /id="media-url".*>(.*)<\/[a-z]*>/g,
    to: match => {
        let replaceString = match.replace(/id="media-url".*>(.*)<\/[a-z]*>/g, '$1');
        return match.replace(replaceString, process.env.MEDIA_FILE_NAME);
    },
};

try {
    replace.sync(options);
}
catch (error) {
    console.error('Error occurred:', error);
}

// Set path where media is found
const defaultMediaPath = process.env.DEFAULT_MEDIA_PATH || '/src/media';

app.use(express.static(__dirname + '/dist'));
app.use(express.static('/media'), express.static(__dirname + defaultMediaPath));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});
