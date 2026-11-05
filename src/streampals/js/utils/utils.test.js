import test from "node:test";
import assert from "node:assert/strict";
import utils from "./utils.js";

// Graphic control extension with the given frame delay (hundredths of a second)
const gifFrame = (delay) => [0x21, 0xf9, 0x04, 0x00, delay & 0xff, delay >> 8, 0x00, 0x00];

test("calculateMediaDuration sums GIF frame delays", () => {
    assert.equal(utils.calculateMediaDuration(gifFrame(0x0a)), 100);
    assert.equal(utils.calculateMediaDuration([...gifFrame(0x0a), ...gifFrame(0x0a)]), 200);
});

test("calculateMediaDuration treats delays below two hundredths as ten", () => {
    assert.equal(utils.calculateMediaDuration(gifFrame(0)), 100);
    assert.equal(utils.calculateMediaDuration(gifFrame(1)), 100);
});

test("calculateMediaDuration returns zero for non-GIF data", () => {
    assert.equal(utils.calculateMediaDuration([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 0);
});

test("isValidNumericValue accepts only finite positive numbers", () => {
    assert.equal(utils.isValidNumericValue("2.75"), true);
    assert.equal(utils.isValidNumericValue("0"), false);
    assert.equal(utils.isValidNumericValue("-1"), false);
    assert.equal(utils.isValidNumericValue(""), false);
    assert.equal(utils.isValidNumericValue(undefined), false);
    assert.equal(utils.isValidNumericValue(null), false);
});

test("getDelayMillis honours skipDelay, params and defaults", () => {
    assert.equal(utils.getDelayMillis(true, "5", 1000), 0);
    assert.equal(utils.getDelayMillis(false, "2", 1000), 120000);
    assert.equal(utils.getDelayMillis(false, undefined, 1000), 1000);
});

test("validateConfig restores the default range when min is above max", () => {
    const config = { minDelay: 120 * 60 * 1000, maxDelay: 10 * 60 * 1000 };
    utils.validateConfig(config);
    assert.equal(config.minDelay, 30 * 60 * 1000);
    assert.equal(config.maxDelay, 90 * 60 * 1000);
});

test("getMediaCoordinateStyles terminates when media exceeds the quadrant", { timeout: 1000 }, () => {
    const originalWindow = globalThis.window;
    globalThis.window = { innerWidth: 1920, innerHeight: 1080 };

    try {
        const styles = utils.getMediaCoordinateStyles(undefined, 1200, 1200);
        assert.match(styles.left, /^\d+px$/);
        assert.match(styles.top, /^\d+px$/);
    } finally {
        if (originalWindow === undefined) {
            delete globalThis.window;
        } else {
            globalThis.window = originalWindow;
        }
    }
});
