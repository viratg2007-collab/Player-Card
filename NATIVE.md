# Native app (iOS / App Store) via Capacitor

Player Card is wrapped with [Capacitor](https://capacitorjs.com/) so the same
web app can ship to the App Store. This file is the runbook for building and
submitting the iOS app. None of this changes the web app — Capacitor just loads
the production web build (`dist/`) inside a native shell.

## What's already set up (in this repo)

- `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/cli`
  (pinned to **v7** — see the Node note below).
- `capacitor.config.json` — `appId`, `appName: "Player Card"`, `webDir: "dist"`.
- npm scripts: `cap:sync`, `ios:add`, `ios:open`.
- `@capacitor/assets` installed, with source art in `assets/` (`logo.png`,
  adaptive `icon-foreground.png` / `icon-background.png`, and `splash.png` /
  `splash-dark.png`), regenerable via `npm run gen:icons`. Turn it into the
  native icon set + launch screen with `npm run assets:generate` (scoped to
  iOS/Android — it does not touch the web manifest).
- The service worker is automatically skipped inside the native shell
  (`src/main.jsx`), and routing uses `HashRouter`, which works in the webview.

> The `ios/` Xcode project is **not** in the repo yet — it must be generated on
> a Mac with CocoaPods (see below). Once generated, commit the `ios/` folder;
> `.gitignore` already excludes `Pods/` and build output.

## Prerequisites (on your Mac)

1. **Xcode** (full app from the Mac App Store, not just Command Line Tools).
2. **CocoaPods**, which needs **Ruby ≥ 3.0**. The system Ruby (2.6) is too old —
   install a modern Ruby first, e.g. with Homebrew:
   ```bash
   brew install ruby cocoapods
   ```
   (or `brew install rbenv`, install Ruby 3.x, then `gem install cocoapods`).
3. An **Apple Developer Program** account ($99/yr) for App Store submission.

## First-time iOS setup

```bash
# 1. (optional) set your own bundle id — must be reverse-DNS you control and
#    match an App ID in your Apple Developer account
#    edit capacitor.config.json -> "appId": "com.yourname.playercard"

# 2. build the web app and create the native iOS project
npm run build
npm run ios:add          # npx cap add ios  (runs pod install)

# 3. generate the iOS icon set + launch screen from assets/
npm run assets:generate     # @capacitor/assets, scoped to iOS/Android

# 4. open in Xcode
npm run ios:open
```

## Each time the web app changes

```bash
npm run cap:sync         # = npm run build && cap sync  (copies dist/ into iOS)
```

## In Xcode (signing & submission)

1. Select the **App** target → **Signing & Capabilities** → pick your **Team**;
   confirm the **Bundle Identifier** matches your App ID.
2. Set **Version** (e.g. 1.0.0) and **Build** (e.g. 1).
3. Test on the Simulator and a real device.
4. **Product → Archive** → **Distribute App** → **App Store Connect** → upload.
5. In [App Store Connect](https://appstoreconnect.apple.com): create the app
   record (name, screenshots, privacy — note **all data is stored on-device**,
   no tracking), attach the build, and submit for review.

## Android (optional, later)

```bash
npm run build && npx cap add android && npx cap sync android
npx cap open android     # build/submit via Android Studio for Play Store
```

## Node version note

The CLI/runtime are pinned to **Capacitor 7** because this project's Node is
**20**, and **Capacitor 8 requires Node ≥ 22**. On a Mac with Node ≥ 22 you can
upgrade (`npm i @capacitor/core@8 @capacitor/ios@8 @capacitor/android@8 -E` and
`@capacitor/cli@8 -D`) for the latest platform support.
