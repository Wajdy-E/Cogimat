import { useState, useMemo, useRef, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Search } from "lucide-react-native";
import ModalComponent from "./Modal";
import ExerciseCard from "./ExerciseCard";
import CustomExerciseCard from "./CustomExerciseCard";
import {
	Exercise,
	CustomExercise,
	ExerciseDifficulty,
	getExerciseCustomizedOptions,
	setPaywallModalPopup,
} from "@/store/data/dataSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { i18n } from "../i18n";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface ExerciseSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectExercise: (exercise: Exercise | CustomExercise, exerciseType: "standard" | "custom") => void;
	currentSlots?: Array<{ id: string; exercise?: Exercise | CustomExercise; exerciseType?: "standard" | "custom" }>;
}

function ExerciseSelectionModal(props: ExerciseSelectionModalProps) {
	const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");
	const [difficultyFilter, setDifficultyFilter] = useState<ExerciseDifficulty | "all">("all");
	const [searchTrigger, setSearchTrigger] = useState(0); // Used to trigger re-renders
	const searchQueryRef = useRef("");

	const dispatch: AppDispatch = useDispatch();
	const { isSubscribed } = useSubscriptionStatus();
	const exercises = useSelector((state: RootState) => state.data.exercises || []);
	const customExercises = useSelector((state: RootState) => state.data.customExercises || []);
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises);

	// Filter exercises based on search query and difficulty using useMemo for performance
	const filteredStandardExercises = useMemo(() => {
		// Get IDs of already selected exercises
		const selectedExerciseIds =
			props.currentSlots?.filter((slot) => slot.exercise).map((slot) => slot.exercise!.id) || [];

		return exercises.filter((exercise) => {
			const matchesSearch = (exercise.name?.toLowerCase() || "").includes(searchQueryRef.current.toLowerCase());
			const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
			const notAlreadySelected = !selectedExerciseIds.includes(exercise.id);
			// Filter out premium exercises for non-subscribed users
			const isAccessible = !exercise.isPremium || isSubscribed;
			return matchesSearch && matchesDifficulty && notAlreadySelected && isAccessible;
		});
	}, [exercises, searchTrigger, difficultyFilter, props.currentSlots, isSubscribed]); // Added isSubscribed dependency

	const filteredCustomExercises = useMemo(() => {
		// Get IDs of already selected exercises
		const selectedExerciseIds =
			props.currentSlots?.filter((slot) => slot.exercise).map((slot) => slot.exercise!.id) || [];

		return customExercises.filter((exercise) => {
			const matchesSearch = (exercise.name?.toLowerCase() || "").includes(searchQueryRef.current.toLowerCase());
			const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
			const notAlreadySelected = !selectedExerciseIds.includes(exercise.id);
			// Custom exercises are always accessible regardless of premium status
			return matchesSearch && matchesDifficulty && notAlreadySelected;
		});
	}, [customExercises, searchTrigger, difficultyFilter, props.currentSlots]); // Removed isSubscribed dependency

	const handleSelectExercise = (exercise: Exercise | CustomExercise) => {
		// Check if this is a premium standard exercise and user is not subscribed
		// Custom exercises are always accessible regardless of premium status
		if (exercise.isPremium && !isSubscribed && !("customizableOptions" in exercise)) {
			// Show paywall instead of selecting the exercise
			dispatch(setPaywallModalPopup(true));
			return;
		}

		props.onSelectExercise(exercise, activeTab);
		props.onClose();
	};

	const handleSearchChange = useCallback((text: string) => {
		searchQueryRef.current = text;
		// Trigger re-render by updating the trigger state
		setSearchTrigger((prev) => prev + 1);
	}, []);

	return (
		<ModalComponent isOpen={props.isOpen} size="lg" onClose={props.onClose}>
			<VStack space="lg" className="w-full">
				<Heading size="lg">{i18n.t("routines.selectExercise.title")}</Heading>
				{/* Search Input */}
				<Input>
					<InputSlot className="pl-3">
						<InputIcon as={Search} />
					</InputSlot>
					<InputField
						placeholder={i18n.t("routines.selectExercise.searchPlaceholder")}
						onChangeText={handleSearchChange}
					/>
				</Input>

				{/* Difficulty Filter - Horizontal ScrollView */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<HStack space="sm" className="pb-2">
						<Button
							size="sm"
							variant={difficultyFilter === "all" ? "solid" : "outline"}
							onPress={() => setDifficultyFilter("all")}
						>
							<ButtonText>{i18n.t("general.filters.all")}</ButtonText>
						</Button>
						<Button
							size="sm"
							variant={difficultyFilter === ExerciseDifficulty.Beginner ? "solid" : "outline"}
							onPress={() => setDifficultyFilter(ExerciseDifficulty.Beginner)}
						>
							<ButtonText>{i18n.t("exercise.difficulty.beginner")}</ButtonText>
						</Button>
						<Button
							size="sm"
							variant={difficultyFilter === ExerciseDifficulty.Intermediate ? "solid" : "outline"}
							onPress={() => setDifficultyFilter(ExerciseDifficulty.Intermediate)}
						>
							<ButtonText>{i18n.t("exercise.difficulty.intermediate")}</ButtonText>
						</Button>
						<Button
							size="sm"
							variant={difficultyFilter === ExerciseDifficulty.Advanced ? "solid" : "outline"}
							onPress={() => setDifficultyFilter(ExerciseDifficulty.Advanced)}
						>
							<ButtonText>{i18n.t("exercise.difficulty.advanced")}</ButtonText>
						</Button>
					</HStack>
				</ScrollView>

				{/* Tabs - Horizontal ScrollView */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<HStack space="sm" className="pb-2">
						<Button
							size="lg"
							variant={activeTab === "standard" ? "solid" : "outline"}
							action="primary"
							className="min-w-32"
							onPress={() => setActiveTab("standard")}
						>
							<ButtonText>{i18n.t("routines.selectExercise.standardTab")}</ButtonText>
						</Button>
						<Button
							size="lg"
							variant={activeTab === "custom" ? "solid" : "outline"}
							action="primary"
							className="min-w-32"
							onPress={() => setActiveTab("custom")}
						>
							<ButtonText>{i18n.t("routines.selectExercise.customTab")}</ButtonText>
						</Button>
					</HStack>
				</ScrollView>

				{/* Exercise List */}
				<ScrollView className="max-h-96">
					<VStack space="md">
						{activeTab === "standard" ? (
							filteredStandardExercises.length > 0 ? (
								filteredStandardExercises.map((exercise) => (
									<View key={`standard-exercise-${exercise.id}`}>
										<ExerciseCard
											name={exercise.name}
											difficulty={exercise.difficulty}
											time={getExerciseCustomizedOptions(exercise, customizedExercises).exerciseTime.toString()}
											imageFileUrl={exercise.imageFileUrl}
											isFavourited={exercise.isFavourited}
											id={exercise.id}
											exercise={exercise}
											onClick={() => handleSelectExercise(exercise)}
										/>
									</View>
								))
							) : (
								<Text className="text-center text-typography-500">
									{i18n.t("routines.selectExercise.noStandardExercises")}
								</Text>
							)
						) : filteredCustomExercises.length > 0 ? (
							filteredCustomExercises.map((exercise) => (
								<View key={`custom-exercise-${exercise.id}`}>
									<CustomExerciseCard
										name={exercise.name}
										difficulty={exercise.difficulty}
										time={exercise.customizableOptions.exerciseTime.toString()}
										imageFileUrl={exercise.imageFileUrl}
										isFavourited={exercise.isFavourited}
										id={exercise.id}
										exercise={exercise}
										onClick={() => handleSelectExercise(exercise)}
									/>
								</View>
							))
						) : (
							<Text className="text-center text-typography-500">
								{i18n.t("routines.selectExercise.noCustomExercises")}
							</Text>
						)}
					</VStack>
				</ScrollView>
			</VStack>
		</ModalComponent>
	);
}

export default ExerciseSelectionModal;
