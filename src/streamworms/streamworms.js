"use strict";

const constants = require('./utils/constants');

// Global defaults

const defaultMinMillis = constants.DefaultMinMinutes * 60 * 1000;
const defaultMaxMillis = constants.DefaultMaxMinutes * 60 * 1000;
const defaultMediaUrl = '/media';

// Div containing the media to display
const mediaDiv = document.getElementById("media-div");

// Global variables

let lastCorner;
let tagName;
let element;
let config;

// Get config settings
getStreamWormsConfig()
    .then(configVal => {
        config = configVal;
        tagName = getTagNameFromFile(config.contentType);
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

//#region StreamWorms configuration methods

// Parse URL parameters from URL
async function getStreamWormsConfig() {
    // Get parameters from browser URL
    let urlParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop || ''),
    });

    let skipDelay = parseBool(urlParams.skipDelay);
    let maxDelayMillis = getDelayMillis(skipDelay, urlParams.max, defaultMaxMillis);
    let minDelayMillis = getDelayMillis(skipDelay, urlParams.min, defaultMinMillis);
    let maxHeight = isValidNumericValue(urlParams.maxHeight) ? urlParams.maxHeight : constants.DefaultMaxHeight;
    let maxWidth = isValidNumericValue(urlParams.maxWidth) ? urlParams.maxWidth : constants.DefaultMaxWidth;
    let mediaUrl = urlParams.mediaUrl ? urlParams.mediaUrl : defaultMediaUrl;
    let mediaInfo = await fetchMediaInfo(mediaUrl);
    let mediaDuration = isValidNumericValue(urlParams.mediaDuration) ? (urlParams.mediaDuration * 1000) : mediaInfo.duration || 0;

    let config = {
        skipDelay: skipDelay,
        maxDelay: maxDelayMillis,            // The maximum delay between media plays (ignored if skipDelay is true)
        minDelay: minDelayMillis,            // The minimum delay between media plays (ignored if skipDelay is true)
        maxHeight: maxHeight,                // The maximum height the media should take up. Image will be resized to fit if larger
        maxWidth: maxWidth,                  // The maximum width the media should take up. Image will be resized to fit if larger
        mediaUrl: mediaUrl,                  // The URL or path of the media to display
        mediaDuration: mediaDuration,        // The duration of the media to display, used for knowing how long to display it for. In milliseconds
        contentType: mediaInfo.contentType,  // Content type of the downloaded media
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

    if (config.mediaDuration === 0) {
        throw new Error(constants.ZeroMediaDurationWarning);
    }

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

// Fetch media file
async function fetchMediaInfo(mediaUrl) {
    let contentType;
    let duration = await fetch(mediaUrl, { mode: 'cors' })
        .then(res => {
            if (res.ok) {
                {
                    contentType = res.headers.get("Content-Type");
                    return Promise.resolve(res);
                }
            }
            return Promise.reject(res);
        })
        .then(res => res.arrayBuffer())
        .then(ab => getMediaDuration(new Uint8Array(ab)))
        .catch(err => {
            throw new Error(constants.FetchImageError.replace('{0}', mediaUrl).replace('{1}', `${err.status} - ${err.statusText}`));
        });

    return {contentType: contentType, duration: duration};
}

// Fancy method to get Media length
function getMediaDuration(uint8) {
    let duration = 0;
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
    mediaElement.alt = 'Just a lil\' worm guy';

    setPosition(mediaElement);
    
    switch (tagName) {
        case 'img':
            return mediaElement;
        case 'video':
            return configureVideoElement(mediaElement, config);
        default:
            throw new Error(`Tag name ${tagName} not recognized`);
    }
}

// Get the appropriate element tag name from the media file extension
function getTagNameFromFile(contentType) {
    switch (contentType) {
        case 'image/avif':
        case 'image/gif':
        case 'image/jpeg':
        case 'image/png':
        case 'image/svg+xml':
        case 'image/webp':
        case contentType.startsWith('image/'):
            return 'img';
        case 'video/webm':
        case contentType.startsWith('video/'):
            return 'video';
        default: {
            if (!contentType)
                console.warn(constants.ContentTypeNotFoundError);
            else
                console.warn(constants.ContentTypeNotSupportedError.replace('{0}', contentType));
        }
        return 'img';
    }
}

// Set Video properties
function configureVideoElement(videoElement, config) {
    let videoSource = document.createElement('source');
    videoSource.src = config.mediaUrl;
    videoSource.type = config.contentType;

    // Note: autoplay only works in Chrome after a user has interacted with the DOM unless the muted tag is used
    videoElement.autoplay = true;
    videoElement.appendChild(videoSource);

    return videoElement;
}

//#endregion