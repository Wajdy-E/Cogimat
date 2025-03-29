import { useLocalSearchParams, useRouter } from "expo-router";
import { Animated, ScrollView, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";
import WebView from "react-native-webview";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ArrowRight, CirclePlay } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Flame, Clock, Brain } from "lucide-react-native";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useDispatch } from "react-redux";
import { setCurrentExericse } from "../../store/data/dataSlice";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import WheelColorPicker from "react-native-wheel-color-picker";
import ModalComponent from "../../components/Modal";
import { Icon } from "@/components/ui/icon";
import FormInput from "../../components/FormInput";

function ExerciseProgram() {
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);
	const exercise = exercises.filter((exercise) => exercise.id === id)[0];
	const floatAnim = useRef(new Animated.Value(0)).current;
	const dispatch = useDispatch();
	dispatch(setCurrentExericse(exercise));
	const router = useRouter();

	const [showOffScreenColorPicker, setShowOffScreenColorPicker] = useState(false);
	const [showOnScreenColorPicker, setShowOnScreenColorPicker] = useState(false);
	const [onScreenColor, setOnScreenColor] = useState("#000000");
	const [offScreenColor, setOffScreenColor] = useState("#FFFFFF");

	function onScreenColorConfirm() {}

	function offScreenColorConfirm() {}
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
		<View className="relative bg-background-700">
			<ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
				<View style={{ flex: 1, height: 250, maxHeight: 250 }} className="bg-primary-700 py-5">
					<WebView
						source={{ uri: "https://www.youtube.com/embed/16LuvR2CARA?si=SWqkZtlRD8J8sBL-" }}
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
								{(() => {
									const totalSeconds = parseInt(exercise.timeToComplete, 10);
									const minutes = Math.floor(totalSeconds / 60);
									const seconds = totalSeconds % 60;
									return (
										<BadgeText>
											{minutes} min {seconds} sec
										</BadgeText>
									);
								})()}
							</Badge>
						</View>
						<Heading>{exercise.name}</Heading>
						<Text>{exercise.instructions}</Text>
						<Heading>Customization</Heading>
						<Box className="bg-secondary-500 p-5 rounded-2xl">
							<VStack space="lg">
								<Heading size="md">Duration Settings </Heading>
								<Divider className="bg-slate-400" />
								<View className="flex-row justify-between">
									<Heading size="sm">Off screen time: </Heading>
									<FormInput inputSize="sm" formSize="sm" inputType="text" onChange={() => {}} />
								</View>
								<Heading size="sm">On screen time: </Heading>
								<Heading size="sm">Exercise time: </Heading>
							</VStack>
						</Box>
						<Box className="bg-secondary-500 p-5 rounded-2xl">
							<VStack space="lg">
								<Heading size="md">Color Settings </Heading>
								<Divider className="bg-slate-400" />
								<View className="flex-row justify-between">
									<Heading size="sm">Off screen color: </Heading>
									<Button variant="link" onPress={() => setShowOffScreenColorPicker(true)}>
										<Icon as={ArrowRight} size="md" />
									</Button>
								</View>
								<View className="flex-row justify-between">
									<Heading size="sm">On screen color: </Heading>
									<Button variant="link" onPress={() => setShowOnScreenColorPicker(true)}>
										<Icon as={ArrowRight} size="md" />
									</Button>
								</View>
							</VStack>
							<ModalComponent
								isOpen={showOffScreenColorPicker}
								onClose={() => setShowOffScreenColorPicker(false)}
								onConfirm={offScreenColorConfirm}
							>
								<WheelColorPicker onColorChangeComplete={(color: string) => setOffScreenColor(color)} />
							</ModalComponent>
							<ModalComponent
								isOpen={showOnScreenColorPicker}
								onClose={() => setShowOnScreenColorPicker(false)}
								onConfirm={onScreenColorConfirm}
							>
								<WheelColorPicker onColorChangeComplete={(color: string) => setOnScreenColor(color)} />
							</ModalComponent>
						</Box>
					</VStack>
				</View>
			</ScrollView>
			<Animated.View
				style={{
					position: "absolute",
					bottom: "5%",
					alignSelf: "center",
					transform: [{ translateY: floatAnim }],
				}}
			>
				<Button
					onPress={() => router.push("/exercise")}
					className="rounded-full w-full"
					variant="solid"
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
