// todo: Create and use environment variables
const express = require('express');
const path = require('path');

const app = express();

// Defining port number
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/html/index.html'));
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
})
