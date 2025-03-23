import { useEffect, useState, useRef } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ExerciseStartingProps {
	seconds: number;
	onComplete: () => void;
	isVisible: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Countdown({ seconds, onComplete, isVisible }: ExerciseStartingProps) {
	const [timeLeft, setTimeLeft] = useState(seconds);
	const progressAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (!isVisible) return;

		// Restart countdown
		setTimeLeft(seconds);
		progressAnim.setValue(0);

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					console.log("Countdown complete, calling onComplete...");
					onComplete(); // Ensure this fires!
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isVisible, seconds, onComplete]); // ✅ Added proper dependencies

	useEffect(() => {
		Animated.timing(progressAnim, {
			toValue: (seconds - timeLeft) / seconds,
			duration: 900,
			useNativeDriver: false,
		}).start();
	}, [timeLeft]);

	const size = 250;
	const strokeWidth = 14;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = progressAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [circumference, 0],
	});

	return isVisible ? (
		<View className="flex bg-black justify-center absolute inset-0 items-center">
			<Text className="text-3xl text-white font-bold mb-12">STARTING IN</Text>

			<View className="relative">
				<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					<Circle cx={size / 2} cy={size / 2} r={radius} stroke="gray" strokeWidth={strokeWidth} fill="none" />
					<AnimatedCircle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="#64DAC4"
						strokeWidth={strokeWidth}
						fill="none"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						transform={`rotate(-90 ${size / 2} ${size / 2})`}
					/>
				</Svg>

				<View className="flex justify-center absolute inset-0 items-center">
					<Text className="text-6xl text-white font-bold">{timeLeft}</Text>
				</View>
			</View>
		</View>
	) : null;
}
