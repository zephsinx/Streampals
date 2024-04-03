# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Note: All changes prior to v1.0.0 should be considered potentially breaking.

## [0.8.0] - Unreleased

### Changed

- Streampals can now run in any environment, without the need of Node.js.
  - i.e. `dist` folder is now self-contained, having everything needed to run the app.- Default media file is now pulled from [media.json](./dist/js/resources/media.json) file, which can be modified as
    needed.
- `dist` files no longer use Pug templates, opting for compiled HTML file.

## [0.7.1] - 2023-01-18

### Changed

- Show media once on the top left of the screen on page/source load to assist in ensuring application is working as
  expected.

### Fixed

- Worms no longer show outside of screen bounds on their first appearance.

## [0.7.0] - 2023-01-13

### Changed

- Media now appears randomly around the screen instead of only in the four corners.

## [0.6.1] - 2023-01-07

## Changed

- Renamed StreamerWorm to Streampals.

## [0.6.0] - 2023-01-01

### Changed

- Media tag now determined from media `Content-Type` header, rather than file extension.
- Updated [some dependencies](package.json).

### Removed

- Removed `.env` file.
- [Unnecessary files](.dockerignore) from docker image.

## [0.5.1] - 2022-12-29

### Added

- Now able to change default file name from `.env` file.

## [0.5.0] - 2022-12-29

### Added

- Add `mediaDuration` query parameter to override media duration calculation.
  - Helpful for times when the built-in media calculation does not work.
- App throws error when media duration is `0`. Can be overridden by passing `mediaDuration`.

### Changed

- Change Dockerfile to use `node:18` image.

### Removed

- Remove 100ms default when calculated or provided `mediaDuration` is `0`.

## [0.4.0] - 2022-12-28

### Added

- Default media set to `default-media.gif` in the `src/media` folder. Replacing this GIF will change the displayed GIF
  loaded by default.
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