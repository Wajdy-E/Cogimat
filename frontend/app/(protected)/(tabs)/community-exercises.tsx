import { ScrollView } from "react-native";
import { useState, useMemo, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { i18n } from "../../i18n";
import CustomExerciseCard from "@/components/CustomExerciseCard";
import { CustomExercise, ExerciseDifficulty } from "@/store/data/dataSlice";
import FormSelect from "@/components/FormSelect";
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon } from "@/components/ui/checkbox";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { CheckIcon } from "@/components/ui/icon";
import { getPublicExercises } from "@/store/data/dataSaga";

function CommunityExercises() {
	const dispatch: AppDispatch = useDispatch();
	const publicExercises = useSelector((state: RootState) => state.data.publicExercises);

	const [showOnlyFavourited, setShowOnlyFavourited] = useState(false);
	const [difficultyFilter, setDifficultyFilter] = useState<ExerciseDifficulty | "all">("all");
	const [sortAlpha, setSortAlpha] = useState<"asc" | "desc">("asc");

	// Fetch public exercises when component mounts
	useEffect(() => {
		dispatch(getPublicExercises());
	}, [dispatch]);

	const filteredExercises = useMemo(() => {
		let all: CustomExercise[] = [...publicExercises];

		if (difficultyFilter !== "all") {
			all = all.filter((e) => e.difficulty === difficultyFilter);
		}
		if (showOnlyFavourited) {
			all = all.filter((e) => e.isFavourited);
		}
		all = all.sort((a, b) => (sortAlpha === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
		return all;
	}, [publicExercises, showOnlyFavourited, difficultyFilter, sortAlpha]);

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

	return (
		<ScrollView className="bg-background-700">
			<VStack space="lg" className="my-6 w-[90%] self-center">
				<HStack space="lg" className="flex-row flex-wrap self-end">
					<FormSelect
						{...({
							title: "general.filters.difficulty",
							options: difficultyOptions,
							onValueChange: (val: any) => setDifficultyFilter(val as ExerciseDifficulty | "all"),
							defaultValue: i18n.t("general.filters.all"),
							variant: "rounded",
							size: "md",
							placeholder: i18n.t("general.filters.all"),
							className: "flex-row items-center gap-2",
							labelSize: "lg",
						} as any)}
					/>

					<FormSelect
						{...({
							title: "general.filters.sort",
							options: sortOptions,
							onValueChange: (val: any) => setSortAlpha(val as "asc" | "desc"),
							defaultValue: i18n.t("general.filters.sortAZ"),
							variant: "rounded",
							size: "md",
							placeholder: i18n.t("general.filters.sortAZ"),
							className: "flex-row items-center gap-2",
							labelSize: "lg",
						} as any)}
					/>
				</HStack>

				<HStack space="md" className="flex-row flex-wrap self-end">
					<Checkbox isChecked={showOnlyFavourited} onChange={setShowOnlyFavourited} value="favourite">
						<CheckboxIndicator>
							<CheckboxIcon as={CheckIcon} />
						</CheckboxIndicator>
						<CheckboxLabel>{i18n.t("general.filters.favouritesOnly")}</CheckboxLabel>
					</Checkbox>
				</HStack>
			</VStack>

			<VStack space="md" className="items-center mb-10">
				{filteredExercises.map((exercise) => (
					<CustomExerciseCard
						key={`community-${exercise.id}`}
						name={exercise.name}
						imageFileUrl={exercise.imageFileUrl}
						time={exercise.customizableOptions.exerciseTime.toString()}
						difficulty={exercise.difficulty}
						id={exercise.id}
						exercise={exercise}
						isFavourited={exercise.isFavourited}
						variant="elevated"
						classes="w-[90%]"
						isCommunityExercise={true}
					/>
				))}

				{filteredExercises.length === 0 && (
					<Text className="text-center text-muted-foreground mt-6">{i18n.t("general.noExercisesFound")}</Text>
				)}
			</VStack>
		</ScrollView>
	);
}

export default CommunityExercises;
