# Third-party notices

## Three.js 0.170.0

https://threejs.org/ — https://github.com/mrdoob/three.js

The MIT License

Copyright © 2010–2024 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Fonts

Barlow Condensed by Jeremy Tribby and DM Sans by Colophon Foundry are optionally requested from Google Fonts under the SIL Open Font License. System fonts are used if the request fails.

## meSpeak.js 2.0.7 / eSpeak

Copyright 2011–2020 Norbert Landsteiner, mass:werk, and the eSpeak / speak.js contributors. Distributed under GNU GPL version 3. Official distribution: https://www.masswerk.at/mespeak/mespeak.zip ; project and documentation: https://www.masswerk.at/mespeak/ ; upstream eSpeak port: https://github.com/kripken/speak.js .

Unmodified runtime, German language data, license and full JavaScript sources are included under `dist/assets/mespeak/`. See `dist/assets/mespeak/License.txt`. The project's own speech effects, game simulation and models are in the source repository alongside these components.

## Bundled neural dialogue recordings

The WAV files in dist/assets/voices/ are generated locally using Piper 2023.11.14-2 (MIT, https://github.com/rhasspy/piper/releases/tag/2023.11.14-2). No Piper runtime or voice model is distributed with the game. The reproducible generator is scripts/bake-voices.mjs.

German Thorsten emotional model, v1.0.0 (CC0 dataset by Thorsten Müller): https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/de/de_DE/thorsten_emotional/medium/MODEL_CARD . Model: https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten_emotional/medium/de_DE-thorsten_emotional-medium.onnx ; append .json for configuration. Source dataset: https://github.com/thorstenMueller/Thorsten-Voice .

German Kerstin model, v1.0.0 (CC0 dataset): https://huggingface.co/rhasspy/piper-voices/blob/v1.0.0/de/de_DE/kerstin/low/MODEL_CARD . Model: https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx ; append .json for configuration. Source dataset: https://github.com/rhasspy/dataset-voice-kerstin .

The three radio compositions, all instrument synthesis, gun effects, helmet drips and crash animations are original code in this repository. No third-party music or game audio is included.

## Android host

The Android app uses AndroidX WebKit 1.14.0 and its AndroidX dependencies, Copyright The Android Open Source Project, under Apache License 2.0. See android/ANDROIDX-LICENSE.txt. Android system WebView is provided by the device and is not bundled. The app does not include the Spotify SDK.

## Local multiplayer server

The optional Node.js test server uses ws 8.23.0 (MIT), copyright the ws contributors. See multiplayer/WS-LICENSE.txt and https://github.com/websockets/ws . It is not bundled in the website or Android APK. The side-view track, drawings and motorcycle physics are original game code; no Mad Skills Motocross assets or code are used.


## Windows runtime
The portable Windows application bundles Electron 45.5.0 (MIT), Chromium and Node.js. LICENSE.electron.txt and LICENSES.chromium.html are included beside the executable. Source: https://github.com/electron/electron/releases/tag/v45.5.0 . Electron is not included in the browser or Android build.
