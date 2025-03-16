import { useLocalSearchParams } from "expo-router";
import { Animated, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";
import WebView from "react-native-webview";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CirclePlay } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Flame, Clock, Brain } from "lucide-react-native";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

function ExerciseProgram() {
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);
	const exercise = exercises.filter((exercise) => exercise.id === id)[0];
	const floatAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(floatAnim, {
					toValue: -10,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(floatAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		).start();
	}, [floatAnim]);
	const runFirst = `
	window.isNativeApp = true;
	true;
  `;
	return (
		<View className="bg-background-700 h-screen relative">
			<View style={{ flex: 1, height: 250, maxHeight: 250 }} className="bg-primary-700 py-5">
				<WebView
					source={{ uri: "https://www.youtube.com/embed/Z_6v7b7BLmg?si=PIDQMzJVGTqDv-Do" }}
					injectedJavaScriptBeforeContentLoaded={runFirst}
					style={{
						height: 250,
						maxHeight: 250,
						width: "90%",
						alignSelf: "center",
						borderRadius: 20,
					}}
				/>
			</View>
			<View className="flex items-center py-5">
				<VStack className="w-[90%]" space="md">
					<View className="flex-row justify-start gap-4">
						<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
							<BadgeIcon as={Flame} />
							<BadgeText size="lg">{exercise.difficulty}</BadgeText>
						</Badge>
						<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
							<BadgeIcon as={Brain} />
							<BadgeText>{exercise.focus}</BadgeText>
						</Badge>
						<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
							<BadgeIcon as={Clock} />
							<BadgeText>{exercise.timeToComplete}</BadgeText>
						</Badge>
					</View>
					<Heading>{exercise.name}</Heading>
					<Text>{exercise.instructions}</Text>
				</VStack>
			</View>
			<Animated.View
				style={{
					position: "absolute",
					bottom: "20%",
					alignSelf: "center",
					transform: [{ translateY: floatAnim }],
				}}
			>
				<Button
					onPress={() => console.log("Start Now pressed")}
					className="rounded-full w-full"
					variant="outline"
					action="primary"
					size="xl"
				>
					<ButtonText>Start Now</ButtonText>
					<ButtonIcon as={CirclePlay} />
				</Button>
			</Animated.View>
		</View>
	);
}

export default ExerciseProgram;
