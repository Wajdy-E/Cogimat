import { ScrollView, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import AnimatedTab from '../../components/AnimatedTabs';
import { i18n } from '../../i18n';
import { Heading } from '@/components/ui/heading';
import GoalCard from '../../components/GoalCard';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Edit } from 'lucide-react-native';
import { useRef, useState } from 'react';
import ModalComponent from '../../components/Modal';
import FormInput from '../../components/FormInput';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { addGoal, deleteGoal, updateGoal } from '../../store/data/dataSaga';
import AlertModal from '../../components/AlertModal';
import { useRouter } from 'expo-router';
import { MilestoneCardConfig, UserMilestones } from '../../store/auth/authSlice';
import ProgressCard from '../../components/ProgressCard';
import WeeklyWorkoutGoal from './WeeklyGoal';
import Routines from '../../components/Routines';
// import NotificationTest from "../../components/NotificationTest";

export const milestoneCardConfigs: MilestoneCardConfig[] = [
	{
		key: 'exercisesCompleted',
		headingKey: 'milestones.exercisesCompleted.heading',
		descriptionKey: 'milestones.exercisesCompleted.description',
		subTextKey: 'milestones.exercisesCompleted.subtext',
		goalTarget: 100,
	},
	{
		key: 'beginnerExercisesCompleted',
		headingKey: 'milestones.beginner.heading',
		descriptionKey: 'milestones.beginner.description',
		subTextKey: 'milestones.beginner.subtext',
		goalTarget: 20,
	},
	{
		key: 'intermediateExercisesCompleted',
		headingKey: 'milestones.intermediate.heading',
		descriptionKey: 'milestones.intermediate.description',
		subTextKey: 'milestones.intermediate.subtext',
		goalTarget: 20,
	},
	{
		key: 'advancedExercisesCompleted',
		headingKey: 'milestones.advanced.heading',
		descriptionKey: 'milestones.advanced.description',
		subTextKey: 'milestones.advanced.subtext',
		goalTarget: 20,
	},
	{
		key: 'customExercisesCreated',
		headingKey: 'milestones.customCreated.heading',
		descriptionKey: 'milestones.customCreated.description',
		subTextKey: 'milestones.customCreated.subtext',
		goalTarget: 10,
	},
	{
		key: 'goalsCreated',
		headingKey: 'milestones.goals.heading',
		descriptionKey: 'milestones.goals.description',
		subTextKey: 'milestones.goals.subtext',
		goalTarget: 5,
	},
	{
		key: 'educationalArticlesCompleted',
		headingKey: 'milestones.articles.heading',
		descriptionKey: 'milestones.articles.description',
		subTextKey: 'milestones.articles.subtext',
		goalTarget: 10,
	},
];

function Progress () {
	const appDispatch: AppDispatch = useDispatch();
	const router = useRouter();
	const goals = useSelector((state: RootState) => state.data.goals);
	const userMilestones = useSelector((state: RootState) => state.user.milestones ?? ([] as unknown as UserMilestones));
	const [showAddGoalModal, setShowAddGoalModal] = useState(false);
	const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const newGoalTextValueRef = useRef('');

	function handleAddGoal () {
		const trimmed = newGoalTextValueRef.current.trim();
		if (!trimmed) {
			return;
		}

		appDispatch(addGoal({ newGoal: { goal: trimmed, completed: false } }));

		newGoalTextValueRef.current = '';
		setShowAddGoalModal(false);
	}

	function handleDeleteGoal () {
		if (!goalToDelete) {
			return;
		}
		appDispatch(deleteGoal({ goalId: goalToDelete }));
		setGoalToDelete(null);
		setShowDeleteModal(false);
	}

	function handleToggleCheck (goalId: string | null) {
		if (!goalId) {
			return;
		}
		const goalToUpdate = goals.find((goal) => goal.id === goalId);
		if (goalToUpdate) {
			appDispatch(updateGoal({ newGoal: { ...goalToUpdate, completed: !goalToUpdate.completed } }));
		}
	}

	const tabs = [
		<VStack space="xl">
			<Routines />
			<Heading size="lg">{i18n.t('progress.goals.customGoalsTitle')}</Heading>

			<Button size="lg" variant="solid" action="primary" className="mb-3" onPress={() => setShowAddGoalModal(true)}>
				<ButtonText>{i18n.t('progress.goals.setGoalButton')}</ButtonText>
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

			<WeeklyWorkoutGoal />

			{/* Temporary notification test - remove after testing */}
			{/* <NotificationTest /> */}
		</VStack>,

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
		</VStack>,
	];

	return (
		<ScrollView
			showsHorizontalScrollIndicator={false}
			className="bg-background-700 min-h-full"
			contentContainerStyle={{ paddingBottom: 50 }}
		>
			<View className="w-[90%] self-center">
				<View className="mt-5 flex self-center">
					<AnimatedTab options={[i18n.t('progress.overview'), i18n.t('progress.milestones')]} content={tabs} />
				</View>
			</View>
			<ModalComponent isOpen={showAddGoalModal} onClose={() => setShowAddGoalModal(false)} onConfirm={handleAddGoal}>
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
