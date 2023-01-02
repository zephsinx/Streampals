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

let ddb = undefined;

const HASH_SALT = Number(process.env.HASH_SALT) || null;
const MEDIA_FILE = process.env.MEDIA_FILE || '/dist/media/worms.gif';
const PORT = process.env.PORT || 3000;
const TABLE_NAME = process.env.TABLE_NAME || 'streamerworm_visits';
const TRACK_HITS = process.env.TRACK_HITS || false;

if (TRACK_HITS && HASH_SALT) {
    const AWS = require('aws-sdk');

    // Set the region
    AWS.config.update({region: process.env.AWS_REGION});
    // Create the DynamoDB service object
    ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
}

const app = express();
app.set('view engine', 'pug');

app.use('/js', express.static(__dirname + '/dist/js'));
app.use('/media', express.static(__dirname + MEDIA_FILE));
app.use('/favicon.ico', express.static(__dirname + '/dist/favicon.ico'));

app.get('/', function (req, res) {
    if (ddb)
        logHit(req.ip);

    res.render(path.join(__dirname, '/dist/index'), function (err, html) {
        res.send(html);
    });
});

// Server setup
app.listen(PORT, () => {
    console.log(`Running server on PORT ${PORT}...`);
});

// Private methods

function logHit(ipAddress) {
    let hashedIp = cyrb53(ipAddress, HASH_SALT);

    let params = {
        TableName: TABLE_NAME,
        Key: {
            TABLE_PK: {N: hashedIp},
        },
    };

    // Call DynamoDB to read the item from the table
    let count = -1;
    ddb.getItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            count = data.Item.visitCount || 0;
        }
    });

    if (count < 0)
        return;

    else if (count === 0) {
        count = 1;
    }

    params = {
        TableName: TABLE_NAME,
        Item: {
            TABLE_PK : {N: hashedIp},
            TABLE_SK : {N: count},
        }
    };

    // Call DynamoDB to add the item to the table
    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        }
    });
}

/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    A fast and simple hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
    Public domain. Attribution appreciated.
*/
const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};