import { useEffect, useState } from "react";
import { View, Text } from "react-native";

interface ExerciseStartingProps {
	seconds: number;
	onComplete: () => void;
	isVisible: boolean;
}

export default function Countdown({ seconds, onComplete, isVisible }: ExerciseStartingProps) {
	const [timeLeft, setTimeLeft] = useState(seconds);

	useEffect(() => {
		if (!isVisible || seconds <= 0) return;

		setTimeLeft(seconds);
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					onComplete?.();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isVisible, seconds]);

	if (!isVisible) return null;

	return (
		<View className="flex bg-black justify-center absolute inset-0 items-center">
			<Text className="text-3xl text-white font-bold mb-12">STARTING IN</Text>
			<Text className="text-6xl text-white font-bold">{timeLeft}</Text>
		</View>
	);
}
