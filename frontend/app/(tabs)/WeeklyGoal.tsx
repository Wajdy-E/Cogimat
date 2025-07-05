import { ScrollView, View } from "react-native";
import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import DatePicker from "react-native-date-picker";
import FormCheckboxGroup from "../../components/FormCheckboxGroup";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchWeeklyWorkoutGoal, saveWeeklyWorkoutGoal } from "../../store/data/dataSaga";
import { i18n } from "../../i18n";
import { useAppAlert } from "../../hooks/useAppAlert";
import { useTheme } from "@/components/ui/ThemeProvider";
import { CalendarCheck, Loader } from "lucide-react-native";
import backgroundNotificationService from "../../lib/backgroundNotificationService";

enum days {
	sunday = "Sunday",
	monday = "Monday",
	tuesday = "Tuesday",
	wednesday = "Wednesday",
	thursday = "Thursday",
	friday = "Friday",
	saturday = "Saturday",
}

function WeeklyWorkoutGoal() {
	const dispatch: AppDispatch = useDispatch();
	const { showAlert } = useAppAlert();
	const { weeklyWorkoutGoal } = useSelector((state: RootState) => state.data);
	const { user } = useSelector((state: RootState) => state.user);
	const { theme } = useTheme();
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [date, setDate] = useState(new Date());
	const [isLoading, setIsLoading] = useState(false);

	// Load existing weekly goal on component mount
	useEffect(() => {
		if (user?.baseInfo?.id) {
			dispatch(fetchWeeklyWorkoutGoal());
		}
	}, [dispatch, user?.baseInfo?.id]);

	// Update local state when weekly goal is loaded from Redux
	useEffect(() => {
		if (weeklyWorkoutGoal) {
			setSelectedDays(weeklyWorkoutGoal.selected_days || []);
			if (weeklyWorkoutGoal.reminder_time) {
				const [hours, minutes] = weeklyWorkoutGoal.reminder_time.split(":");
				const reminderDate = new Date();
				reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
				setDate(reminderDate);
			}
		}
	}, [weeklyWorkoutGoal]);

	const handleSelectionChange = (selected: string[]) => {
		setSelectedDays(selected);
	};

	const handleSave = async () => {
		if (selectedDays.length === 0) {
			showAlert({
				title: i18n.t("general.alerts.warning"),
				message: "Please select at least one day for your workout schedule",
				type: "warning",
			});
			return;
		}

		setIsLoading(true);
		try {
			const reminderTime = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;

			await dispatch(
				saveWeeklyWorkoutGoal({
					selected_days: selectedDays,
					reminder_time: reminderTime,
				})
			).unwrap();

			// Schedule notifications for the selected days and time
			if (user?.baseInfo?.id) {
				try {
					await backgroundNotificationService.saveWeeklyGoal({
						clerk_id: user.baseInfo.id,
						selected_days: selectedDays,
						reminder_time: reminderTime,
					});
				} catch (notificationError) {
					console.error("Error scheduling notifications:", notificationError);
					// Don't show error to user as the goal was saved successfully
					// This could happen if expo-device is not available in development
				}
			}

			showAlert({
				title: i18n.t("general.alerts.success"),
				message: i18n.t("progress.weeklyGoal.scheduleSaved"),
				type: "success",
			});
		} catch (error) {
			console.error("Error saving weekly workout goal:", error);
			showAlert({
				title: i18n.t("general.alerts.error"),
				message: i18n.t("progress.weeklyGoal.scheduleError"),
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const options = Object.entries(days).map(([key, value]) => ({
		label: `progress.days.${key.toLowerCase()}`,
		value: value.toLowerCase(),
	}));

	return (
		<ScrollView className="bg-background-700 py-5">
			<VStack space="3xl">
				<Heading>{i18n.t("progress.weeklyGoal.title")}</Heading>
				<FormCheckboxGroup
					options={options}
					value={selectedDays}
					onChange={handleSelectionChange}
					labelLeft
					checkBoxClasses="flex-row justify-between"
				/>
				<View className="flex justify-center items-center">
					<Heading className="self-start text-start">{i18n.t("progress.weeklyGoal.reminderTime")}</Heading>
					<DatePicker date={date} onDateChange={setDate} mode="time" theme={theme} />
				</View>
				<Button size="lg" variant="solid" action="primary" onPress={handleSave} disabled={isLoading}>
					<ButtonText>{isLoading ? i18n.t("general.loading") : i18n.t("progress.weeklyGoal.save")}</ButtonText>
					<ButtonIcon as={isLoading ? Loader : CalendarCheck} />
				</Button>
			</VStack>
		</ScrollView>
	);
}

export default WeeklyWorkoutGoal;
