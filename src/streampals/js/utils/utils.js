﻿// Get media coordinate styles for a random screen quadrant
const getMediaCoordinateStyles = function (lastQuadrant, mediaHeight, mediaWidth) {
    let x;
    let y;
    let quadrantX;
    let quadrantY;
    let newQuadrant;

    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;
    let quadrantHeight = windowHeight * 0.5;
    let quadrantWidth = windowWidth * 0.5;

    // Pick random quadrant, different to the previous
    do {
        newQuadrant = Math.floor(Math.random() * 4);
    } while (newQuadrant === lastQuadrant);

    // Pick a random value for media x, ensuring the image remains on-screen
    do {
        quadrantX = Math.floor(Math.random() * quadrantWidth);
    } while (quadrantX + mediaWidth > quadrantWidth);

    // Pick a random value for media y, ensuring the image remains on-screen
    do {
        quadrantY = Math.floor(Math.random() * quadrantHeight);
    } while (quadrantY + mediaHeight > quadrantHeight);

    x = newQuadrant % 2 === 0 ? quadrantX : quadrantWidth + quadrantX;
    y = newQuadrant < 2 ? quadrantY : quadrantHeight + quadrantY;

    return {quadrant: newQuadrant, left: `${x}px`, top: `${y}px`};
}

// Returns a random integer between min and max (inclusive)
const randomIntFromInterval = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}


export default {
    getMediaCoordinateStyles: getMediaCoordinateStyles,
    randomIntFromInterval: randomIntFromInterval,
};
