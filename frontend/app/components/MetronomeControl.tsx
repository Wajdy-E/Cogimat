/**
 * MetronomeControl Component
 * UI for controlling metronome settings (BPM, enable/disable, sound)
 */

import React, { useState, useEffect } from "react";
import { View, Animated, Easing, Pressable } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react-native";
import MetronomeService from "@/services/MetronomeService";
import { i18n } from "../i18n";
import {
	METRONOME_SOUND_IDS,
	DEFAULT_METRONOME_SOUND_ID,
	type MetronomeSoundId,
} from "@/constants/metronomeSounds";

export interface MetronomeSettings {
	enabled: boolean;
	bpm: number;
	soundId?: string;
}

interface MetronomeControlProps {
	settings: MetronomeSettings;
	onChange: (settings: MetronomeSettings) => void;
	showVisualIndicator?: boolean;
	compact?: boolean;
}

export default function MetronomeControl({
	settings,
	onChange,
	showVisualIndicator = true,
	compact = false,
}: MetronomeControlProps) {
	const [localSettings, setLocalSettings] = useState<MetronomeSettings>(settings);
	const [pulseAnim] = useState(new Animated.Value(1));
	const metronomeState = MetronomeService.getState();

	// Sync local settings with props
	useEffect(() => {
		setLocalSettings(settings);
	}, [settings]);

	// Visual beat indicator animation
	useEffect(() => {
		if (!showVisualIndicator || !localSettings.enabled) {
			return;
		}

		const unsubscribe = MetronomeService.onBeat(() => {
			// Pulse animation on each beat
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.3,
					duration: 100,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 200,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
		});

		return unsubscribe;
	}, [localSettings.enabled, showVisualIndicator]);

	const handleToggle = (enabled: boolean) => {
		const newSettings = { ...localSettings, enabled };
		setLocalSettings(newSettings);
		onChange(newSettings);
		MetronomeService.setSoundEnabled(enabled);
	};

	const handleBPMChange = (delta: number) => {
		const newBPM = Math.max(30, Math.min(300, localSettings.bpm + delta));
		const newSettings = { ...localSettings, bpm: newBPM };
		setLocalSettings(newSettings);
		onChange(newSettings);
	};

	const currentSoundId = (localSettings.soundId ?? DEFAULT_METRONOME_SOUND_ID) as MetronomeSoundId;

	const handleSoundSelect = (soundId: MetronomeSoundId) => {
		const newSettings = { ...localSettings, soundId };
		setLocalSettings(newSettings);
		onChange(newSettings);
		MetronomeService.previewSound(soundId);
	};

	if (compact) {
		return (
			<HStack space="md" className="items-center justify-between w-full">
				<HStack space="sm" className="items-center">
					<Text className="text-typography-950 font-semibold">{i18n.t("metronome.title")}</Text>
					{showVisualIndicator && localSettings.enabled && (
						<Animated.View
							style={{
								width: 12,
								height: 12,
								borderRadius: 6,
								backgroundColor: "#10b981",
								transform: [{ scale: pulseAnim }],
							}}
						/>
					)}
				</HStack>
				<HStack space="md" className="items-center">
					<Text className="text-typography-700">{localSettings.bpm} BPM</Text>
					<Switch value={localSettings.enabled} onValueChange={handleToggle} size="sm" />
				</HStack>
			</HStack>
		);
	}

	return (
		<VStack space="lg" className="w-full">
			<HStack space="md" className="items-center justify-between">
				<HStack space="sm" className="items-center">
					<Text className="text-typography-950 font-bold text-lg">{i18n.t("metronome.title")}</Text>
					{showVisualIndicator && localSettings.enabled && metronomeState.isPlaying && (
						<Animated.View
							style={{
								width: 16,
								height: 16,
								borderRadius: 8,
								backgroundColor: "#10b981",
								transform: [{ scale: pulseAnim }],
							}}
						/>
					)}
				</HStack>
				<Switch value={localSettings.enabled} onValueChange={handleToggle} size="md" />
			</HStack>

			{localSettings.enabled && (
				<>
					{/* Sound picker */}
					<VStack space="sm">
						<Text className="text-typography-700 font-semibold">{i18n.t("metronome.sound")}</Text>
						<View className="flex-row flex-wrap gap-2">
							{METRONOME_SOUND_IDS.map((id) => (
								<Pressable
									key={id}
									onPress={() => handleSoundSelect(id)}
									className={`rounded-lg px-3 py-2 min-w-[72px] items-center ${
										currentSoundId === id ? "bg-primary-500" : "bg-secondary-400"
									}`}
								>
									<Text
										className={
											currentSoundId === id ? "text-white font-semibold" : "text-typography-700"
										}
									>
										{i18n.t(`metronome.sounds.${id}`)}
									</Text>
								</Pressable>
							))}
						</View>
					</VStack>

					<VStack space="md">
						<Text className="text-typography-700 font-semibold">{i18n.t("metronome.tempo")}</Text>
						<HStack space="md" className="items-center justify-between">
							<Button
								variant="outline"
								size="sm"
								onPress={() => handleBPMChange(-5)}
								disabled={localSettings.bpm <= 30}
							>
								<ButtonIcon as={Minus} size="sm" />
							</Button>

							<View className="flex-1 items-center">
								<Text className="text-typography-950 font-bold text-3xl">{localSettings.bpm}</Text>
								<Text className="text-typography-600 text-sm">BPM</Text>
							</View>

							<Button
								variant="outline"
								size="sm"
								onPress={() => handleBPMChange(5)}
								disabled={localSettings.bpm >= 300}
							>
								<ButtonIcon as={Plus} size="sm" />
							</Button>
						</HStack>

						<HStack space="sm" className="justify-center flex-wrap">
							{[60, 90, 120, 150, 180].map((bpm) => (
								<Button
									key={bpm}
									variant={localSettings.bpm === bpm ? "solid" : "outline"}
									size="xs"
									onPress={() => {
										const newSettings = { ...localSettings, bpm };
										setLocalSettings(newSettings);
										onChange(newSettings);
									}}
									className="min-w-[60px]"
								>
									<ButtonText>{bpm}</ButtonText>
								</Button>
							))}
						</HStack>
					</VStack>
				</>
			)}
		</VStack>
	);
}
