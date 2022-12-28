// StreamerWorm constants.
exports.DefaultMinMinutes = 30;
exports.DefaultMaxMinutes = 90;

exports.DefaultMaxHeight = "25"; // Percentage value
exports.DefaultMaxWidth = "25"; // Percentage value

exports.DefaultMediaPath = "default-media.gif";

// Error messages
exports.ExtensionNotFoundError = "Unable to determine file extension from media URL. Defaulting to `img` tag";
exports.ExtensionNotSupportedError = "File extension not yet supported. Defaulting to `img` tag\". Extension found: `{0}`";
exports.FetchImageError = "Error fetching image from URL '{0}'. Error status: '{1}'";
