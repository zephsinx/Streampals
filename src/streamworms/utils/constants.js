// streamworms constants.
exports.DefaultMinMinutes = 30;
exports.DefaultMaxMinutes = 90;

exports.DefaultMaxHeight = "25"; // Percentage value
exports.DefaultMaxWidth = "25"; // Percentage value

// Warning messages
exports.ZeroMediaDurationWarning = "Unable to calculate media duration for the requested media. Please set the media duration (in seconds) via the `mediaDuration` parameter. Parameter supports decimal values.";

// Error messages
exports.ContentTypeNotFoundError = "Unable to determine content type of from media URL. Defaulting to `img` tag";
exports.ContentTypeNotSupportedError = "Content type not yet supported. Defaulting to `img` tag\". Content type found: `{0}`";
exports.FetchImageError = "Error fetching image from URL '{0}'. Error status: '{1}'";
