import { ScrollView, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import AnimatedTab from "../../components/AnimatedTabs";
import { i18n } from "../../i18n";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import GoalCard from "../../components/GoalCard";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Edit } from "lucide-react-native";
import { useEffect, useState } from "react";
import ModalComponent from "../../components/Modal";
import FormInput from "../../components/FormInput";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { addGoal, deleteGoal, updateGoal } from "../../store/data/dataSaga";
import { clearGoals } from "../../store/data/dataSlice";
import AlertModal from "../../components/AlertModal";

function Progress() {
	const appDispatch: AppDispatch = useDispatch();
	const goals = useSelector((state: RootState) => state.data.goals);
	const [showAddGoalModal, setShowAddGoalModal] = useState(false);
	const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [newGoalText, setNewGoalText] = useState("");

	function handleAddGoal() {
		if (!newGoalText.trim()) return;

		appDispatch(
			addGoal({
				newGoal: {
					goal: newGoalText,
					completed: false,
				},
			})
		);

		setNewGoalText("");
		setShowAddGoalModal(false);
	}

	function handleDeleteGoal() {
		if (!goalToDelete) return;
		appDispatch(deleteGoal({ goalId: goalToDelete }));
		setGoalToDelete(null);
		setShowDeleteModal(false);
	}

	function handleToggleCheck(goalId: string | null) {
		if (!goalId) return;
		const goalToUpdate = goals.find((goal) => goal.id === goalId);
		if (goalToUpdate) {
			appDispatch(
				updateGoal({
					newGoal: { ...goalToUpdate, completed: !goalToUpdate.completed },
				})
			);
		}
	}

	const tabs = [
		<View>
			<VStack space="xl">
				<Grid
					className="gap-5"
					_extra={{
						className: "grid-cols-12",
					}}
				>
					<GridItem className="flex items-center" _extra={{ className: "col-span-6" }}>
						<Heading size="sm">{i18n.t("progress.goals.workouts")}</Heading>
						<Text>0</Text>
					</GridItem>
					<GridItem className="flex items-center" _extra={{ className: "col-span-6" }}>
						<Heading size="sm">{i18n.t("progress.goals.milestones")}</Heading>
						<Text>0</Text>
					</GridItem>
					<GridItem className="flex items-center" _extra={{ className: "col-span-6" }}>
						<Heading size="sm">{i18n.t("progress.goals.weeklyGoal")}</Heading>
						<Text>0</Text>
					</GridItem>
					<GridItem className="flex items-center" _extra={{ className: "col-span-6" }}>
						<Heading size="sm">{i18n.t("progress.goals.tbd")}</Heading>
						<Text>0</Text>
					</GridItem>
				</Grid>

				<Heading size="lg">{i18n.t("progress.goals.customGoalsTitle")}</Heading>

				<Button size="lg" variant="solid" action="primary" className="mb-3" onPress={() => setShowAddGoalModal(true)}>
					<ButtonText>{i18n.t("progress.goals.setGoalButton")}</ButtonText>
					<ButtonIcon as={Edit} size="md" />
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
		</View>,

		<Text>to be determined Content</Text>,
	];

	return (
		<ScrollView showsHorizontalScrollIndicator={false} className="bg-background-700">
			<View className="w-[90%] self-center mt-5">
				<AnimatedTab options={["Tab A", "Tab B"]} content={tabs} />
			</View>

			<ModalComponent onClose={() => setShowAddGoalModal(false)} isOpen={showAddGoalModal} onConfirm={handleAddGoal}>
				<FormInput
					formSize="md"
					label="progress.goals.modal.label"
					placeholder="progress.goals.modal.placeholder"
					inputType="text"
					inputSize="md"
					value={newGoalText}
					onChange={(text) => setNewGoalText(text)}
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
