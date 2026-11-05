"use strict";

import constants from "./utils/constants.js";
import utils from "./utils/utils.js";
// Global defaults
const DefaultMediaDurationMillis = constants.DefaultMediaDurationSeconds * 1000;
const DefaultMinMillis = constants.DefaultMinMinutes * 60 * 1000;
const DefaultMaxMillis = constants.DefaultMaxMinutes * 60 * 1000;
const MediaDir = "media/";
const DefaultMediaUrl = MediaDir + "worms.gif";

// Div containing the media to display
const mediaDiv = document.getElementById("media-div");

// Global variables

let tagName;
let element;
let config;
let first = true;

// Shuffle and cycle variables for media selection
let shuffledMediaPaths = [];
let currentMediaIndex = 0;

// Duration cache for individual media files
let mediaDurationCache = {};

// Get config settings
getStreampalsConfig()
  .then((configVal) => {
    config = configVal;
    tagName = getTagNameFromFile(config.contentType);
    element = prepareElement(tagName, config);
  })
  .then(() => {
    mediaDiv.appendChild(element);
    element.addEventListener(tagName === "video" ? "loadeddata" : "load", () => startLoop(element), { once: true });
    element.querySelectorAll("source").forEach((source) => source.addEventListener("error", onMediaError));
    element.addEventListener("error", (event) => {
      onMediaError(event);
      startLoop(element);
    });
  })
  .catch(showError);

let loopStarted = false;

// Start the loop once
function startLoop(element) {
  if (loopStarted) return;
  loopStarted = true;
  playMediaLoop(element);
}

// Prevent unloadable media file from stopping the rotation
function onMediaError(event) {
  console.error(`Unable to load media: ${event.target.src || event.target.currentSrc}`, event);
}

// Show startup errors in the browser source, since it has no visible console
function showError(error) {
  console.error(error);
  mediaDiv.textContent = error instanceof Error ? error.message : "Unable to load the media. Check the mediaUrl parameter.";
  mediaDiv.style.visibility = "visible";
}

//#region Media Methods

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get cached media duration, calculating and caching if not available
async function getCachedMediaDuration(mediaPath) {
  // src is cache-busted with ?t=, so the cache key ignores the query string
  const cacheKey = mediaPath.split("?")[0];
  if (mediaDurationCache[cacheKey] !== undefined) {
    return mediaDurationCache[cacheKey];
  }

  const fileName = cacheKey.split("/").pop();
  console.log(`Preloading duration for: ${fileName}`);

  try {
    const mediaInfo = await fetchMediaInfo(mediaPath);
    if (!mediaInfo.duration) console.warn(constants.ZeroMediaDurationWarning);
    const duration = mediaInfo.duration || DefaultMediaDurationMillis;
    mediaDurationCache[cacheKey] = duration;
    console.log(`Duration cached: ${fileName} = ${duration}ms`);
    return duration;
  } catch (error) {
    console.log(`Using default duration for ${fileName} (${DefaultMediaDurationMillis}ms)`);
    mediaDurationCache[cacheKey] = DefaultMediaDurationMillis;
    return DefaultMediaDurationMillis;
  }
}

// Get display duration for the current media: user override, then the video's own length, then the measured file
function getPlayDuration() {
  if (config.mediaDuration)
    return Promise.resolve(config.mediaDuration);
  if (tagName === "video")
    return Promise.resolve(element.duration * 1000);
  return getCachedMediaDuration(element.src);
}

// Plays media after a random delay, then hides the media after durationMillis expires, and requeues the media timer
function playMediaLoop(element) {
  let delay = utils.randomIntFromInterval(config.minDelay, config.maxDelay);
  if (first) {
    setPosition(element);
    delay = 0;
    first = false;
  }
  // Display the image after the random delay expires
  setTimeout(() => {
    // Reset image source to replay in the case of a GIF
    if (tagName === "img") {
      setMediaUrl(element, config);
    }
    // Restart video and play in the case of a WebM
    else {
      element.currentTime = 0;
      element.play().catch((error) => console.warn(error));
    }
    // Make media visible
    mediaDiv.style.visibility = "visible";

    // Get duration for current media and hide after it plays
    getPlayDuration().then((measured) => {
      const duration = Number.isFinite(measured) && measured > 0 ? measured : DefaultMediaDurationMillis;
      const fileName = (element.src || element.currentSrc || tagName).split("/").pop();
      console.log(`Media spawned: ${fileName} (duration: ${duration}ms)`);

      setTimeout(() => {
        mediaDiv.style.visibility = "hidden";
        setPosition(element);
        playMediaLoop(element);
      }, duration);
    });
  }, delay);
}

let lastQuadrant;

// Set position of media element on page
function setPosition(element) {
  // Use the rendered size: <video> has no intrinsic width/height attributes
  const { height, width } = element.getBoundingClientRect();
  let coordinates = utils.getMediaCoordinateStyles(lastQuadrant, height, width);
  lastQuadrant = coordinates.quadrant;
  element.style.left = coordinates.left;
  element.style.top = coordinates.top;
}

// Build a cache busted URL
function withCacheBuster(url) {
  return url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
}

// Set the media source, from the shuffled list or the single mediaUrl
function setMediaUrl(element, config) {
  element.src = "";
  if (config.randomImage) {
    // Initialize shuffled array if empty or if we've cycled through all items
    if (
      shuffledMediaPaths.length === 0 ||
      currentMediaIndex >= shuffledMediaPaths.length
    ) {
      shuffledMediaPaths = shuffleArray(config.mediaPaths);
      currentMediaIndex = 0;
    }

    element.src = withCacheBuster(shuffledMediaPaths[currentMediaIndex]);
    currentMediaIndex++;
  } else {
    element.src = withCacheBuster(config.mediaUrl);
  }
}

