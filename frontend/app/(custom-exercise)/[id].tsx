import { useLocalSearchParams, useRouter } from "expo-router";
import { Animated, ScrollView, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";
import WebView from "react-native-webview";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ArrowRight, CirclePlay, Edit } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Flame, Clock, Brain } from "lucide-react-native";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useDispatch } from "react-redux";
import { setCurrentCustomExercise } from "../../store/data/dataSlice";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import WheelColorPicker from "react-native-wheel-color-picker";
import ModalComponent from "../../components/Modal";
import { Icon } from "@/components/ui/icon";
import FormInput from "../../components/FormInput";
import { i18n } from "../../i18n";

function ExerciseProgram() {
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.customExercises, shallowEqual);
	const exercise = exercises.filter((exercise) => exercise.id === id)[0];
	const floatAnim = useRef(new Animated.Value(0)).current;
	const dispatch = useDispatch();
	dispatch(setCurrentCustomExercise(exercise));
	const router = useRouter();

	const [showOffScreenColorPicker, setShowOffScreenColorPicker] = useState(false);
	const [showOnScreenColorPicker, setShowOnScreenColorPicker] = useState(false);
	const [onScreenColor, setOnScreenColor] = useState("#000000");
	const [offScreenColor, setOffScreenColor] = useState("#FFFFFF");
	const [isEditing, setIsEditing] = useState(false);
	const [durationSettings, setDurationSettings] = useState({
		offScreenTime: "0.5",
		onScreenTime: "0.5",
		exerciseTime: exercise.customizableOptions?.excerciseTime.toString() || "60",
	});

	const handleOffScreenTimeChange = (value: string) => {
		setDurationSettings((prev) => ({ ...prev, offScreenTime: value }));
	};

	const handleOnScreenTimeChange = (value: string) => {
		setDurationSettings((prev) => ({ ...prev, onScreenTime: value }));
	};

	const handleExerciseTimeChange = (value: string) => {
		setDurationSettings((prev) => ({ ...prev, exerciseTime: value }));
	};

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
									const totalMinutes = parseFloat(exercise.customizableOptions?.excerciseTime.toString() || "60");
									const minutes = Math.floor(totalMinutes);
									const seconds = Math.round((totalMinutes - minutes) * 60);
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

						<Heading>{i18n.t("exercise.sections.customization")}</Heading>
						<Box className="bg-secondary-500 p-5 rounded-2xl">
							<VStack space="lg">
								<View>
									<View className="flex-row justify-between items-center">
										<Heading size="md" className="text-primary-500">
											{i18n.t("exercise.sections.durationSettings")}
										</Heading>
										<Button variant="link" onPress={() => setIsEditing(!isEditing)}>
											<ButtonIcon as={Edit} size="md" />
										</Button>
									</View>
									<Divider className="bg-slate-400" />
								</View>

								<FormInput
									inputSize="sm"
									formSize="sm"
									inputType="text"
									label="exercise.form.offScreenTime"
									displayAsRow
									onChange={handleOffScreenTimeChange}
									defaultValue={durationSettings.offScreenTime}
									value={durationSettings.offScreenTime}
									isDisabled={!isEditing}
									suffix="Seconds"
								/>

								<FormInput
									inputSize="sm"
									formSize="sm"
									inputType="text"
									onChange={handleOnScreenTimeChange}
									defaultValue={durationSettings.onScreenTime}
									label="exercise.form.onScreenTime"
									value={durationSettings.onScreenTime}
									displayAsRow
									isDisabled={!isEditing}
									suffix="Seconds"
								/>

								<FormInput
									inputSize="sm"
									formSize="sm"
									inputType="text"
									label="exercise.form.exerciseTime"
									displayAsRow
									onChange={handleExerciseTimeChange}
									defaultValue={durationSettings.exerciseTime}
									value={durationSettings.exerciseTime}
									isDisabled={!isEditing}
									suffix="Seconds"
								/>

								{isEditing && (
									<ButtonGroup className="flex-row self-end">
										<Button variant="outline" onPress={() => setIsEditing(false)} action="secondary" size="md">
											<ButtonText>{i18n.t("general.buttons.cancel")}</ButtonText>
										</Button>
										<Button onPress={() => setIsEditing(!isEditing)} action="primary" size="md">
											<ButtonText>{i18n.t("general.buttons.save")}</ButtonText>
										</Button>
									</ButtonGroup>
								)}
							</VStack>
						</Box>

						<Box className="bg-secondary-500 p-5 rounded-2xl">
							<VStack space="lg">
								<View>
									<Heading size="md" className="text-primary-500">
										{i18n.t("exercise.sections.colorSettings")}
									</Heading>
									<Divider className="bg-slate-400" />
								</View>
								<View className="flex-row justify-between">
									<Heading size="sm">{i18n.t("exercise.form.offScreenColor")}</Heading>
									<Button variant="link" onPress={() => setShowOffScreenColorPicker(true)}>
										<Icon as={ArrowRight} size="md" />
									</Button>
								</View>
								<View className="flex-row justify-between">
									<Heading size="sm">{i18n.t("exercise.form.onScreenColor")}</Heading>
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
					<ButtonText>{i18n.t("exercise.form.startNow")}</ButtonText>
					<ButtonIcon as={CirclePlay} />
				</Button>
			</Animated.View>
		</View>
	);
}

export default ExerciseProgram;
