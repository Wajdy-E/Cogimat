/**
 * MetronomeIndicator - Visual beat indicator overlay
 * Shows a pulsing visual cue that syncs with metronome beats
 */

import React, { useState, useEffect } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import MetronomeService from "@/services/MetronomeService";
import { Exercise } from "@/store/data/dataSlice";

interface MetronomeIndicatorProps {
	position?: "top" | "bottom" | "center";
	color?: string;
	size?: number;
	exercise: Exercise;
}

export default function MetronomeIndicator({
	position = "top",
	color = "#10b981",
	size = 20,
	exercise,
}: MetronomeIndicatorProps) {
	const [pulseAnim] = useState(new Animated.Value(1));
	const [opacityAnim] = useState(new Animated.Value(0.3));
	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		const metronomeState = MetronomeService.getState();
		setIsVisible(metronomeState.isPlaying && metronomeState.soundEnabled);

		const unsubscribe = MetronomeService.onBeat(() => {
			// Pulse and flash animation on each beat
			Animated.parallel([
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.5,
						duration: 80,
						easing: Easing.out(Easing.cubic),
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 150,
						easing: Easing.in(Easing.cubic),
						useNativeDriver: true,
					}),
				]),
				Animated.sequence([
					Animated.timing(opacityAnim, {
						toValue: 1,
						duration: 80,
						easing: Easing.out(Easing.ease),
						useNativeDriver: true,
					}),
					Animated.timing(opacityAnim, {
						toValue: 0.3,
						duration: 150,
						easing: Easing.in(Easing.ease),
						useNativeDriver: true,
					}),
				]),
			]).start();

			setIsVisible(true);
		});

		return unsubscribe;
	}, []);

	if (!isVisible) {
		return null;
	}

	const positionStyle = {
		top: position === "top" ? 20 : position === "center" ? ("50%" as const) : undefined,
		bottom: position === "bottom" ? 20 : undefined,
	};

	return (
		exercise.customizableOptions.metronome?.enabled && (
			<View style={[styles.container, positionStyle as any]} pointerEvents="none">
				<Animated.View
					style={[
						styles.indicator,
						{
							width: size,
							height: size,
							borderRadius: size / 2,
							backgroundColor: color,
							transform: [{ scale: pulseAnim }],
							opacity: opacityAnim,
						},
					]}
				/>
			</View>
		)
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		alignSelf: "center",
		zIndex: 1000,
		elevation: 1000,
	},
	indicator: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
});
