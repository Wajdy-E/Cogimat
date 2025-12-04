# Quick Setup Guide - Metronome Audio File

## ⚠️ REQUIRED: Add Metronome Sound File

The metronome feature is complete but requires an audio file to function.

## Steps:

### 1. Get a Metronome Sound

Download a metronome tick sound from one of these sources:

**Option A - Generate Online:**

-   Visit: https://www.soundjay.com/metronome-sounds-1.html
-   Or: https://freesound.org/ (search "metronome tick")

**Option B - Create Your Own:**

-   Use Audacity or any audio software
-   Create a short "tick" or "beep" sound (50-100ms)
-   Export as MP3

**Recommended Sound:**

-   A clear, sharp tick or beep
-   Duration: 50-100ms
-   No reverb or echo
-   Simple and clean

### 2. Add to Project

1. Save the file as `metronome-tick.mp3`
2. Place it in: `frontend/assets/sounds/metronome-tick.mp3`

### 3. Verify Setup

The file structure should look like:

```
frontend/
  assets/
    sounds/
      metronome-tick.mp3    ← Your audio file
      README.md
```

### 4. Test

1. Run the app: `npm start` or `npx expo start`
2. Navigate to any exercise
3. Go to exercise settings
4. Enable metronome
5. Start the exercise
6. You should hear ticks!

## File Specifications

-   **Format**: MP3
-   **Duration**: 50-100 milliseconds
-   **Sample Rate**: 44.1kHz or 48kHz
-   **Bit Rate**: 128kbps or higher
-   **Mono/Stereo**: Either works (mono preferred for smaller size)

## Quick Test Sound

If you need to test quickly, you can use any short audio file temporarily:

```bash
# On macOS/Linux, generate a simple beep:
ffmpeg -f lavfi -i "sine=frequency=1000:duration=0.05" metronome-tick.mp3
```

## Troubleshooting

**Error: "Cannot load metronome sound"**

-   Check file exists at exact path: `frontend/assets/sounds/metronome-tick.mp3`
-   Verify filename is exactly `metronome-tick.mp3` (case-sensitive)
-   Ensure file is valid MP3 format

**No sound playing**

-   Device volume is up
-   Silent mode is off (iOS)
-   Try restarting the app
-   Check browser console for errors

## Alternative: Use Different Sound Name

If you want to use a different filename, update `MetronomeService.ts`:

```typescript
// Line 48 in MetronomeService.ts
const { sound } = await Audio.Sound.createAsync(
	require("../../assets/sounds/YOUR-FILENAME-HERE.mp3"), // Change this
	{ shouldPlay: false, volume: this.volume },
	this.onPlaybackStatusUpdate
);
```

---

**After adding the sound file, the metronome feature is ready to use!**
