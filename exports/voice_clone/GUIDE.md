# Clone your voice-over voice in VoiceStudio: step by step

VoiceStudio runs on your own computer, not on your phone. It's free and open source (AGPL-3.0). Its default engine, OmniVoice, was trained on Hindi too, so it can speak in your narration style.

## What you need

- A Windows 10/11 PC, or a Mac with an Apple chip (M1, M2, M3, M4). An Intel Mac can't run it on its own.
- About 10 GB of free space on the computer.
- An internet connection for the first start. The app downloads its own parts.
- These 3 voice files, plus the 3 text files with the same names (I sent all 6 in chat; they're also in this folder):
  - `voice_ref_1.wav` (14 s) with `voice_ref_1.txt`
  - `voice_ref_2.wav` (10.5 s) with `voice_ref_2.txt`
  - `voice_ref_3.wav` (16 s) with `voice_ref_3.txt`

  They're cut from the Chile voice-over: only your normal narrating voice, with no music, no sound effects and no skit character voices. Each `.txt` file holds exactly what is said in its clip.

Save all 6 files into one folder on your computer, for example `Documents\VoiceClone`.

## Part 1: install it (Windows)

1. On your PC, open this page in Chrome or Edge: https://github.com/debpalash/VoiceStudio/releases/latest
2. Scroll down to **Assets**. If you only see a few files, click "Show all assets".
3. Click the file whose name looks like `VoiceStudio-Electron-<version>-win-x64.exe`, where `<version>` is a number such as 1.2.3. It downloads to your **Downloads** folder.
4. Open Downloads and double-click that file.
5. If a blue box says "Windows protected your PC", click **More info**, then **Run anyway**. This happens because the app is new, not because it's harmful.
6. The setup window opens. Keep clicking **Next**, then **Install**. You don't need an admin password.
7. When it says finished, click **Finish**. VoiceStudio opens. Next time, open it from the Start menu by typing "VoiceStudio".

## Part 1: install it (Mac with an Apple chip)

1. To check your chip, click the Apple logo at the top left, then **About This Mac**. It must say Apple M1/M2/M3/M4.
2. Open https://github.com/debpalash/VoiceStudio/releases/latest
3. Under **Assets**, click the file named like `VoiceStudio-Electron-<version>-mac-arm64.dmg`.
4. Double-click the downloaded file. A window opens: drag **VoiceStudio** onto the **Applications** folder.
5. Open **Applications**, right-click **VoiceStudio**, and choose **Open**. Then click **Open** again.
   - If it still won't open: go to **System Settings**, then **Privacy & Security**. Scroll down and click **Open Anyway**.

## Part 2: first start (just wait)

1. The first time it opens, VoiceStudio sets itself up. It downloads Python, FFmpeg and some voice files. This can take 10 to 30 minutes. Don't close it.
2. If it asks whether to share analytics or usage data, that's your choice. **No** is fine.
3. If it offers a "CPU" choice, pick that: it means you have no NVIDIA graphics card, and it still works, just slower. If you have an NVIDIA card, or a Mac with an Apple chip, it uses that by itself.

## Part 3: clone the voice

1. In the app, open **Voice cloning**.
2. Add a new voice from a recording: choose **add a clean reference recording**, or an upload/reference option near it.
3. Pick `voice_ref_1.wav`.
4. If it asks for the words spoken in the recording ("transcript" or "reference text"), open `voice_ref_1.txt`, copy all of it, and paste it in.
5. Name the voice, e.g. `NullDynasty VO`, and save it.
6. If it asks for the language, choose **Hindi**.

## Part 4: test it

1. In the text box, paste a Hindi line, for example:
   `चलो, आज देखते हैं कि ये देश इतना अजीब क्यों दिखता है।`
2. Click **Generate**.
3. The first time, it may ask to install a model. It should show the size and licence. Click install, wait until it's done, then click **Generate** again.
4. Play the result. Does it sound like the voice-over?
   - If it's close but not quite right, try again with `voice_ref_3.wav` (the longest clip) and its text.
   - If it's very slow, that's normal on a PC without an NVIDIA card. Short lines go faster.
5. Save or export the audio. That's your VO, ready to send me like always.

## If you get stuck

Take a screenshot of the screen and send it to me with one line about what you clicked. I'll tell you the next click. The app's own help page for problems is
https://github.com/debpalash/VoiceStudio/blob/main/docs/install/troubleshooting.md

Note: the app says to "clone voices only with permission". If your voice-overs were made with an online AI voice, check that service's rules on cloning its voices before you use the clone for uploads.
