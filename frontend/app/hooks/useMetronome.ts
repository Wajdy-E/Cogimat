/**
 * useMetronome Hook
 * Simplifies metronome management in exercise components
 */

import { useEffect, useCallback } from "react";
import MetronomeService from "@/services/MetronomeService";
import { MetronomeSettings } from "@/components/MetronomeControl";

export function useMetronome(enabled: boolean, settings: MetronomeSettings, isActive: boolean = true) {
	useEffect(() => {
		if (!enabled || !isActive) {
			MetronomeService.stop();
			return;
		}

		// Start metronome with settings
		MetronomeService.start({
			bpm: settings.bpm,
			soundEnabled: settings.enabled,
		});

		return () => {
			MetronomeService.stop();
		};
	}, [enabled, settings.bpm, settings.enabled, isActive]);

	const start = useCallback(async () => {
		if (enabled) {
			await MetronomeService.start({
				bpm: settings.bpm,
				soundEnabled: settings.enabled,
			});
		}
	}, [enabled, settings]);

	const stop = useCallback(async () => {
		await MetronomeService.stop();
	}, []);

	const pause = useCallback(() => {
		MetronomeService.pause();
	}, []);

	const resume = useCallback(async () => {
		await MetronomeService.resume();
	}, []);

	const setBPM = useCallback(async (bpm: number) => {
		await MetronomeService.setBPM(bpm);
	}, []);

	return {
		start,
		stop,
		pause,
		resume,
		setBPM,
		state: MetronomeService.getState(),
	};
}
