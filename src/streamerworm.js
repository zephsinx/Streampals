"use strict";

// Constants
const constants = require('./constants');
const media = require('./medialist');

// Global defaults
const defaultMinMillis = constants.DefaultMinMinutes * 60 * 1000;
const defaultMaxMillis = constants.DefaultMaxMinutes * 60 * 1000;

// Global values
let lastCorner = randomIntFromInterval(0, 3);

// Get config settings
const config = getStreamerWormConfig();

// Set default media to the first entry in the list
const mediaListElement = media.MediaList[0];

// Build media element based on file extension
const tagName = getTagNameFromFile(mediaListElement.path);
const element = prepareElement(tagName, config);

// Append media element to media div
const mediaDiv = document.getElementById("media-div");
mediaDiv.appendChild(element);

// Initialize media loop
playMedia(element);

//#region Media Methods

// Shows and plays media after a random delay, then hides the media after durationMillis expires.
function playMedia(element) {
    // Skip delay between media plays when config.skipDelay == true
    let delay = randomIntFromInterval(config.minDelay, config.maxDelay);
    
    // Display the image after the random delay expires
    setTimeout(() => {
        // Reset image source to replay in the case of a GIF
        if (tagName === 'img') {
            element.src = '';
            element.src = mediaListElement.path;
        }
        // Restart video and play in the case of a WebM
        else {
            element.currentTime = 0;
            element.play();
        }
        // Make media visible
        element.style.visibility = 'visible';
        
        // Hide image/video after it plays for the desired duration, and requeue the media timer
        setTimeout(() => {
            element.style.visibility = 'hidden';
            setPosition(element);
            playMedia(element);
        }, mediaListElement.durationMillis);
        
    }, delay);
}

// Returns a random integer between min and max (inclusive)
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function setPosition(element) {
    let corner = randomIntFromInterval(0, 3);
    while (lastCorner === corner) {
        corner = randomIntFromInterval(0, 3);
    }
    lastCorner = corner;

    element.style.top = '';
    element.style.bottom = '';
    element.style.left = '';
    element.style.right = '';

    switch (corner) {
        // 0: top left
        case 0:
            element.style.top = '0px';
            element.style.left = '0px';
            break;
        // 1: top right
        case 1:
            element.style.top = '0px';
            element.style.right = '0px';
            break;
        // 2: bottom right
        case 2:
            element.style.bottom = '0px';
            element.style.right = '0px';
            break;
        // 3: bottom left
        case 3:
            element.style.bottom = '0px';
            element.style.left = '0px';
            break;
    }
}

//#endregion

//#region StreamerWorm configuration methods

// Parse URL parameters from URL
function getStreamerWormConfig() {
    // Get parameters from browser URL
    let urlParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop || ''),
    });

    // todo: (param) Image display coordinates (where on the screen should it show up)
    let skipDelay = parseBool(urlParams.skipDelay);
    let maxDelayMillis = getDelayMillis(skipDelay, urlParams.max, defaultMaxMillis);
    let minDelayMillis = getDelayMillis(skipDelay, urlParams.min, defaultMinMillis);
    let maxHeight = isValidNumericValue(urlParams.maxHeight) ? urlParams.maxHeight : constants.DefaultMaxHeight;
    let maxWidth = isValidNumericValue(urlParams.maxWidth) ? urlParams.maxWidth : constants.DefaultMaxWidth;
    // let shouldRandomize = parseBool(urlParams.randomize);
    // let slideshow = parseBool(urlParams.slideshow);
    
    let config = {
        maxDelay: maxDelayMillis,         // The maximum delay between media plays (ignored if skipDelay is true)
        minDelay: minDelayMillis,         // The minimum delay between media plays (ignored if skipDelay is true)
        maxHeight: maxHeight,             // The maximum height the media should take up. Image will be resized to fit if larger.
        maxWidth: maxWidth,               // The maximum width the media should take up. Image will be resized to fit if larger.
        // shouldRandomize: shouldRandomize, // If the displayed media should be randomized from the media list (ignored if slideshow is false)
        // slideshow: slideshow,             // If the displayed media should change on each loop
    };
    
    return validateConfig(config);
}

// Validate and update config if invalid.
function validateConfig(config) {
    // minDelayMillis must be less than or equal to maxDelayMillis, else use defaults
    if (config.maxDelayMillis < config.minDelayMillis)
    {
        config.maxDelayMillis = defaultMaxMillis;
        config.minDelayMillis = defaultMinMillis;
    }
    
    return config;
}

// Validate and calculate delay in milliseconds from params
function getDelayMillis(skipDelay, delayMinutes, defaultDelay) {
    if (skipDelay)
        return 0;

    return isValidNumericValue(delayMinutes) ? (delayMinutes * 60 * 1000) : defaultDelay;
}

// Check that provided string is a valid number and positive.
function isValidNumericValue(numberString) {
    return !isNaN(numberString) && !isNaN(parseFloat(numberString)) && parseFloat(numberString) > 0;
}

// Returns the value of a string as a boolean. Defaults to "false" if not a valid boolean
function parseBool(boolString) {
    return boolString === 'true';
}

//#endregion

//#region Element Configuration

// Configure element to display based on tagName
function prepareElement(tagName, config) {
    // Create img or video element based on tagName
    let mediaElement = document.createElement(tagName);
    mediaElement.id = 'rendered-media';
    mediaElement.style.objectFit = 'contain';
    mediaElement.style.maxHeight = config.maxHeight + '%';
    mediaElement.style.maxWidth = config.maxWidth + '%';
    mediaElement.style.position = 'absolute';
    
    switch (tagName) {
        case 'img':
            return configureImageElement(mediaElement);
        case 'video':
            return configureVideoElement(mediaElement);
        default:
            throw 'Tag name ' + tagName + ' not recognized';
    }
}

// Get the appropriate element tag name from the media file extension
function getTagNameFromFile(fileName) {
    let tagName;
    let fileExtension = fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);

    switch (fileExtension) {
        case 'apng':
        case 'avif':
        case 'gif':
        case 'jpg':
        case 'jpeg':
        case 'jpe':
        case 'jif':
        case 'png':
        case 'svg':
        case 'jfif':
        case 'webp':
            tagName = 'img';
            break;
        case 'webm':
            tagName = 'video';
            break;
        default:
            throw 'File extension .' + fileExtension + ' is not yet supported';
    }

    return tagName;
}

// Set Image properties
function configureImageElement(image) {
    // todo: Configure image
    return image;
}

// Set Video properties
function configureVideoElement(videoElement) {
    let videoSource = document.createElement('source');
    videoSource.src = mediaListElement.path;
    videoSource.type = 'video/webm';

    // Note: autoplay only works in Chrome after a user has interacted with the DOM unless the muted tag is used
    videoElement.autoplay = true;
    // videoElement.muted = 'muted'; // Needed to autoplay in Chrome browser after Chrome 66
    videoElement.appendChild(videoSource);

    return videoElement;
}

//#endregion