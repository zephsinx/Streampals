import constants from "./constants.js";

// Get media coordinate styles for a random screen quadrant
const getMediaCoordinateStyles = function (lastQuadrant, mediaHeight, mediaWidth) {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const quadrantHeight = windowHeight * 0.5;
    const quadrantWidth = windowWidth * 0.5;

    // Pick a quadrant different from the previous one
    const newQuadrant = Number.isInteger(lastQuadrant)
        ? (lastQuadrant + 1 + Math.floor(Math.random() * 3)) % 4
        : Math.floor(Math.random() * 4);

    // Random offset, clamped so the media always stays inside its quadrant
    const quadrantX = Math.floor(Math.random() * Math.max(0, quadrantWidth - mediaWidth));
    const quadrantY = Math.floor(Math.random() * Math.max(0, quadrantHeight - mediaHeight));

    const x = newQuadrant % 2 === 0 ? quadrantX : quadrantWidth + quadrantX;
    const y = newQuadrant < 2 ? quadrantY : quadrantHeight + quadrantY;

    return { quadrant: newQuadrant, left: `${x}px`, top: `${y}px` };
}

// Returns a random integer between min and max (inclusive)
const randomIntFromInterval = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Total animation length of a GIF in milliseconds, from its frame delays
function calculateMediaDuration(uint8) {
    let duration = 0;
    for (let i = 0; i < uint8.length; i++) {
        if (uint8[i] === 0x21 && uint8[i + 1] === 0xf9 && uint8[i + 2] === 0x04 && uint8[i + 7] === 0x00) {
            const delay = (uint8[i + 5] << 8) | uint8[i + 4];
            duration += delay < 2 ? 10 : delay;
        }
    }
    return duration * 10;
}

// Check that the value is a number greater than zero
function isValidNumericValue(numberString) {
    return (
        !isNaN(numberString) &&
        !isNaN(parseFloat(numberString)) &&
        parseFloat(numberString) > 0
    );
}

// Validate and calculate delay in milliseconds from params
function getDelayMillis(skipDelay, delayMinutes, defaultDelay) {
    if (skipDelay) return 0;

    return isValidNumericValue(delayMinutes)
        ? delayMinutes * 60 * 1000
        : defaultDelay;
}

// Validate and update config if invalid
function validateConfig(config) {
    // minDelay must be less than or equal to maxDelay, else use defaults
    if (config.maxDelay < config.minDelay) {
        config.maxDelay = constants.DefaultMaxMinutes * 60 * 1000;
        config.minDelay = constants.DefaultMinMinutes * 60 * 1000;
    }

    return config;
}

export default {
    getMediaCoordinateStyles: getMediaCoordinateStyles,
    randomIntFromInterval: randomIntFromInterval,
    calculateMediaDuration: calculateMediaDuration,
    isValidNumericValue: isValidNumericValue,
    getDelayMillis: getDelayMillis,
    validateConfig: validateConfig,
};
