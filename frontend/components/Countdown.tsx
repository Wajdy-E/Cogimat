import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";

interface CountdownProps {
	seconds: number;
	onComplete: () => void;
	isVisible: boolean;
}

export default function Countdown({ seconds, onComplete, isVisible }: CountdownProps) {
	const [timeLeft, setTimeLeft] = useState(seconds);
	const hasStarted = useRef(false); // Prevent multiple starts

	useEffect(() => {
		if (!isVisible || seconds <= 0 || hasStarted.current) return;

		hasStarted.current = true; // Mark as started
		setTimeLeft(seconds);
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isVisible, seconds]);

	useEffect(() => {
		if (timeLeft === 0 && hasStarted.current) {
			hasStarted.current = false; // Reset for potential reuse
			onComplete?.();
		}
	}, [timeLeft, onComplete]);

	if (!isVisible) return null;

	return (
		<View className="flex bg-black justify-center absolute inset-0 items-center">
			<Text className="text-3xl text-white font-bold mb-12">STARTING IN</Text>
			<Text className="text-6xl text-white font-bold">{timeLeft}</Text>
		</View>
	);
}