//#endregion

//#region Streampals configuration methods

// Get Streampals config
async function getStreampalsConfig() {
  const urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
  return utils.validateConfig(await createConfig(urlParams));
}

async function createConfig(urlParams) {
  const skipDelay = urlParams.skipDelay === "true";
  const maxDelayMillis = utils.getDelayMillis(skipDelay, urlParams.max, DefaultMaxMillis);
  const minDelayMillis = utils.getDelayMillis(skipDelay, urlParams.min, DefaultMinMillis);
  const maxHeight = utils.isValidNumericValue(urlParams.maxHeight)
    ? urlParams.maxHeight
    : constants.DefaultMaxHeight;
  const maxWidth = utils.isValidNumericValue(urlParams.maxWidth)
    ? urlParams.maxWidth
    : constants.DefaultMaxWidth;
  let randomImage = urlParams.randomImage === undefined ? true : urlParams.randomImage === "true";

  const mediaFile = await getMediaFile(urlParams.mediaUrl);
  const mediaPaths = mediaFile.mediaPaths || [];
  // Only a media list can be shuffled. A single custom mediaUrl always plays itself.
  randomImage = randomImage && mediaPaths.length > 0;

  const mediaPath = getMediaUrl(mediaFile.mediaPath, mediaPaths, randomImage);

  // Overrides the measured duration for every media file, in milliseconds
  const mediaDuration = utils.isValidNumericValue(urlParams.mediaDuration)
    ? parseFloat(urlParams.mediaDuration) * 1000
    : undefined;

  // Get content type from file extension
  let extension = mediaPath.split(".").pop().split("?")[0];
  let contentType = getContentTypeFromFileExtension(extension);

  if (contentType === "") {
    try {
      contentType = (await fetchMediaInfo(mediaPath)).contentType;
    } catch (error) {
      console.log(`Unable to determine content type for ${mediaPath}`);
    }
  }

  return {
    maxDelay: maxDelayMillis,
    minDelay: minDelayMillis,
    maxHeight: maxHeight,
    maxWidth: maxWidth,
    mediaUrl: mediaPath,
    mediaPaths: mediaPaths,
    mediaDuration: mediaDuration,
    contentType: contentType,
    randomImage: randomImage,
  };
}

async function getMediaFile(urlParamMediaUrl) {
  if (urlParamMediaUrl) {
    return { mediaPath: urlParamMediaUrl, mediaPaths: [] };
  }

  // Fetch media file
  let mediaFile = await fetch(MediaDir + "media.json")
    .then((res) => {
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

// Get media URL
function getMediaUrl(mediaPath, mediaPaths, randomImage) {
  if (mediaPath) {
    return mediaPath;
  } else if (mediaPaths.length > 0) {
    if (randomImage) {
      // Initialize shuffled array for initial selection
      if (shuffledMediaPaths.length === 0) {
        shuffledMediaPaths = shuffleArray(mediaPaths);
        currentMediaIndex = 0;
      }
      return shuffledMediaPaths[currentMediaIndex];
    }
    return mediaPaths[0];
  }
  return DefaultMediaUrl;
}

// Fetch the file to read its content type and duration
async function fetchMediaInfo(mediaUrl) {
  let contentType;
  let duration = await fetch(mediaUrl)
    .then((res) => {
      if (res.ok) {
        {
          contentType = res.headers.get("Content-Type");
          return Promise.resolve(res);
        }
      }
      return Promise.reject(res);
    })
    .then((res) => res.arrayBuffer())
    .then((ab) => utils.calculateMediaDuration(new Uint8Array(ab)))
    .catch((err) => {
      throw new Error(
        constants.FetchImageError.replace("{0}", mediaUrl).replace(
          "{1}",
          `${err.status} - ${err.statusText}`
        )
      );
    });

  return { contentType: contentType, duration: duration };
}

//#endregion

//#region Element Configuration

// Configure element to display based on tagName
function prepareElement(tagName, config) {
  // Create img or video element based on tagName
  let mediaElement = document.createElement(tagName);
  mediaElement.id = "rendered-media";
  mediaElement.style.objectFit = "contain";
  mediaElement.style.maxHeight = config.maxHeight + "%";
  mediaElement.style.maxWidth = config.maxWidth + "%";
  mediaElement.style.position = "absolute";
  mediaElement.style.top = "0";
  mediaElement.style.left = "0";
  mediaElement.alt = "Just a lil' stream pal";

  switch (tagName) {
    case "img":
      setMediaUrl(mediaElement, config);
      return mediaElement;
    case "video":
      return configureVideoElement(mediaElement, config);
    default:
      throw new Error(`Tag name ${tagName} not recognized`);
  }
}

// Map file extension to content type
function getContentTypeFromFileExtension(fileExtension) {
  switch (fileExtension) {
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "webm":
      return "video/webm";
    default:
      return "";
  }
}

// Get the appropriate element tag name from the media file extension
function getTagNameFromFile(contentType) {
  if (contentType && contentType.startsWith("image/")) return "img";
  if (contentType && contentType.startsWith("video/")) return "video";

  if (!contentType) console.warn(constants.ContentTypeNotFoundError);
  else console.warn(constants.ContentTypeNotSupportedError.replace("{0}", contentType));

  return "img";
}

// Set Video properties
function configureVideoElement(videoElement, config) {
  let videoSource = document.createElement("source");
  videoSource.src = config.mediaUrl;
  videoSource.type = config.contentType;

  // Chrome only allows autoplay for muted video
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.appendChild(videoSource);

  return videoElement;
}

//#endregion
