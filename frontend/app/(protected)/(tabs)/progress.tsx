import { ScrollView, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import TabComponent, { TabItem } from "@/components/Tab";
import { i18n } from "../../i18n";
import { Heading } from "@/components/ui/heading";
import GoalCard from "@/components/GoalCard";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Edit, Target, CheckCircle2, Activity, Calendar } from "lucide-react-native";
import { useRef, useState, useMemo } from "react";
import ModalComponent from "@/components/Modal";
import FormInput from "@/components/FormInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addGoal, deleteGoal, updateGoal } from "@/store/data/dataSaga";
import { fetchWeeklyExerciseStats } from "@/store/auth/authSaga";
import AlertModal from "@/components/AlertModal";
import { useRouter } from "expo-router";
import { MilestoneCardConfig, UserMilestones } from "@/store/auth/authSlice";
import ProgressCard from "@/components/ProgressCard";
import WeeklyWorkoutGoal from "./WeeklyGoal";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
// import NotificationTest from "@/components/NotificationTest";

export const milestoneCardConfigs: MilestoneCardConfig[] = [
	{
		key: "exercisesCompleted",
		headingKey: "milestones.exercisesCompleted.heading",
		descriptionKey: "milestones.exercisesCompleted.description",
		subTextKey: "milestones.exercisesCompleted.subtext",
		goalTarget: 100,
	},
	{
		key: "beginnerExercisesCompleted",
		headingKey: "milestones.beginner.heading",
		descriptionKey: "milestones.beginner.description",
		subTextKey: "milestones.beginner.subtext",
		goalTarget: 20,
	},
	{
		key: "intermediateExercisesCompleted",
		headingKey: "milestones.intermediate.heading",
		descriptionKey: "milestones.intermediate.description",
		subTextKey: "milestones.intermediate.subtext",
		goalTarget: 20,
	},
	{
		key: "advancedExercisesCompleted",
		headingKey: "milestones.advanced.heading",
		descriptionKey: "milestones.advanced.description",
		subTextKey: "milestones.advanced.subtext",
		goalTarget: 20,
	},
	{
		key: "customExercisesCreated",
		headingKey: "milestones.customCreated.heading",
		descriptionKey: "milestones.customCreated.description",
		subTextKey: "milestones.customCreated.subtext",
		goalTarget: 10,
	},
	{
		key: "goalsCreated",
		headingKey: "milestones.goals.heading",
		descriptionKey: "milestones.goals.description",
		subTextKey: "milestones.goals.subtext",
		goalTarget: 5,
	},
	{
		key: "educationalArticlesCompleted",
		headingKey: "milestones.articles.heading",
		descriptionKey: "milestones.articles.description",
		subTextKey: "milestones.articles.subtext",
		goalTarget: 10,
	},
];

