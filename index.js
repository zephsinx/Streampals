"use strict";

import express from "express";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    require('dotenv').config();
}
catch {
    // No-op
}

const PORT = process.env.PORT || 3000;
const app = express();

app.use('/favicon.ico', express.static(path.join(__dirname, '/dist/favicon.ico')));
app.use('/js', express.static(path.join(__dirname, '/dist/js')));
app.use('/media', express.static(path.join(__dirname, '/dist/media')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/dist/streamworms.html'));
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});
