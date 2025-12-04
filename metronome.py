# generate_metronome_tick.py
from pydub import AudioSegment
from pydub.generators import Sine

# Generate 80ms beep at 1000Hz
beep = Sine(1000).to_audio_segment(duration=80)
beep = beep.fade_in(5).fade_out(5)  # Smooth edges
beep.export("metronome-tick.mp3", format="mp3")
print("✅ Generated metronome-tick.mp3")