function Progress() {
	const appDispatch: AppDispatch = useDispatch();
	const router = useRouter();
	const goals = useSelector((state: RootState) => state.data.goals);
	const routines = useSelector((state: RootState) => state.data.routines || []);
	const weeklyWorkoutGoal = useSelector((state: RootState) => state.data.weeklyWorkoutGoal);
	const userMilestones = useSelector(
		(state: RootState) => state.user.milestones ?? ([] as unknown as UserMilestones)
	);
	const weeklyStats = useSelector((state: RootState) => state.user.weeklyStats);
	const [showAddGoalModal, setShowAddGoalModal] = useState(false);
	const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const newGoalTextValueRef = useRef("");

	// Fetch weekly stats on mount
	useEffect(() => {
		appDispatch(fetchWeeklyExerciseStats());
	}, [appDispatch]);

	// Calculate analytics
	const analytics = useMemo(() => {
		const completedGoals = goals.filter((g) => g.completed).length;
		const totalGoals = goals.length;
		const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

		const totalRoutinesCompleted = routines.reduce((sum, routine) => sum + (routine.completion_count || 0), 0);

		const totalExercises = userMilestones?.exercisesCompleted || 0;
		const beginnerExercises = userMilestones?.beginnerExercisesCompleted || 0;
		const intermediateExercises = userMilestones?.intermediateExercisesCompleted || 0;
		const advancedExercises = userMilestones?.advancedExercisesCompleted || 0;

		const weeklyGoalDays = weeklyWorkoutGoal?.selected_days?.length || 0;

		return {
			goalCompletionRate,
			completedGoals,
			totalGoals,
			totalRoutinesCompleted,
			totalExercises,
			beginnerExercises,
			intermediateExercises,
			advancedExercises,
			weeklyGoalDays,
			hasWeeklyGoal: !!weeklyWorkoutGoal,
		};
	}, [goals, routines, userMilestones, weeklyWorkoutGoal]);

	function handleAddGoal() {
		const trimmed = newGoalTextValueRef.current.trim();
		if (!trimmed) {
			return;
		}

		appDispatch(addGoal({ newGoal: { goal: trimmed, completed: false } }));

		newGoalTextValueRef.current = "";
		setShowAddGoalModal(false);
	}

	function handleDeleteGoal() {
		if (!goalToDelete) {
			return;
		}
		appDispatch(deleteGoal({ goalId: goalToDelete }));
		setGoalToDelete(null);
		setShowDeleteModal(false);
	}

	function handleToggleCheck(goalId: string | null) {
		if (!goalId) {
			return;
		}
		const goalToUpdate = goals.find((goal) => goal.id === goalId);
		if (goalToUpdate) {
			appDispatch(updateGoal({ newGoal: { ...goalToUpdate, completed: !goalToUpdate.completed } }));
		}
	}

	const tabItems: TabItem[] = [
		{
			title: i18n.t("progress.overview"),
			content: (
				<VStack space="xl">
					{/* Analytics Section */}
					<VStack space="lg">
						<Heading size="lg">{i18n.t("progress.analytics.title")}</Heading>
						
						{/* Goal Completion Rate */}
						<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
							<HStack space="md" className="items-center mb-2">
								<Target size={24} color="#6366f1" />
								<Heading size="md">{i18n.t("progress.analytics.goalCompletion")}</Heading>
							</HStack>
							<Text className="text-typography-500 mb-1">
								{analytics.completedGoals} / {analytics.totalGoals} {i18n.t("progress.analytics.goalsCompleted")}
							</Text>
							<View className="w-full h-2 bg-secondary-800 rounded-full overflow-hidden">
								<View
									className="h-full bg-primary-500 rounded-full"
									style={{ width: `${analytics.goalCompletionRate}%` }}
								/>
							</View>
							<Text size="sm" className="text-typography-400 mt-1">
								{analytics.goalCompletionRate}% {i18n.t("progress.analytics.complete")}
							</Text>
						</Box>

						{/* Exercise Summary */}
						<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
							<HStack space="md" className="items-center mb-2">
								<Activity size={24} color="#6366f1" />
								<Heading size="md">{i18n.t("progress.analytics.exerciseSummary")}</Heading>
							</HStack>
							<Text className="text-typography-500 mb-2">
								{analytics.totalExercises} {i18n.t("progress.analytics.totalExercises")}
							</Text>
							<VStack space="xs">
								<HStack className="justify-between">
									<Text size="sm" className="text-typography-400">
										{i18n.t("progress.analytics.beginner")}
									</Text>
									<Text size="sm" className="text-typography-950 font-semibold">
										{analytics.beginnerExercises}
									</Text>
								</HStack>
								<HStack className="justify-between">
									<Text size="sm" className="text-typography-400">
										{i18n.t("progress.analytics.intermediate")}
									</Text>
									<Text size="sm" className="text-typography-950 font-semibold">
										{analytics.intermediateExercises}
									</Text>
								</HStack>
								<HStack className="justify-between">
									<Text size="sm" className="text-typography-400">
										{i18n.t("progress.analytics.advanced")}
									</Text>
									<Text size="sm" className="text-typography-950 font-semibold">
										{analytics.advancedExercises}
									</Text>
								</HStack>
							</VStack>
						</Box>

						{/* Routines Completed */}
						<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
							<HStack space="md" className="items-center mb-2">
								<CheckCircle2 size={24} color="#6366f1" />
								<Heading size="md">{i18n.t("progress.analytics.routinesCompleted")}</Heading>
							</HStack>
							<Text className="text-typography-500">
								{analytics.totalRoutinesCompleted} {i18n.t("progress.analytics.times")}
							</Text>
						</Box>

						{/* Weekly Goal Status */}
						{analytics.hasWeeklyGoal && (
							<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
								<HStack space="md" className="items-center mb-2">
									<Calendar size={24} color="#6366f1" />
									<Heading size="md">{i18n.t("progress.analytics.weeklyGoal")}</Heading>
								</HStack>
								<Text className="text-typography-500">
									{analytics.weeklyGoalDays} {i18n.t("progress.analytics.daysPerWeek")}
								</Text>
							</Box>
						)}

						{/* Weekly Analytics */}
						{weeklyStats && (
							<VStack space="md">
								<Heading size="md">{i18n.t("progress.analytics.weeklyStats")}</Heading>
								
								{/* This Week vs Last Week */}
								<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
									<HStack space="md" className="items-center mb-2">
										<Activity size={24} color="#6366f1" />
										<Heading size="md">{i18n.t("progress.analytics.thisWeek")}</Heading>
									</HStack>
									<Text className="text-typography-950 text-2xl font-bold mb-1">
										{weeklyStats.thisWeek}
									</Text>
									<Text size="sm" className="text-typography-400 mb-2">
										{i18n.t("progress.analytics.exercisesCompleted")}
									</Text>
									{weeklyStats.lastWeek > 0 && (
										<HStack space="xs" className="items-center">
											{weeklyStats.thisWeek > weeklyStats.lastWeek ? (
												<TrendingUp size={16} color="#10b981" />
											) : weeklyStats.thisWeek < weeklyStats.lastWeek ? (
												<TrendingDown size={16} color="#ef4444" />
											) : (
												<Minus size={16} color="#6b7280" />
											)}
											<Text
												size="sm"
												className={
													weeklyStats.thisWeek > weeklyStats.lastWeek
														? "text-green-500"
														: weeklyStats.thisWeek < weeklyStats.lastWeek
														? "text-red-500"
														: "text-typography-400"
												}
											>
												{weeklyStats.thisWeek > weeklyStats.lastWeek ? "+" : ""}
												{weeklyStats.thisWeek - weeklyStats.lastWeek}{" "}
												{i18n.t("progress.analytics.vsLastWeek")}
											</Text>
										</HStack>
									)}
								</Box>

								{/* Today */}
								<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
									<HStack space="md" className="items-center mb-2">
										<Calendar size={24} color="#6366f1" />
										<Heading size="md">{i18n.t("progress.analytics.today")}</Heading>
									</HStack>
									<Text className="text-typography-950 text-2xl font-bold">
										{weeklyStats.today}
									</Text>
									<Text size="sm" className="text-typography-400">
										{i18n.t("progress.analytics.exercisesCompleted")}
									</Text>
								</Box>

								{/* This Month */}
								<Box className="bg-background-500 border-2 border-outline-700 rounded-xl p-4">
									<HStack space="md" className="items-center mb-2">
										<Activity size={24} color="#6366f1" />
										<Heading size="md">{i18n.t("progress.analytics.thisMonth")}</Heading>
									</HStack>
									<Text className="text-typography-950 text-2xl font-bold">
										{weeklyStats.thisMonth}
									</Text>
									<Text size="sm" className="text-typography-400">
										{i18n.t("progress.analytics.exercisesCompleted")}
									</Text>
								</Box>
							</VStack>
						)}
					</VStack>

					{/* Goals Section */}
					<VStack space="lg">
						<Heading size="lg">{i18n.t("progress.goals.customGoalsTitle")}</Heading>

						<Button
							size="lg"
							variant="solid"
							action="primary"
							className="mb-3 rounded-xl"
							onPress={() => setShowAddGoalModal(true)}
						>
							<ButtonText className="text-white">{i18n.t("progress.goals.setGoalButton")}</ButtonText>
							<ButtonIcon as={Edit} size="md" className="text-white" />
						</Button>

						{goals?.map((goal) => (
							<GoalCard
								key={goal.id}
								text={goal.goal}
								onDelete={() => {
									setGoalToDelete(goal.id ?? null);
									setShowDeleteModal(true);
								}}
								onCheck={() => handleToggleCheck(goal.id ?? null)}
							/>
						))}
					</VStack>

					{/* Temporary notification test - remove after testing */}
					{/* <NotificationTest /> */}
				</VStack>
			),
		},
		{
			title: i18n.t("progress.milestones"),
			content: (
				<VStack space="lg">
					{milestoneCardConfigs.map((config) => {
						const rawValue = userMilestones[config.key] ?? 0;
						const progressPercent = config.goalTarget ? Math.min(100, (rawValue / config.goalTarget) * 100) : 0;

						return (
							<ProgressCard
								key={config.key}
								value={progressPercent}
								rawCount={rawValue}
								goalTarget={config.goalTarget}
								headingKey={config.headingKey}
								descriptionKey={config.descriptionKey}
								subTextKey={config.subTextKey}
							/>
						);
					})}
				</VStack>
			),
		},
	];

	return (
		<ScrollView
			showsHorizontalScrollIndicator={false}
			className="bg-background-700 min-h-full"
			contentContainerStyle={{ paddingBottom: 50 }}
		>
			<View className="w-full px-5 mt-5">
				<TabComponent
					tabs={tabItems}
					tabVariant={undefined}
					iconTop={false}
					context="progress"
				/>
			</View>
			<ModalComponent
				isOpen={showAddGoalModal}
				onClose={() => setShowAddGoalModal(false)}
				onConfirm={handleAddGoal}
			>
				<FormInput
					formSize="md"
					label="progress.goals.modal.label"
					placeholder="progress.goals.modal.placeholder"
					inputType="text"
					inputSize="md"
					defaultValue=""
					onChange={(text) => (newGoalTextValueRef.current = text)}
				/>
			</ModalComponent>

			<AlertModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteGoal}
				headingKey="progress.actions.deleteGoal"
				buttonKey="general.buttons.delete"
				action="negative"
				cancelKey={undefined}
			/>
		</ScrollView>
	);
}

export default Progress;
