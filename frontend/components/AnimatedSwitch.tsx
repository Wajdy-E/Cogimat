import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
interface AnimatedSwitchProps {
	onChange: (value: boolean) => void;
	defaultValue: boolean;
	onIcon?: React.ReactNode;
	offIcon?: React.ReactNode;
	onText?: string;
	offText?: string;
	width?: number;
	height?: number;
	thumbSize?: number;
}

function AnimatedSwitch (props: AnimatedSwitchProps) {
	const SWITCH_WIDTH = props.width || 80;
	const SWITCH_HEIGHT = props.height || 35;
	const THUMB_SIZE = props.thumbSize || 29;
	const PADDING = 3;
	const [isOn, setIsOn] = useState<boolean>(props.defaultValue);
	const anim = useRef(new Animated.Value(props.defaultValue ? 1 : 0)).current;

	useEffect(() => {
		setIsOn(props.defaultValue);
	}, [props.defaultValue]);

	useEffect(() => {
		Animated.timing(anim, {
			toValue: isOn ? 1 : 0,
			duration: 250,
			easing: Easing.out(Easing.circle),
			useNativeDriver: false,
		}).start();
	}, [isOn]);

	const translateX = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [PADDING, SWITCH_WIDTH - THUMB_SIZE - PADDING],
	});

	const bgColor = anim.interpolate({
		inputRange: [0, 1],
		outputRange: ['#6b7280', '#22c55e'], // Tailwind gray-500 to green-500
	});

	const toggle = () => {
		const newValue = !isOn;
		setIsOn(newValue);
		props.onChange(newValue);
	};

	return (
		<Button onPress={toggle} variant="link" className="w-fit">
			<Box
				className="rounded-full overflow-hidden justify-center relative"
				style={{ width: SWITCH_WIDTH, height: SWITCH_HEIGHT }}
			>
				<Animated.View
					style={[StyleSheet.absoluteFillObject, { borderRadius: SWITCH_HEIGHT / 2 }, { backgroundColor: bgColor }]}
				/>

				{isOn ? (
					<View className="abssolute top-0 bottom-0 justify-center" style={{ left: 10, zIndex: 10 }}>
						<HStack className="items-center space-x-1">
							{props.onIcon}
							{props.onText && <ButtonText className="text-typography-0">{props.onText}</ButtonText>}
						</HStack>
					</View>
				) : (
					<View className="absolute top-0 bottom-0 justify-center" style={{ right: 10, zIndex: 10 }}>
						<HStack className="items-center space-x-1">
							{props.offIcon}
							{props.offText && <ButtonText className="text-typography-0">{props.offText}</ButtonText>}
						</HStack>
					</View>
				)}

				<Animated.View
					className="absolute top-[3px] bg-white rounded-full shadow-md"
					style={{
						width: THUMB_SIZE,
						height: THUMB_SIZE,
						transform: [{ translateX }],
					}}
				/>
			</Box>
		</Button>
	);
}

export default AnimatedSwitch;

const StyleSheet = {
	absoluteFillObject: {
		position: 'absolute' as const,
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
};
