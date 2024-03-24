"use strict";

import constants from "./utils/constants.js";
import utils from "./utils/utils.js";

// Global defaults
const DefaultMediaDurationMillis = constants.DefaultMediaDurationSeconds * 1000;
const DefaultMinMillis = constants.DefaultMinMinutes * 60 * 1000;
const DefaultMaxMillis = constants.DefaultMaxMinutes * 60 * 1000;
const DefaultMediaUrl = '/media/worms.gif';

// Div containing the media to display
const mediaDiv = document.getElementById("media-div");

// Global variables

let tagName;
let element;
let config;
let first = true;

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
    let delay = utils.randomIntFromInterval(config.minDelay, config.maxDelay);
    if (first) {
        delay = 0;
        first = false;
    }
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
            setMediaUrl(element, config);
            playMedia(element);
        }, config.mediaDuration);
    }, delay);
}

let lastQuadrant;
// Set position of media element on page
function setPosition(element) {
    let coordinates = utils.getMediaCoordinateStyles(lastQuadrant, element.height, element.width);
    lastQuadrant = coordinates.quadrant;
    element.style.left = coordinates.left;
    element.style.top = coordinates.top;
}

// Check if we should randomize the media
function setMediaUrl(element, config) {
    if (config.randomImage) {
        let randomIndex = Math.floor(Math.random() * config.mediaPaths.length);
        element.src = config.mediaPaths[randomIndex];
    }
}

//#endregion

//#region StreamWorms configuration methods

// Get StreamWorms config
async function getStreamWormsConfig() {
    let urlParams = getUrlParams();
    let config = await createConfig(urlParams);
    return validateConfig(config);
}

function getUrlParams() {
    return new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop || ''),
    });
}

async function createConfig(urlParams) {
    const skipDelay = urlParams.skipDelay === 'true';
    const maxDelayMillis = getDelayMillis(skipDelay, urlParams.max, DefaultMaxMillis);
    const minDelayMillis = getDelayMillis(skipDelay, urlParams.min, DefaultMinMillis);
    const maxHeight = isValidNumericValue(urlParams.maxHeight) ? urlParams.maxHeight : constants.DefaultMaxHeight;
    const maxWidth = isValidNumericValue(urlParams.maxWidth) ? urlParams.maxWidth : constants.DefaultMaxWidth;
    let randomImage = (urlParams.randomImage === undefined || urlParams.randomImage === null) ? true : urlParams.randomImage === 'true';

    console.log(`randomize = ${randomImage}`);

    const mediaFile = await getMediaFile(urlParams.mediaUrl);
    const mediaPaths = mediaFile.mediaPaths;

    let mediaUrl;
    if (randomImage && mediaPaths.length > 0) {
        const randomIndex = Math.floor(Math.random() * mediaPaths.length);
        mediaUrl = mediaPaths[randomIndex];
    }

    if (mediaPaths.length > 0) {
        const randomIndex = Math.floor(Math.random() * mediaPaths.length);
        mediaUrl = mediaPaths[randomIndex];
    }

    let mediaDuration = urlParams.mediaDuration;
    // Get content type from file extension
    let extension = mediaUrl.split('.').pop().split('?')[0];
    let contentType = getContentTypeFromFileExtension(extension);

    if (!isValidNumericValue(mediaDuration) || contentType === '') {
        let mediaInfo;
        try {
            mediaInfo = await fetchMediaInfo(mediaUrl);
            if (contentType === '') {
                contentType = mediaInfo.contentType;
            }
            if (!isValidNumericValue(mediaDuration)) {
                mediaDuration = mediaInfo.duration;
            }
        } catch (error) {
            console.log(`Using default media duration of ${DefaultMediaDurationMillis} milliseconds`);
            mediaDuration = DefaultMediaDurationMillis;
        }
    }

    return {
        skipDelay: skipDelay,
        maxDelay: maxDelayMillis,
        minDelay: minDelayMillis,
        maxHeight: maxHeight,
        maxWidth: maxWidth,
        mediaUrl: mediaUrl,
        mediaPaths: mediaPaths,
        mediaDuration: mediaDuration,
        contentType: contentType,
        randomImage: randomImage,
    };
}

async function getMediaFile(urlParamMediaUrl) {
    if (urlParamMediaUrl) {
        return urlParamMediaUrl;
    }
    
    // Fetch media file
    let mediaFile = await fetch('/js/resources/media.json', {mode: 'cors'})
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(res);
        })
        .catch((err) => {
            console.log(err);
        });
    
    return mediaFile || { mediaPath: DefaultMediaUrl, mediaPaths: [] };
}

// Validate and update config if invalid.
function validateConfig(config) {
    // minDelayMillis must be less than or equal to maxDelayMillis, else use defaults
    if (config.maxDelayMillis < config.minDelayMillis) {
        config.maxDelayMillis = DefaultMaxMillis;
        config.minDelayMillis = DefaultMinMillis;
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

// Fetch media file
async function fetchMediaInfo(mediaUrl) {
    let contentType;
    let duration = await fetch(mediaUrl, {mode: 'cors'})
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
    for (let i = 0; i < uint8.length; i++) {
        if (uint8[i] === 0x21
            && uint8[i + 1] === 0xF9
            && uint8[i + 2] === 0x04
            && uint8[i + 7] === 0x00) {
            const delay = (uint8[i + 5] << 8) | uint8[i + 4];
            duration += delay < 2 ? 10 : delay;
        }
    }
    return duration * 10;
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
    mediaElement.style.top = '0';
    mediaElement.style.left = '0';
    mediaElement.alt = 'Just a lil\' stream pal';

    switch (tagName) {
        case 'img':
            return mediaElement;
        case 'video':
            return configureVideoElement(mediaElement, config);
        default:
            throw new Error(`Tag name ${tagName} not recognized`);
    }
}

// Map file extension to content type
function getContentTypeFromFileExtension(fileExtension) {
    switch (fileExtension) {
        case 'avif':
            return 'image/avif';
        case 'gif':
            return 'image/gif';
        case 'jpeg':
        case 'jpg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'svg':
            return 'image/svg+xml';
        case 'webp':
            return 'image/webp';
        case 'webm':
            return 'video/webm';
        default:
            return '';
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