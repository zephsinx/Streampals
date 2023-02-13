/*
1. There are 4 quadrants (0-3)
   - Quadrants are numbered left to right, top to bottom, as such:
       | 0 | 1 |
       | 2 | 3 |
   - Evens on the left, odds on the right
2. Each quadrant is window.innerWidth * 0.25 in width and window.innerHeight * 0.25 in height
3. Pick a quadrant (0-3) via random int
   - Should be different to the previous quadrant
4. Generate random x and y coordinates within the quadrant size
    - If odd quadrant, recalculate quadrant x if quadrant x + mediaWidth > quadrantWidth
    - If quadrant > 1, recalculate quadrant y if quadrant y + mediaHeight > quadrantHeight
5. Set the media x and y coordinates
   - If odd quadrant, x = (window.innerWidth * 0.5) + quadrant x
   - If even quadrant, x = quadrant x
   - If quadrant > 1, y = window.innerHeight * 0.5 + quadrant y
   - If quadrant < 1, y = quadrant y
*/
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
