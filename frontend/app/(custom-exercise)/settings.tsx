import { View, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { CustomExercise, Exercise } from "../../store/data/dataSlice";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import AnimatedSwitch from "../../components/AnimatedSwitch";
import { Icon } from "@/components/ui/icon";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { updateCustomExerciseThunk, submitExercise, unsubmitExercise } from "../../store/data/dataSaga";
import AlertModal from "../../components/AlertModal";
import { i18n } from "../../i18n";
import { customExerciseToExercise } from "../../lib/helpers/helpers";
import React from "react";

export default function CustomExerciseSettings() {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const exercises = useCustomExercise(parseInt(id as string)) as CustomExercise;
	const user = useSelector((state: RootState) => state.user.user, shallowEqual);
	const router = useRouter();
	const { themeTextColor } = useTheme();

	const [showSubmitToCogiproAlertModal, setShowSubmitToCogiproAlertModal] = useState(false);
	const [showUnsubmitFromCogiproAlertModal, setShowUnsubmitFromCogiproAlertModal] = useState(false);

	function submitToCogipro() {
		const convertedExercise: Exercise = customExerciseToExercise(exercises);
		dispatch(submitExercise({ exercise: convertedExercise }));
		dispatch(updateCustomExerciseThunk({ ...exercises, publicAccess: true }));
		setShowSubmitToCogiproAlertModal(false);
	}

	function unsubmitFromCogipro() {
		dispatch(unsubmitExercise({ exerciseId: exercises.id, name: exercises.name }));
		dispatch(updateCustomExerciseThunk({ ...exercises, publicAccess: false }));
		setShowUnsubmitFromCogiproAlertModal(false);
	}

	function handleCogiproToggle(value: boolean) {
		if (value && !exercises.publicAccess) {
			// Turning on - show submit alert
			setShowSubmitToCogiproAlertModal(true);
		} else if (!value && exercises.publicAccess) {
			// Turning off - show unsubmit alert
			setShowUnsubmitFromCogiproAlertModal(true);
		}
	}

	if (!user.baseInfo?.isAdmin) {
		return (
			<>
				<View className="flex-row items-center w-full justify-center py-3">
					<View className="flex-row items-center justify-between gap-3 w-[90%]">
						<View className="flex-row items-center gap-3">
							<Button variant="link" onPress={() => router.back()}>
								<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
							</Button>
							<Heading className="text-typography-950" size="2xl">
								{i18n.t("exercise.page.settings")}
							</Heading>
						</View>
					</View>
				</View>
				<View className="flex-1 justify-center items-center">
					<Text>{i18n.t("exercise.page.accessDenied")}</Text>
				</View>
			</>
		);
	}

	return (
		<View className="bg-background-800 h-screen">
			<View className="flex-row items-center w-full justify-center py-3">
				<View className="flex-row items-center justify-between gap-3 w-[90%]">
					<View className="flex-row items-center gap-3">
						<Button variant="link" onPress={() => router.back()}>
							<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
						</Button>
						<Heading className="text-typography-950" size="2xl">
							{i18n.t("exercise.page.settings")}
						</Heading>
					</View>
				</View>
			</View>

			<View className="flex-1 px-5">
				<VStack space="lg">
					<Box className="bg-secondary-500 p-5 rounded-2xl">
						<VStack space="lg">
							<View>
								<Heading size="md" className="text-primary-500">
									{i18n.t("exercise.page.cogiproPremiumSettings")}
								</Heading>
								<Divider className="bg-slate-400" />
							</View>

							<View className="flex-row justify-between items-center">
								<View className="flex-1">
									<Heading size="sm">{i18n.t("exercise.page.submitToCogipro")}</Heading>
									<Text size="xs" className="text-typography-600">
										{i18n.t("exercise.page.submitToCogiproDescription")}
									</Text>
								</View>
								<AnimatedSwitch
									defaultValue={exercises.publicAccess}
									onChange={handleCogiproToggle}
									onIcon={<Icon as={Eye} />}
									offIcon={<Icon as={EyeOff} />}
									height={25}
									thumbSize={20}
								/>
							</View>
						</VStack>
					</Box>
				</VStack>
			</View>

			<AlertModal
				isOpen={showSubmitToCogiproAlertModal}
				onClose={() => setShowSubmitToCogiproAlertModal(false)}
				headingKey="exercise.page.submitToCogipro"
				textKey="exercise.page.submitToCogiproMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={submitToCogipro}
				action="primary"
			/>

			<AlertModal
				isOpen={showUnsubmitFromCogiproAlertModal}
				onClose={() => setShowUnsubmitFromCogiproAlertModal(false)}
				headingKey="exercise.page.unsubmitFromCogipro"
				textKey="exercise.page.unsubmitFromCogiproMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={unsubmitFromCogipro}
				action="negative"
			/>
		</View>
	);
}
