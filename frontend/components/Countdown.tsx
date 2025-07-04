import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { i18n } from '../i18n';

interface CountdownProps {
	seconds: number;
	onComplete: () => void;
	isVisible: boolean;
}

export default function Countdown ({ seconds, onComplete, isVisible }: CountdownProps) {
	const [timeLeft, setTimeLeft] = useState(seconds);
	const hasStarted = useRef(false); // Prevent multiple starts

	useEffect(() => {
		if (!isVisible || seconds <= 0 || hasStarted.current) {
			return;
		}

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

	if (!isVisible) {
		return null;
	}

	return (
		<View className="flex bg-background-800 justify-center absolute inset-0 items-center">
			<Text className="text-3xl text-typography-950 font-bold mb-12">{i18n.t('exercise.startingIn')}</Text>
			<Text className="text-6xl text-typography-950 font-bold">{timeLeft}</Text>
		</View>
	);
}
