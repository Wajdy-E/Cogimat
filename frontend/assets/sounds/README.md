# Metronome Sound Files

This directory contains metronome tick sounds. One is required; multiple are optional for user choice.

## Required (legacy)

-   `metronome-tick.mp3` - Classic beep (used when sound option is "tick")

## Generated options (optional)

Run from project root to generate WAV variants:

```bash
python scripts/generate_metronome_sounds.py
```

This creates: `metronome-tick.wav`, `metronome-soft.wav`, `metronome-high.wav`, `metronome-click.wav`, `metronome-deep.wav`, `metronome-wood.wav`, `metronome-ping.wav`. With ffmpeg installed, it can also regenerate `metronome-tick.mp3`.

## Specifications:

-   Format: MP3
-   Duration: ~50-100ms
-   Sample Rate: 44.1kHz or 48kHz
-   Bit Rate: 128kbps or higher
-   Characteristics: Clear, sharp tick or beep sound

## Where to get the sound:

1. Generate using online metronome sound generators
2. Use royalty-free sound libraries (e.g., freesound.org)
3. Record or create a simple beep sound using audio software
4. Use synthetic beep sounds from libraries like Tone.js

## Note for Developer:

Please add a suitable metronome tick sound file to this directory.
Until then, the metronome service will fail to initialize properly.
