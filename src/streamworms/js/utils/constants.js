// streamworms constants.
const DefaultMinMinutes = 30;
const DefaultMaxMinutes = 90;
const DefaultMediaDurationSeconds = 5;

const DefaultMaxHeight = "25"; // Percentage value
const DefaultMaxWidth = "25"; // Percentage value

// Warning messages
const ZeroMediaDurationWarning = "Unable to calculate media duration for the requested media. Please set the media duration (in seconds) via the `mediaDuration` parameter. Parameter supports decimal values.";

// Error messages
const ContentTypeNotFoundError = "Unable to determine content type of from media URL. Defaulting to `img` tag";
const ContentTypeNotSupportedError = "Content type not yet supported. Defaulting to `img` tag\". Content type found: `{0}`";
const FetchImageError = "Error fetching image from URL '{0}'. Error status: '{1}'";

export default Object.freeze({
    DefaultMinMinutes: DefaultMinMinutes,
    DefaultMaxMinutes: DefaultMaxMinutes,
    DefaultMaxHeight: DefaultMaxHeight,
    DefaultMaxWidth: DefaultMaxWidth,
    DefaultMediaDurationSeconds: DefaultMediaDurationSeconds,
    ZeroMediaDurationWarning: ZeroMediaDurationWarning,
    ContentTypeNotFoundError: ContentTypeNotFoundError,
    ContentTypeNotSupportedError: ContentTypeNotSupportedError,
    FetchImageError: FetchImageError,
});