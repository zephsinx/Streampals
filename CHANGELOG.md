# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Note: All changes prior to v1.0.0 should be considered potentially breaking.

## [0.5.0] - 2022-12-29

### Added

- Add `mediaDuration` query parameter to override media duration calculation.
  - Helpful for times when the built-in media calculation does not work.
- App throws error when media duration is `0`. Can be overridden by passing `mediaDuration`.

### Changed

- Change Dockerfile to use `node:18` image.

### Remove

- Remove 100ms default when calculated or provided `mediaDuration` is `0`.

## [0.4.0] - 2022-12-28

### Added

- Default media set to `default-media.gif` in the `src/media` folder. Replacing this GIF will change the displayed GIF loaded by default.
- Dockerfile for running in docker container.

### Changed

- Error now thrown when image can't be fetched.
- Media no longer copied to `dist` folder. Now pulled straight from `src/media`.
- Media request path changed from `http://[URL]/media/<media-name>` to simply `http://[URL]/<media-name>`.

### Removed

- Remove `mediaList.js`. May be re-added in the future.

## [0.3.0] - 2022-12-24

### Added

- Max media dimensions can be set via the `maxHeight` and `maxWidth` query parameters.
   - Media will be shrunk to fit the smallest of the two values.
- LICENSE file added.

### Changed

- `max` and `min` delay can now be set to the same value.
- Media position is now randomized between screen corners each time it appears.
- Removed additional unused media
- Populated README file

### Performance

- JS bundles optimized for long-term caching via webpack `contenthash`.

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