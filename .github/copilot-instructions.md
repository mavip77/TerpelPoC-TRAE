<!-- .github/copilot-instructions.md - guidance for AI coding agents in this repo -->
# Copilot instructions (project-specific)

This document gives concise, actionable guidance for an AI coding assistant working in this React Native TypeScript repository.

- Project type: React Native (TypeScript) app. Root entry points: `index.js`, `App.tsx`.
- Source: `src/` (components, screens). Screens live under `src/screens` (e.g. `HomeScreen.tsx`).
- Tests: unit/UI tests in `__tests__/` as `*.test.tsx` (Jest + @testing-library/react-native). E2E tests live in `tests/e2e/` as `*.android.spec.js` and `*.ios.spec.js` (WebdriverIO + Appium + Mocha).

Quick commands (from repo root):

 - Start Metro: `npm start` (or `yarn start`).
 - Run on Android emulator/device: `npm run android`.
 - Run on iOS simulator: `npm run ios`.
 - Run unit tests: `npm test` (Jest).
 - Lint: `npm run lint`.
 - E2E, Android: `npm run e2e:android` (uses `wdio.android.conf.js`).
 - E2E, iOS: `npm run e2e:ios` (uses `wdio.ios.conf.js`).
 - Generate E2E report (Android): `npm run e2e:android:report` (runs WDIO then `scripts/generate-e2e-report-android.js`).

E2E environment & patterns:

 - Capabilities: `capabilities.json` provides default `appium:app`, `deviceName`, `udid` for Android/iOS. Override with env vars:
   - `APPIUM_HOST`, `APPIUM_PORT`, `APPIUM_BASE_PATH`
   - `APPIUM_APP_ANDROID`, `APPIUM_APP_IOS`
   - `ANDROID_DEVICE_NAME`, `ANDROID_UDID`, `IOS_DEVICE_NAME`, `IOS_UDID`
   - `RUN_TS` to pin report folder names (WDIO configs use it).
 - Specs: `wdio.android.conf.js` -> `./tests/e2e/**/*.android.spec.js`; `wdio.ios.conf.js` -> `./tests/e2e/**/*.ios.spec.js`.
 - Allure reports are written to `reports/allure/<platform>-<RUN_TS>`; screenshots and videos are captured into `reports/screenshots` and `reports/videos` during `afterTest` hooks.
 - The repo includes report aggregation scripts in `scripts/` (e.g. `generate-e2e-report-android.js`).

Code & style guidance (concrete, repo-specific):

 - Keep TypeScript types intact. New code should use `tsx`/`ts` and match patterns in `src/`.
 - Components are functional React components; prefer hooks over class components.
 - Navigation uses `@react-navigation/native` and `@react-navigation/native-stack` — follow existing stack/screen registration in `src/navigation` or `App.tsx`.
 - UI tests use `@testing-library/react-native`. Use `render()` and `fireEvent` patterns like existing tests in `__tests__/`.
 - E2E tests use WebdriverIO globals (`driver`, `browser`) and Mocha `describe/it` flows — follow existing spec files under `tests/e2e/` for timeouts and start/stop semantics.

Build and native notes:

 - Android debug APK path: `android/app/build/outputs/apk/debug/app-debug.apk` (also set via `capabilities.json`). Building: `npm run build:android:debug`.
 - iOS simulator app path used in capabilities: `ios/build/Build/Products/Debug-iphonesimulator/TerpelPoC.app`. Building: `npm run build:ios:debug`.
 - Avoid changing native Gradle/Xcode settings unless the change is necessary for the JS-level feature or fix.

Where to look first (examples):

 - App entry: `App.tsx`, `index.js` — quick place to understand navigation and global providers.
 - Screens & components: `src/screens/*`, `src/components/*`.
 - Unit tests: `__tests__/*.test.tsx` for examples of test patterns and fixtures.
 - E2E: `tests/e2e/*.android.spec.js` and `tests/e2e/*.ios.spec.js` for device flows and hooks (see `wdio.*.conf.js`).

Developer environment hints:

 - Node requirement: `node >= 18` (see `package.json` engines).
 - If modifying native builds, run the respective build scripts then point `capabilities.json` or env vars at the produced binary.
 - Use `RUN_TS` env var to produce deterministic report folder names when generating or inspecting E2E artifacts.

When editing code:

 - Run `npm test` and `npm run lint` locally before opening PRs.
 - For UI changes, update or add tests in `__tests__/` using existing testing patterns.
 - For E2E changes, add/modify specs under `tests/e2e/` and validate with `npm run e2e:android` or `npm run e2e:ios` (Appium must be running or available at configured host).

Do not guess undocumented behavior — prefer reading these files first: `App.tsx`, `wdio.android.conf.js`, `wdio.ios.conf.js`, `capabilities.json`, `package.json`, and `scripts/generate-e2e-report-*.js`.

If anything in this file looks incomplete or you need additional CI/secret-aware instructions (e.g., provisioning Appium server or device farm credentials), ask the repo owner for the missing environment details.
