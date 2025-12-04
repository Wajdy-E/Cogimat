/**
 * MetronomeService - High-precision metronome for exercise timing
 * Provides accurate BPM-based audio cues with low latency
 */

import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

export interface MetronomeConfig {
	bpm: number;
	soundEnabled: boolean;
	volume: number;
	countdownBeats?: number;
}

type MetronomeCallback = (beatNumber: number) => void;

class MetronomeService {
	private sound: Sound | null = null;
	private intervalId: NodeJS.Timeout | null = null;
	private isPlaying: boolean = false;
	private currentBeat: number = 0;
	private bpm: number = 120;
	private volume: number = 1.0;
	private soundEnabled: boolean = true;
	private callbacks: MetronomeCallback[] = [];

	// Pre-loaded sound for minimal latency
	private soundObject: Sound | null = null;
	private isInitialized: boolean = false;

	constructor() {
		this.initializeAudio();
	}

	/**
	 * Initialize audio system and pre-load metronome sound
	 */
	private async initializeAudio() {
		try {
			console.log("🎵 Initializing metronome audio...");

			// Set audio mode for optimal playback
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
				playsInSilentModeIOS: true,
				staysActiveInBackground: false,
				shouldDuckAndroid: true,
				playThroughEarpieceAndroid: false,
			});

			console.log("🎵 Loading metronome sound file...");

			// Pre-load the metronome sound
			const { sound } = await Audio.Sound.createAsync(
				require("../../assets/sounds/metronome-tick.mp3"),
				{ shouldPlay: false, volume: this.volume },
				this.onPlaybackStatusUpdate
			);

			this.soundObject = sound;
			this.isInitialized = true;
			console.log("✅ Metronome audio initialized successfully");
		} catch (error) {
			console.error("❌ Failed to initialize metronome audio:", error);
		}
	}

	/**
	 * Callback for playback status updates
	 */
	private onPlaybackStatusUpdate = (status: any) => {
		if (status.didJustFinish) {
			// Reset sound position for next play
			this.soundObject?.setPositionAsync(0);
		}
	};

	/**
	 * Start the metronome
	 */
	async start(config?: Partial<MetronomeConfig>): Promise<void> {
		console.log("🎵 Starting metronome with config:", config);

		if (this.isPlaying) {
			await this.stop();
		}

		// Update configuration
		if (config) {
			this.bpm = config.bpm ?? this.bpm;
			this.volume = config.volume ?? this.volume;
			this.soundEnabled = config.soundEnabled ?? this.soundEnabled;
		}

		console.log(`🎵 Metronome settings - BPM: ${this.bpm}, Volume: ${this.volume}, Enabled: ${this.soundEnabled}`);

		// Ensure audio is initialized
		if (!this.isInitialized) {
			console.log("🎵 Audio not initialized, initializing now...");
			await this.initializeAudio();
		}

		if (!this.soundObject) {
			console.error("❌ Sound object is null, cannot start metronome");
			return;
		}

		// Update sound volume
		if (this.soundObject) {
			await this.soundObject.setVolumeAsync(this.volume);
		}

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
	}

	/**
	 * Stop the metronome
	 */
	async stop(): Promise<void> {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		if (this.soundObject) {
			await this.soundObject.stopAsync();
			await this.soundObject.setPositionAsync(0);
		}

		this.isPlaying = false;
		this.currentBeat = 0;
	}

	/**
	 * Pause the metronome (can be resumed)
	 */
	pause(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isPlaying = false;
	}

	/**
	 * Resume the metronome
	 */
	async resume(): Promise<void> {
		if (this.isPlaying) return;

		const intervalMs = (60 / this.bpm) * 1000;
		this.isPlaying = true;

		this.intervalId = setInterval(() => {
			this.tick();
		}, intervalMs);
	}

	/**
	 * Execute a single tick/beat
	 */
	private async tick(): Promise<void> {
		this.currentBeat++;
		console.log(`🎵 Tick ${this.currentBeat} - Sound enabled: ${this.soundEnabled}`);

		// Play sound if enabled
		if (this.soundEnabled && this.soundObject) {
			try {
				await this.soundObject.setPositionAsync(0);
				await this.soundObject.playAsync();
				console.log(`✅ Played tick ${this.currentBeat}`);
			} catch (error) {
				console.error("❌ Error playing metronome tick:", error);
			}
		} else {
			console.log(`⚠️ Skipped tick - soundEnabled: ${this.soundEnabled}, soundObject: ${!!this.soundObject}`);
		}

		// Notify all registered callbacks
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
	 * Update volume (0.0 to 1.0)
	 */
	async setVolume(volume: number): Promise<void> {
		this.volume = Math.max(0, Math.min(1, volume));
		if (this.soundObject) {
			await this.soundObject.setVolumeAsync(this.volume);
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
			volume: this.volume,
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
