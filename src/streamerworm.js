"use strict";

// Constants
const constants = require('./constants');
const media = require('./medialist');

// Set default time bounds to use if none are provided
const defaultMinMillis = constants.DefaultMinMinutes * 60 * 1000;
const defaultMaxMillis = constants.DefaultMaxMinutes * 60 * 1000;

// Set default media to the first entry in the list
const mediaListElement = media.MediaList[0];

// Build media element based on file extension
const tagName = getTagNameFromFile(mediaListElement.path);
const element = prepareElement(tagName);

// Append media element to media div
const mediaDiv = document.getElementById("media-div");
mediaDiv.appendChild(element);

// Get config settings
const config = getStreamerWormConfig();

// Initialize media loop
playMedia(element);

//#region Media Methods

// Shows and plays media after a random delay, then hides the media after durationMillis expires.
function playMedia(element) {
    // Skip delay between media plays when config.skipDelay == true
    let delay = config.skipDelay
        ? 0
        : randomIntFromInterval(config.minDelay, config.maxDelay);
    
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
            playMedia(element);
        }, mediaListElement.durationMillis);
        
    }, delay);
}

// Returns a random integer between min and max (inclusive)
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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
    let minDelayMillis = isValidDelay(urlParams.min) ? (urlParams.min * 60 * 1000) : defaultMinMillis; 
    let maxDelayMillis = isValidDelay(urlParams.max) ? (urlParams.max * 60 * 1000) : defaultMaxMillis;
    let slideshow = parseBool(urlParams.slideshow);
    let shouldRandomize = parseBool(urlParams.randomize);

    // minDelayMillis must be less than maxDelayMillis
    if (maxDelayMillis <= minDelayMillis)
    {
        minDelayMillis = defaultMinMillis;
        maxDelayMillis = defaultMaxMillis;
    }
    
    return {
        skipDelay: skipDelay,             // If the delay between media plays should be skipped
        minDelay: minDelayMillis,         // The minimum delay between media plays (ignored if skipDelay is true)
        maxDelay: maxDelayMillis,         // The maximum delay between media plays (ignored if skipDelay is true)
        slideshow: slideshow,             // If the displayed media should change on each loop
        shouldRandomize: shouldRandomize, // If the displayed media should be randomized from the media list (ignored if slideshow is false)
    };
}

// Check that provided string is a valid number and positive.
function isValidDelay(numberString) {
    return !isNaN(numberString) && !isNaN(parseFloat(numberString)) && parseFloat(numberString) > 0;
}

// Returns the value of a string as a boolean. Defaults to "false" if not a valid boolean
function parseBool(boolString) {
    return boolString === 'true';
}

//#endregion

//#region Element Configuration

// Configure element to display based on tagName
function prepareElement(tagName) {
    // Create img or video element based on tagName
    let mediaElement = document.createElement(tagName);
    mediaElement.id = 'rendered-media';
    mediaElement.style = 'max-width: 25%; max-height: 25%; object-fit: contain';
    
    switch (tagName) {
        case 'img':
            return configureImageElement(mediaElement);
        case 'video':
            return configureVideoElement(mediaElement);
        default:
            return mediaElement;
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