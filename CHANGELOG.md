# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Note: All changes prior to v1.0.0 should be considered potentially breaking.

## [Unreleased Changes]

### Added

- Max media dimensions can be set via the `maxHeight` and `maxWidth` query parameters.
   - Media will be shrunk to fit the smallest of the two values.

### Changed

- `max` and `min` delay can now be set to the same value.
- Media position is now randomized between screen corners each time it appears.

## [0.2.0] - 2022-12-23

### Added

- Introduced `webpack` to handle JS file bundling.
- CHANGELOG introduced.

### Changed

- `max` and `min` parameter units changes to be in Minutes (previously Seconds)

## [0.1.0] - 2022-12-22

### Added

- Initial alpha version release.
- Ability to display images, animated GIFs, and WebM files.
- README introduced.

### Known Issues & Limitations

- Max media height and width restricted to 25% of screen size.
- Media is anchored to top-left corner of screen.