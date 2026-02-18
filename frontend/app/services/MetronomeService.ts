/**
 * MetronomeService - High-precision metronome for exercise timing
 * Provides accurate BPM-based audio cues with low latency
 */

import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import {
	DEFAULT_METRONOME_SOUND_ID,
	getMetronomeSoundSource,
	type MetronomeSoundId,
} from "@/constants/metronomeSounds";

export interface MetronomeConfig {
	bpm: number;
	soundEnabled: boolean;
	soundId?: string;
	countdownBeats?: number;
}

type MetronomeCallback = (beatNumber: number) => void;

class MetronomeService {
	private sound: Sound | null = null;
	private intervalId: NodeJS.Timeout | null = null;
	private isPlaying: boolean = false;
	private currentBeat: number = 0;
	private bpm: number = 120;
	private soundEnabled: boolean = true;
	private callbacks: MetronomeCallback[] = [];

	// Pre-loaded sound for minimal latency
	private soundObject: Sound | null = null;
	private currentSoundId: string = DEFAULT_METRONOME_SOUND_ID;
	private isInitialized: boolean = false;

	// Serialize start/resume so we never create multiple intervals
	private lastStartResumePromise: Promise<void> = Promise.resolve();
	// Serialize stop so start never runs while stop is in progress
	private lastStopPromise: Promise<void> = Promise.resolve();

	constructor() {
		this.initializeAudio();
	}

	/**
	 * Initialize audio system (mode only; sound loaded on start with soundId)
	 */
	private async initializeAudio() {
		try {
			console.log("🎵 Initializing metronome audio...");

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
				playsInSilentModeIOS: true,
				staysActiveInBackground: false,
				shouldDuckAndroid: true,
				playThroughEarpieceAndroid: false,
			});

