// Constants
// Array of image/video paths and their display duration.
const mediaList = [
    { path: 'images/worms-transparent.gif', durationMillis: 4410 },
    { path: 'images/big-buck-bunny_trailer.webm', durationMillis: 31000 },
    { path: 'images/worms.gif', durationMillis: 3290 },
];
// Set default media to the first entry in the list.
let defaultMedia = mediaList[0];

const DefaultMinSeconds = 30 * 60; // Minutes * 60 for easy reading.
const DefaultMaxSeconds = 90 * 60;

const streamerWormConfig = getStreamerWormConfig();

const tagName = getTagNameFromFile(defaultMedia.path);
const mediaDiv = document.getElementById("media-div");
let element = prepareElement(tagName);

mediaDiv.appendChild(element);
playMedia(element);

function playMedia(element) {
    let delay = streamerWormConfig.skipDelay
        ? 0
        : randomIntFromInterval(streamerWormConfig.minDelay, streamerWormConfig.maxDelay);
    
    // Display the image/video after the random delay expires.
    setTimeout(() => {
        if (tagName === 'img') {
            element.src = '';
            element.src = defaultMedia.path;
        }
        else {
            element.currentTime = 0;
            element.play();
        }
        element.style.visibility = 'visible';
        
        // Hide image/video after it plays for the desired duration, and requeue the image timer.
        setTimeout(() => {

            element.style.visibility = 'hidden';
            playMedia(element);
        }, defaultMedia.durationMillis);
        
    }, delay);
}

// Returns a random integer between min and max (inclusive).
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Check that provided string is a valid number and positive.
function isValidDelay(numberString) {
    return !isNaN(numberString) && !isNaN(parseFloat(numberString)) && parseFloat(numberString) > 0;
}

// Returns the value of a string as a boolean. Defaults to "false" if not a valid boolean.
function parseBool(boolString) {
    return boolString === 'true';
}

// Parse URL parameters from URL.
function getStreamerWormConfig() {
    let urlParams = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop || ''),
    });

    // todo: (param) Image display coordinates (where on the screen should it show up)
    let skipDelay = parseBool(urlParams.skipDelay);
    let minDelayMillis = (isValidDelay(urlParams.min) ? urlParams.min : DefaultMinSeconds) * 1000; 
    let maxDelayMillis = (isValidDelay(urlParams.max) ? urlParams.max : DefaultMaxSeconds) * 1000;
    let slideshow = parseBool(urlParams.slideshow);
    let shouldRandomize = parseBool(urlParams.randomize);

    // minDelayMillis must be less than maxDelayMillis.
    if (maxDelayMillis <= minDelayMillis)
    {
        minDelayMillis = DefaultMinSeconds;
        maxDelayMillis = DefaultMaxSeconds;
    }
    
    return {
        skipDelay: skipDelay,
        minDelay: minDelayMillis,
        maxDelay: maxDelayMillis,
        slideshow: slideshow,
        shouldRandomize: shouldRandomize,
    };
}

function prepareElement(tagName) {
    // img or video element based on tagName.
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

function configureImageElement(image) {
    // todo: Configure image
    return image;
}

function configureVideoElement(videoElement) {
    let videoSource = document.createElement('source');
    videoSource.src = defaultMedia.path;
    videoSource.type = 'video/webm';

    videoElement.autoplay = true;
    videoElement.appendChild(videoSource);

    return videoElement;
}

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
            tagName = '';
    }
    
    return tagName;
}