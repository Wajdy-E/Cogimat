import { ScrollView } from "react-native";
import { useState, useMemo, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { i18n } from "../../i18n";
import { useExercise } from "@/hooks/useExercise";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import ExerciseCard from "../../components/ExerciseCard";
import CustomExerciseCard from "../../components/CustomExerciseCard";
import { Exercise, CustomExercise, ExerciseDifficulty, FilterType, setCurrentFilter } from "../../store/data/dataSlice";
import FormSelect from "../../components/FormSelect";
import { Checkbox, CheckboxGroup, CheckboxIndicator, CheckboxLabel, CheckboxIcon } from "@/components/ui/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { CheckIcon } from "@/components/ui/icon";

type UnifiedExercise = (Exercise & { isCustom: false }) | (CustomExercise & { isCustom: true });

function AllExercises() {
	const exercises = useExercise(null) as Exercise[];
	const customExercises = useCustomExercise(null) as CustomExercise[];
	const dispatch = useDispatch();

	const activeFilter = useSelector((state: RootState) => state.data.currentFilter);
	const [showSources, setShowSources] = useState(activeFilter);

	const [showOnlyFavourited, setShowOnlyFavourited] = useState(false);
	const [difficultyFilter, setDifficultyFilter] = useState<ExerciseDifficulty | "All">("All");
	const [sortAlpha, setSortAlpha] = useState<"asc" | "desc">("asc");

	const filteredExercises = useMemo(() => {
		let all: UnifiedExercise[] = [];

		if (showSources.includes(FilterType.Standard)) {
			all = all.concat(exercises.map((e) => ({ ...e, isCustom: false })));
		}
		if (showSources.includes(FilterType.Custom)) {
			all = all.concat(customExercises.map((e) => ({ ...e, isCustom: true })));
		}
		if (difficultyFilter !== "All") {
			all = all.filter((e) => e.difficulty === difficultyFilter);
		}
		if (showOnlyFavourited) {
			all = all.filter((e) => e.isFavourited);
		}
		all = all.sort((a, b) => (sortAlpha === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
		return all;
	}, [exercises, customExercises, showSources, showOnlyFavourited, difficultyFilter, sortAlpha]);

	const difficultyOptions = [
		{ label: "general.filters.all", value: "all" },
		{ label: "exercise.difficulty.beginner", value: "Beginner" },
		{ label: "exercise.difficulty.intermediate", value: "Intermediate" },
		{ label: "exercise.difficulty.advanced", value: "Advanced" },
	];

	const sortOptions: { label: string; value: "asc" | "desc" }[] = [
		{ label: "general.filters.sortAZ", value: "asc" },
		{ label: "general.filters.sortZA", value: "desc" },
	];

	const onCheckBoxGroup = (isSelected: any) => {
		dispatch(setCurrentFilter(isSelected));
		setShowSources(isSelected);
	};

	useEffect(() => {
		setShowSources(activeFilter);
	}, [activeFilter]);

	return (
		<ScrollView className="bg-background-700">
			<VStack space="lg" className="my-6 w-[90%] self-center">
				<HStack space="lg" className="flex-row flex-wrap self-end">
					<FormSelect
						{...({
							title: "general.filters.difficulty",
							options: difficultyOptions,
							selectedValue: difficultyFilter,
							onValueChange: (val: any) => setDifficultyFilter(val as ExerciseDifficulty | "All"),
							variant: "rounded",
							size: "md",
							placeholder: i18n.t("general.filters.difficulty"),
							className: "flex-row items-center gap-2",
							labelSize: "lg",
						} as any)}
					/>

					<FormSelect
						{...({
							title: "general.filters.sort",
							options: sortOptions,
							selectedValue: sortAlpha,
							onValueChange: (val: any) => setSortAlpha(val as "asc" | "desc"),
							variant: "rounded",
							size: "md",
							placeholder: i18n.t("general.filters.sort"),
							className: "flex-row items-center gap-2",
							labelSize: "lg",
						} as any)}
					/>
				</HStack>
				<HStack space="md" className="flex-row flex-wrap self-center">
					<CheckboxGroup value={showSources} onChange={onCheckBoxGroup}>
						<HStack space="lg">
							<Checkbox value="standard">
								<CheckboxIndicator>
									<CheckboxIcon as={CheckIcon} />
								</CheckboxIndicator>
								<CheckboxLabel>{i18n.t("general.filters.standard")}</CheckboxLabel>
							</Checkbox>
							<Checkbox value="custom">
								<CheckboxIndicator>
									<CheckboxIcon as={CheckIcon} />
								</CheckboxIndicator>
								<CheckboxLabel>{i18n.t("general.filters.custom")}</CheckboxLabel>
							</Checkbox>
						</HStack>
					</CheckboxGroup>

					<Checkbox isChecked={showOnlyFavourited} onChange={setShowOnlyFavourited} value="favourite">
						<CheckboxIndicator>
							<CheckboxIcon as={CheckIcon} />
						</CheckboxIndicator>
						<CheckboxLabel>{i18n.t("general.filters.favouritesOnly")}</CheckboxLabel>
					</Checkbox>
				</HStack>
			</VStack>

			<VStack space="md" className="items-center mb-10">
				{filteredExercises.map((ex) =>
					ex.isCustom ? (
						<CustomExerciseCard
							key={`custom-${ex.id}`}
							name={ex.name}
							imageFileUrl={ex.imageFileUrl}
							time={ex.customizableOptions?.exerciseTime.toString()}
							difficulty={ex.difficulty}
							id={ex.id}
							exercise={ex}
							isFavourited={ex.isFavourited}
							variant="elevated"
							classes="w-[90%]"
						/>
					) : (
						<ExerciseCard
							key={`standard-${ex.id}`}
							name={ex.name}
							imageFileUrl={ex.imageFileUrl}
							time={ex.timeToComplete}
							difficulty={ex.difficulty}
							id={ex.id}
							exercise={ex}
							isFavourited={ex.isFavourited}
							variant="elevated"
							classes="w-[90%]"
						/>
					)
				)}

				{filteredExercises.length === 0 && (
					<Text className="text-center text-muted-foreground mt-6">{i18n.t("general.noExercisesFound")}</Text>
				)}
			</VStack>
		</ScrollView>
	);
}

export default AllExercises;
