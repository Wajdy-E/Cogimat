import { ScrollView, View } from "react-native";
import { useState, useMemo, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import DatePicker from "react-native-date-picker";
import FormCheckboxGroup from "../../components/FormCheckboxGroup";
import { VStack } from "@/components/ui/vstack";

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
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [date, setDate] = useState(new Date());

	const handleSelectionChange = (selected: string[]) => {
		setSelectedDays(selected);
	};

	const options = Object.entries(days).map(([key, value]) => ({
		label: `progress.days.${key.toLowerCase()}`,
		value: value.toLowerCase(),
	}));

	return (
		<ScrollView className="bg-background-700 py-5">
			<VStack className="w-[90%] self-center flex" space="3xl">
				<Heading>Set your schedule</Heading>
				<FormCheckboxGroup
					options={options}
					value={selectedDays}
					onChange={handleSelectionChange}
					labelLeft
					checkBoxClasses="flex-row justify-between"
				/>
				<View className="flex justify-center items-center">
					<Heading className="self-start text-start">Time to receive reminder</Heading>
					<DatePicker date={date} onDateChange={setDate} mode="time" theme="dark" />
				</View>
			</VStack>
		</ScrollView>
	);
}

export default WeeklyWorkoutGoal;
