"use strict";

// Constants
const constants = require('./constants');

// Global defaults
const defaultMinMillis = constants.DefaultMinMinutes * 60 * 1000;
const defaultMaxMillis = constants.DefaultMaxMinutes * 60 * 1000;

// Div containing the media to display
const mediaDiv = document.getElementById("media-div");

// Global variables
let lastCorner;
let tagName;
let element;
let config;

// Get config settings
getStreamerWormConfig()
    .then(configVal => {
        config = configVal;
        tagName = getTagNameFromFile(config.mediaUrl);
        element = prepareElement(tagName, config);
    })
    .then(() => {
        // Create and append media element to media div
        mediaDiv.appendChild(element);
        playMedia(element);
    });

//#region Media Methods

// Shows and plays media after a random delay, then hides the media after durationMillis expires
function playMedia(element) {
    // Skip delay between media plays when config.skipDelay == true
    let delay = randomIntFromInterval(config.minDelay, config.maxDelay);
    
    // Display the image after the random delay expires
    setTimeout(() => {
        // Reset image source to replay in the case of a GIF
        if (tagName === 'img') {
            element.src = '';
            element.src = config.mediaUrl;
        }
        // Restart video and play in the case of a WebM
        else {
            element.currentTime = 0;
            element.play();
        }
        // Make media visible
        mediaDiv.style.visibility = 'visible';
        
        // Hide image/video after it plays for the desired duration, and requeue the media timer
        setTimeout(() => {
            mediaDiv.style.visibility = 'hidden';
            setPosition(element);
            playMedia(element);
        }, config.mediaDuration);
    }, delay);
}

// Returns a random integer between min and max (inclusive)
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Set position of media element on page
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
async function getStreamerWormConfig() {
    // Get parameters from browser URL
    let urlParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop || ''),
    });

    let skipDelay = parseBool(urlParams.skipDelay);
    let maxDelayMillis = getDelayMillis(skipDelay, urlParams.max, defaultMaxMillis);
    let minDelayMillis = getDelayMillis(skipDelay, urlParams.min, defaultMinMillis);
    let maxHeight = isValidNumericValue(urlParams.maxHeight) ? urlParams.maxHeight : constants.DefaultMaxHeight;
    let maxWidth = isValidNumericValue(urlParams.maxWidth) ? urlParams.maxWidth : constants.DefaultMaxWidth;
    let mediaUrl = urlParams.mediaUrl ? urlParams.mediaUrl : constants.DefaultMediaPath;
    
    let mediaDuration = await getMediaDuration(mediaUrl);
    
    // let shouldRandomize = parseBool(urlParams.randomize);
    // let slideshow = parseBool(urlParams.slideshow);
    
    let config = {
        maxDelay: maxDelayMillis,            // The maximum delay between media plays (ignored if skipDelay is true)
        minDelay: minDelayMillis,            // The minimum delay between media plays (ignored if skipDelay is true)
        maxHeight: maxHeight,                // The maximum height the media should take up. Image will be resized to fit if larger
        maxWidth: maxWidth,                  // The maximum width the media should take up. Image will be resized to fit if larger
        mediaUrl: mediaUrl,                  // The URL or path of the media to display
        mediaDuration: mediaDuration,        // The duration of the media to display, used for knowing how long to display it for
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
    
    if (config.mediaDuration < 100)
        config.mediaDuration = 100;
    
    return config;
}

// Validate and calculate delay in milliseconds from params
function getDelayMillis(skipDelay, delayMinutes, defaultDelay) {
    if (skipDelay)
        return 0;

    return isValidNumericValue(delayMinutes) ? (delayMinutes * 60 * 1000) : defaultDelay;
}

// Check that provided string is a valid number and positive
function isValidNumericValue(numberString) {
    return !isNaN(numberString) && !isNaN(parseFloat(numberString)) && parseFloat(numberString) > 0;
}

// Returns the value of a string as a boolean. Defaults to "false" if not a valid boolean
function parseBool(boolString) {
    return boolString === 'true';
}

// Fancy method to get Media length
async function getMediaDuration(mediaUrl) {
    return await fetch(mediaUrl, { mode: 'cors' })
        .then(res => {
            if (res.ok)
                return Promise.resolve(res);
            return Promise.reject(res);
        })
        .then(res => res.arrayBuffer())
        .then(ab => getGifDuration(new Uint8Array(ab)))
        .catch(err => {
            throw new Error(constants.FetchImageError.replace('{0}', mediaUrl).replace('{1}', `${err.status} - ${err.statusText}`));
        });

    /** @param {Uint8Array} uint8 */
    function getGifDuration (uint8) {
        let duration = 0
        for (let i = 0, len = uint8.length; i < len; i++) {
            if (uint8[i] === 0x21
                && uint8[i + 1] === 0xF9
                && uint8[i + 2] === 0x04
                && uint8[i + 7] === 0x00)
            {
                const delay = (uint8[i + 5] << 8) | (uint8[i + 4] & 0xFF)
                duration += delay < 2 ? 10 : delay
            }
        }
        // Convert to milliseconds
        return duration * 10
    }
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

    setPosition(mediaElement);
    
    switch (tagName) {
        case 'img':
            return mediaElement;
        case 'video':
            return configureVideoElement(mediaElement, config.mediaUrl);
        default:
            throw 'Tag name ' + tagName + ' not recognized';
    }
}

// Get the appropriate element tag name from the media file extension
function getTagNameFromFile(fileName) {
    let fileExtension = getFileExtension(fileName)

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
            return 'img';
        case 'webm':
            return 'video';
        default: {
            if (!fileExtension)
                console.warn(constants.ExtensionNotFoundError);
            else
                console.warn(constants.ExtensionNotSupportedError.replace('{0}', fileExtension));
        }
        
        return 'img';
    }
}

// Get extension from file path
function getFileExtension(fileName) {
    return fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);
}

// Set Video properties
function configureVideoElement(videoElement, mediaUrl) {
    let videoSource = document.createElement('source');
    videoSource.src = mediaUrl;
    videoSource.type = 'video/webm';

    // Note: autoplay only works in Chrome after a user has interacted with the DOM unless the muted tag is used
    videoElement.autoplay = true;
    // videoElement.muted = 'muted'; // Needed to autoplay in Chrome browser after Chrome 66
    videoElement.appendChild(videoSource);

    return videoElement;
}

//#endregion