#!/usr/bin/env python3
"""
Generate multiple metronome tick sounds for the app.
Run from project root: python scripts/generate_metronome_sounds.py
Output: frontend/assets/sounds/metronome-*.mp3
Requires: pip install pydub
"""

import os
from pathlib import Path

try:
    from pydub import AudioSegment
    from pydub.generators import Sine, Square
except ImportError:
    print("Install pydub: pip install pydub")
    raise

# Output directory (frontend assets/sounds)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUT_DIR = PROJECT_ROOT / "frontend" / "assets" / "sounds"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def make_tick(freq_hz: int, duration_ms: int = 80, fade_ms: int = 5, volume_dB: float = 0) -> AudioSegment:
    """Generate a single tick using a sine wave."""
    seg = Sine(freq_hz).to_audio_segment(duration=duration_ms)
    seg = seg.fade_in(fade_ms).fade_out(fade_ms)
    if volume_dB != 0:
        seg = seg + volume_dB
    return seg


def make_click(duration_ms: int = 60, freq_hz: int = 800) -> AudioSegment:
    """Short percussive click (square wave for sharper attack)."""
    seg = Square(freq_hz).to_audio_segment(duration=duration_ms)
    seg = seg.fade_in(2).fade_out(25)
    return seg - 3  # Slightly quieter


def main():
    sounds = [
        # (id, filename_suffix, description, audio_segment)
        # "tick" uses existing frontend/assets/sounds/metronome-tick.mp3
        ("tick", "tick", "Classic beep (1kHz)", make_tick(1000, 80, 5)),
        ("soft", "soft", "Soft low tick", make_tick(600, 100, 8, -2)),
        ("high", "high", "High pitch", make_tick(1600, 60, 4)),
        ("click", "click", "Percussive click", make_click(60, 800)),
        ("deep", "deep", "Deep tick", make_tick(400, 90, 10, -1)),
        ("wood", "wood", "Warm / wood-like", make_tick(350, 85, 12, 1)),
        ("ping", "ping", "Bright ping", make_tick(2000, 50, 3)),
    ]

    for sound_id, suffix, desc, seg in sounds:
        # Export WAV (no ffmpeg required). App uses .mp3 for "tick" (existing), .wav for others.
        ext = "wav"
        out_path = OUT_DIR / f"metronome-{suffix}.{ext}"
        seg.export(str(out_path), format="wav")
        print(f"  {out_path.name} (id={sound_id}) – {desc}")
met
    # Optionally regenerate metronome-tick.mp3 if ffmpeg is installed
    tick_seg = make_tick(1000, 80, 5)
    mp3_path = OUT_DIR / "metronome-tick.mp3"
    try:
        tick_seg.export(str(mp3_path), format="mp3", bitrate="128k")
        print(f"  {mp3_path.name} (id=tick) – regenerated")
    except Exception as e:
        print(f"  (Skip MP3: install ffmpeg to regenerate metronome-tick.mp3)")

    print(f"\nGenerated {len(sounds)} metronome sounds in {OUT_DIR}")


if __name__ == "__main__":
    main()
