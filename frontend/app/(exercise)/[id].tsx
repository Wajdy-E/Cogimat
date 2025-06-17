import React, { useEffect, useRef, useState } from "react";

import { Animated, ScrollView, View } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import WebView from "react-native-webview";
import WheelColorPicker from "react-native-wheel-color-picker";
import { ArrowRight, CirclePlay, Edit, Rocket, Sprout, Trophy } from "lucide-react-native";
import { Flame, Clock, Brain } from "lucide-react-native";
import { shallowEqual } from "react-redux";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import CustomSlider from "../../components/CustomSlider";
import ModalComponent from "../../components/Modal";
import {
	CustomizableExerciseOptions,
	ExerciseDifficulty,
	setCurrentExercise,
	updateExercise,
} from "../../store/data/dataSlice";
import { RootState } from "../../store/store";
import { i18n } from "../../i18n";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import PaywallDrawer from "../../components/PaywallDrawer";
import AlertModal from "../../components/AlertModal";

function ExerciseProgram() {
	const dispatch = useDispatch();
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);
	const exercise = exercises.filter((exercise) => exercise.id === id)[0];
	const { isSubscribed } = useSubscriptionStatus();

	useEffect(() => {
		if (exercise) {
			dispatch(setCurrentExercise(exercise));
		}
	}, [exercise]);

	const floatAnim = useRef(new Animated.Value(0)).current;
	const router = useRouter();
	const [showOffScreenColorPicker, setShowOffScreenColorPicker] = useState(false);
	const [showOnScreenColorPicker, setShowOnScreenColorPicker] = useState(false);
	const [onScreenColor, setOnScreenColor] = useState("#000000");
	const [offScreenColor, setOffScreenColor] = useState("#ffffff");
	const [isEditing, setIsEditing] = useState(false);
	const [durationSettings, setDurationSettings] = useState<CustomizableExerciseOptions | undefined>(
		exercise.customizableOptions
	);

	function handleColorConfirm(type: "onScreen" | "offScreen") {
		if (durationSettings) {
			const color = type === "onScreen" ? onScreenColor : offScreenColor;
			dispatch(
				updateExercise({ ...durationSettings, [type === "onScreen" ? "onScreenColor" : "offScreenColor"]: color })
			);
		}

		setShowOnScreenColorPicker(type === "onScreen" ? false : showOnScreenColorPicker);
		setShowOffScreenColorPicker(type === "offScreen" ? false : showOffScreenColorPicker);
	}

	function onDurationSettingsUpdated() {
		if (durationSettings) {
			dispatch(updateExercise({ ...durationSettings }));
		}

		setIsEditing((prev) => !prev);
	}
	function getIconForType(difficulty: ExerciseDifficulty) {
		return difficulty === ExerciseDifficulty.Beginner
			? Sprout
			: difficulty === ExerciseDifficulty.Intermediate
				? Rocket
				: Trophy;
	}

	useEffect(() => {
		setDurationSettings(exercise.customizableOptions);
	}, [exercise.customizableOptions]);

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

	const handleStartExercise = () => {
		router.navigate({
			pathname: "/exercise",
			params: {
				data: JSON.stringify(exercise),
			},
		});
	};

	const onEditClick = () => {
		setIsEditing(!isEditing);
	};

	return (
		<>
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
						<VStack className="w-[90%]" space="lg">
							<View className="flex-row flex-wrap justify-start gap-4">
								<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
									<BadgeIcon as={getIconForType(exercise.difficulty)} />
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

							<Heading size="lg">{i18n.t("exercise.page.description")}</Heading>
							<Text>{exercise.description}</Text>
							<Heading size="lg">{i18n.t("exercise.page.instructions")}</Heading>
							<Text>{exercise.instructions}</Text>

							<Heading>{i18n.t("exercise.sections.customization")}</Heading>
							<Box className="bg-secondary-500 p-5 rounded-2xl">
								<VStack space="lg" className="pb-3">
									<View>
										<View className="flex-row justify-between items-center">
											<Heading size="md" className="text-primary-500">
												{i18n.t("exercise.sections.durationSettings")}
											</Heading>
											<Button variant="link" onPress={onEditClick}>
												<ButtonIcon as={Edit} size="md" />
											</Button>
										</View>
										<Divider className="bg-slate-400" />
									</View>
									<VStack space="3xl" className={`${!isEditing ? "opacity-70" : ""}`}>
										{Object.entries(durationSettings || {}).map(([key, value]) =>
											key !== "onScreenColor" && key !== "offScreenColor" ? (
												<CustomSlider
													key={key}
													title={`exercise.form.${key}`}
													size="md"
													minValue={key === "exerciseTime" ? 1 : 0.5}
													maxValue={key === "exerciseTime" ? 5 : 15}
													step={key === "exerciseTime" ? 0.5 : 0.1}
													value={parseFloat(value.toString())}
													defaultValue={parseFloat(value.toString())}
													suffix={key === "exerciseTime" ? "general.time.minutes" : "general.time.seconds"}
													isReadOnly={!isEditing}
													onChange={(newValue) =>
														setDurationSettings((prev) =>
															prev
																? {
																		...prev,
																		[key]: newValue.toString(),
																	}
																: undefined
														)
													}
												/>
											) : null
										)}
									</VStack>
									{isEditing && (
										<ButtonGroup className="flex-row self-end py-3">
											<Button variant="outline" onPress={() => setIsEditing(false)} action="secondary" size="md">
												<ButtonText>{i18n.t("general.buttons.cancel")}</ButtonText>
											</Button>
											<Button onPress={onDurationSettingsUpdated} action="primary" size="md">
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
										<Heading size="sm">{i18n.t("exercise.form.offScreenColor", { offScreenColor })}</Heading>
										<Button variant="link" onPress={() => setShowOffScreenColorPicker(true)}>
											<Icon as={ArrowRight} size="md" />
										</Button>
									</View>
									<View className="flex-row justify-between">
										<Heading size="sm">{i18n.t("exercise.form.onScreenColor", { onScreenColor })}</Heading>
										<Button variant="link" onPress={() => setShowOnScreenColorPicker(true)}>
											<Icon as={ArrowRight} size="md" />
										</Button>
									</View>
								</VStack>

								<ModalComponent
									isOpen={showOffScreenColorPicker}
									onClose={() => setShowOffScreenColorPicker(false)}
									onConfirm={() => handleColorConfirm("offScreen")}
								>
									<WheelColorPicker onColorChangeComplete={(color: string) => setOffScreenColor(color)} />
								</ModalComponent>

								<ModalComponent
									isOpen={showOnScreenColorPicker}
									onClose={() => setShowOnScreenColorPicker(false)}
									onConfirm={() => handleColorConfirm("onScreen")}
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
						onPress={handleStartExercise}
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
		</>
	);
}

export default ExerciseProgram;
