# SFIS Scanner — Android (WebView wrapper)

An installable Android app that wraps the `../replica` HTML/React prototype in a
full-screen WebView. The prototype stays the **single source of truth** — this
project just bundles it into `app/src/main/assets/` and displays it, so editing
is still "edit the web files, rebuild."

- **No third-party dependencies** — pure framework `WebView`.
- **Fully offline** — React/Babel are vendored into the assets (no network at runtime).
- Babel compiles the `.jsx` at runtime; the WebView is configured to allow the
  `file://` asset reads that requires.

## Open in Android Studio

`File → Open…` → choose this `sfis-android` folder. Let it sync, pick the
**SFIS_Pixel** emulator (or any device), press **▶ Run**.

## Build / install from the terminal

```sh
cd sfis-android
./gradlew assembleDebug                 # → app/build/outputs/apk/debug/app-debug.apk

# install on a running emulator/phone:
$ANDROID_HOME/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Or do it all in one step (sync from ../replica, build, install, launch):

```sh
./sync-and-build.sh install
```

## After I edit the prototype

The web files live in `../replica`. To pull edits into the app and rebuild:

```sh
./sync-and-build.sh install
```

## Build config (all already present on this machine)

| | |
|---|---|
| Gradle | 8.0.1 (cached) |
| Android Gradle Plugin | 8.0.2 |
| JDK | 17 (Temurin) |
| compileSdk / targetSdk | 33 |
| minSdk | 24 |
| build-tools | 33.0.0 |
| applicationId | `com.sfis.scanner` |
