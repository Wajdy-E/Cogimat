/**
 * Metronome sound options. IDs must match assets in frontend/assets/sounds.
 * Generate WAVs with: python scripts/generate_metronome_sounds.py
 */

export const DEFAULT_METRONOME_SOUND_ID = "tick";

export const METRONOME_SOUND_IDS = [
	"tick",
	"soft",
	"high",
	"click",
	"deep",
	"wood",
	"ping",
] as const;

export type MetronomeSoundId = (typeof METRONOME_SOUND_IDS)[number];

/** Asset source per sound ID (for require()). All use WAV for reliability (no MP3 codec issues). */
export const METRONOME_SOUND_SOURCES: Record<MetronomeSoundId, number> = {
	tick: require("../../assets/sounds/metronome-tick.wav"),
	soft: require("../../assets/sounds/metronome-soft.wav"),
	high: require("../../assets/sounds/metronome-high.wav"),
	click: require("../../assets/sounds/metronome-click.wav"),
	deep: require("../../assets/sounds/metronome-deep.wav"),
	wood: require("../../assets/sounds/metronome-wood.wav"),
	ping: require("../../assets/sounds/metronome-ping.wav"),
};

export function getMetronomeSoundSource(soundId: string): number {
	const id = METRONOME_SOUND_IDS.includes(soundId as MetronomeSoundId)
		? (soundId as MetronomeSoundId)
		: DEFAULT_METRONOME_SOUND_ID;
	return METRONOME_SOUND_SOURCES[id];
}
