# KurdStay on Android

The wrapper is **Capacitor**. This repository includes a working Capacitor 8 Android project and the same `dist/` web app used by the website.

## Run locally

Requirements: Node.js 22+, Java 21, Android Studio and Android SDK 36. Use a current Android System WebView on the test device.

```sh
npm ci
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. The app is also compatible with static hosting at a subdirectory such as `/properties/`: asset references are relative, and routes use hashes.

## Build Android

```sh
npm run android:sync
npm run android:open
```

Select an emulator or connected device in Android Studio and run the app. Alternatively, use `npm run android:run`.

To build a debug APK directly:

```sh
# macOS/Linux
cd android
./gradlew assembleDebug

# Windows, from the repository root
.\android\gradlew.bat -p android assembleDebug
```

The output is `android/app/build/outputs/apk/debug/app-debug.apk`. Set `ANDROID_HOME` to your SDK directory (or let Android Studio create an ignored `android/local.properties`). Debug builds are for testing, not Google Play distribution. Configure release signing, the final application ID and versioning in the existing KurdStay release process; no signing keys are committed.

The GitHub Actions workflow also runs the checks and produces a debug APK artifact.

## Integrate into the existing KurdStay app

`com.kurdstay.properties` is a separate **development wrapper** so this project can be built and tested on its own. It is not intended to replace the existing KurdStay application ID or signing identity.

For the main KurdStay application:

1. Put these web assets under a route/directory such as `properties/` in the main app's build output, or port the UI into its existing router. Keep the `index.html` and relative assets together. A full-page same-origin navigation to `/properties/index.html#erbil` works with the standalone hash router; an iframe is unnecessary.
2. Keep the main app's existing Capacitor configuration, application ID, signing keys and Android project. Do not nest this repository's Android project inside that Android project.
3. Align Capacitor/plugin versions with the main application. This project uses Capacitor 8, `@capacitor/app` and `@capacitor/browser`. Install these plugins in the main app, compile the native bridge with the main build, then run its `cap sync android`.
4. Integrate the handlers in `src/native.js` into the main app's native lifecycle. Register one Android back-button handler: close a property dialog first, return from map to list, return to property discovery, then hand control back to the main app's router. The development wrapper minimizes at its root; the integrated main app should decide what to do there.
5. Keep `viewport-fit=cover` and the safe-area styling in `mobile.css`. The Android activity enables edge-to-edge; Capacitor SystemBars supplies safe-area variables, including on older WebViews. Avoid adding another layer of system-bar padding in the parent shell.
6. Use the main app's shared account/storage services when implementing shared favorites or seller publishing. Current favorites and saved media drafts are browser/device-local. They do not sync between the website and installed app or automatically use KurdStay login.

No production `server.url` or broad `allowNavigation` is configured. The APK bundles the web assets. Original advertisements open in Android browser tabs rather than replacing the app's WebView.

## Mobile behaviour and limits

- Bottom navigation for discovery, map, saved listings, creating a draft and source information.
- Twelve cards per page on phones, 24 on wider screens; map grouping still includes all matching listings.
- Touch targets, safe-area spacing, accessible page zoom, readable form controls, full-width detail sheets, and a single-column media form.
- Android Back closes a detail/form, changes map to list, then returns to discovery before minimizing the standalone app.
- Photos/video use the WebView's system file picker. Draft blobs stay in IndexedDB. YouTube/Vimeo and original-ad links remain source-controlled.
- The bundled listing snapshot works without downloading the dataset. Maps, remote advertiser photos, fonts and embedded videos require an internet connection. No offline map cache is provided.
- Street-map pins remain unverified source locations. Parcel boundaries, shared seller publication, live pricing and inventory refresh are not implemented.

Before a store release, test on real phones: keyboard and rotation, system Back/gestures, notches and gesture bars, Android file selection, large video drafts, external links, offline transitions, and actual video playback. Automated DOM checks and a successful APK build do not replace device testing.

Official references: [Capacitor installation](https://capacitorjs.com/docs/getting-started), [Android](https://capacitorjs.com/docs/android), [App/back button](https://capacitorjs.com/docs/apis/app), [SystemBars and safe areas](https://capacitorjs.com/docs/apis/system-bars).