			this.isInitialized = true;
			console.log("✅ Metronome audio mode initialized");
		} catch (error) {
			console.error("❌ Failed to initialize metronome audio:", error);
		}
	}

	/**
	 * Load the sound for the given soundId. Unloads previous sound if any.
	 */
	private async loadSound(soundId: string): Promise<void> {
		if (this.soundObject && this.currentSoundId === soundId) {
			return;
		}

		if (this.soundObject) {
			await this.soundObject.unloadAsync();
			this.soundObject = null;
		}

		const source = getMetronomeSoundSource(soundId);
		const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false }, this.onPlaybackStatusUpdate);
		this.soundObject = sound;
		this.currentSoundId = soundId;
		console.log("🎵 Loaded metronome sound:", soundId);
	}

	/**
	 * Callback for playback status updates.
	 * Note: We do NOT call setPositionAsync(0) here - it races with replayAsync()
	 * at metronome intervals and causes "Seeking interrupted" errors. replayAsync()
	 * already starts from the beginning.
	 */
	private onPlaybackStatusUpdate = (_status: any) => {
		// Intentionally empty - avoid setPositionAsync race with replayAsync
	};

	/**
	 * Preview a metronome sound by playing it 3 times (e.g. in settings picker).
	 * Uses a temporary sound so it does not affect the main metronome state.
	 */
	async previewSound(soundId: string): Promise<void> {
		try {
			const source = getMetronomeSoundSource(soundId);
			const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
			const intervalMs = 500;
			for (let i = 0; i < 3; i++) {
				await sound.replayAsync();
				if (i < 2) {
					await new Promise((r) => setTimeout(r, intervalMs));
				}
			}
			await sound.unloadAsync();
		} catch (error) {
			console.warn("Metronome preview failed:", error);
		}
	}

	/** Clear the tick interval if any (prevents duplicate intervals from pause/resume races). */
	private clearTickInterval(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	/**
	 * Start the metronome
	 */
	async start(config?: Partial<MetronomeConfig>): Promise<void> {
		console.log("start() called from:", new Error().stack);
		const prev = this.lastStartResumePromise;
		let resolve: () => void;
		this.lastStartResumePromise = new Promise((r) => {
			resolve = r;
		});
		await prev;
		// Wait for any in-progress stop to finish before starting
		await this.lastStopPromise;

		try {
			console.log("🎵 Starting metronome with config:", config);

			this.clearTickInterval();
			if (this.isPlaying) {
				await this.stop();
			}

			// Update configuration
			const soundId = config?.soundId ?? this.currentSoundId ?? DEFAULT_METRONOME_SOUND_ID;
			if (config) {
				this.bpm = config.bpm ?? this.bpm;
				this.soundEnabled = config.soundEnabled ?? this.soundEnabled;
			}

			// Ensure audio mode is initialized
			if (!this.isInitialized) {
				await this.initializeAudio();
			}

			// Load the requested sound (may reuse current if same id)
			await this.loadSound(soundId);

			if (!this.soundObject) {
				console.error("❌ Sound object is null, cannot start metronome");
				return;
			}

			console.log(`🎵 Metronome - BPM: ${this.bpm}, sound: ${soundId}, enabled: ${this.soundEnabled}`);

			// Calculate interval in milliseconds
			const intervalMs = (60 / this.bpm) * 1000;
			console.log(`🎵 Interval: ${intervalMs}ms (${this.bpm} BPM)`);

			this.isPlaying = true;
			this.currentBeat = 0;

			// Use high-precision interval for accurate timing
			this.intervalId = setInterval(() => {
				this.tick();
			}, intervalMs);

			// Play first beat immediately
			this.tick();
		} finally {
			resolve!();
		}
	}

	/**
	 * Stop the metronome
	 */
	async stop(): Promise<void> {
		let resolve: () => void;
		this.lastStopPromise = new Promise((r) => {
			resolve = r;
		});

		try {
			this.clearTickInterval();
			this.tickPlayLock = false;
			this.isPlaying = false;
			this.currentBeat = 0;

			if (this.soundObject) {
				await this.soundObject.stopAsync().catch(() => {});
				// setPositionAsync can throw "Seeking interrupted" when racing with replay - ignore
				await this.soundObject.setPositionAsync(0).catch(() => {});
			}
		} finally {
			resolve!();
		}
	}

	/**
	 * Pause the metronome (can be resumed)
	 */
	pause(): void {
		this.isPlaying = false;
		this.tickPlayLock = false;
		this.clearTickInterval();
		// Stop current playback so no tick continues after pause
		this.soundObject?.stopAsync().catch(() => {});
	}

	/**
	 * Resume the metronome
	 */
	async resume(): Promise<void> {
		console.log("resume() called from:", new Error().stack);

		if (this.isPlaying) return;

		const prev = this.lastStartResumePromise;
		let resolve: () => void;
		this.lastStartResumePromise = new Promise((r) => {
			resolve = r;
		});
		await prev;

		try {
			if (this.isPlaying) return;
			this.clearTickInterval();

			const intervalMs = (60 / this.bpm) * 1000;
			this.isPlaying = true;

			this.intervalId = setInterval(() => {
				this.tick();
			}, intervalMs);
		} finally {
			resolve!();
		}
	}

	// Prevent overlapping tick playback (one replay at a time per interval)
	private tickPlayLock: boolean = false;

	/**
	 * Execute a single tick/beat
	 */
	private async tick(): Promise<void> {
		if (!this.isPlaying) return;

		this.currentBeat++;
		const beat = this.currentBeat;
		console.log(`🎵 Tick ${beat} - Sound enabled: ${this.soundEnabled}`);

		// Play sound only if still playing (avoid tick after pause)
		if (!this.isPlaying) return;
		if (this.soundEnabled && this.soundObject && !this.tickPlayLock) {
			this.tickPlayLock = true;
			try {
				await this.soundObject.replayAsync();
				if (this.isPlaying) console.log(`✅ Played tick ${beat}`);
			} catch (error: any) {
				// "Seeking interrupted" is a known expo-av race when stop/start overlap or rapid replay
				if (error?.message?.includes?.("Seeking interrupted")) {
					// Harmless - tick may have played; avoid noisy logs
				} else {
					console.error("❌ Error playing metronome tick:", error);
				}
			} finally {
				this.tickPlayLock = false;
			}
		}

		if (!this.isPlaying) return;
		this.callbacks.forEach((callback) => {
			callback(this.currentBeat);
		});
	}

	/**
	 * Update BPM in real-time
	 */
	async setBPM(bpm: number): Promise<void> {
		if (bpm < 30 || bpm > 300) {
			console.warn("BPM must be between 30 and 300");
			return;
		}

		this.bpm = bpm;

		// If playing, restart with new BPM
		if (this.isPlaying) {
			await this.stop();
			await this.start();
		}
	}

	/**
	 * Toggle sound on/off
	 */
	setSoundEnabled(enabled: boolean): void {
		this.soundEnabled = enabled;
	}

	/**
	 * Register a callback for beat events
	 */
	onBeat(callback: MetronomeCallback): () => void {
		this.callbacks.push(callback);

		// Return unsubscribe function
		return () => {
			this.callbacks = this.callbacks.filter((cb) => cb !== callback);
		};
	}

	/**
	 * Get current state
	 */
	getState() {
		return {
			isPlaying: this.isPlaying,
			currentBeat: this.currentBeat,
			bpm: this.bpm,
			soundEnabled: this.soundEnabled,
		};
	}

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		await this.stop();

		if (this.soundObject) {
			await this.soundObject.unloadAsync();
			this.soundObject = null;
		}

		this.callbacks = [];
		this.isInitialized = false;
	}
}

// Export singleton instance
export default new MetronomeService();
