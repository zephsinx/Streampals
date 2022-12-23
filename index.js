const express = require('express');
const path = require('path');

const app = express();

// Defining port number
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/src'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});
