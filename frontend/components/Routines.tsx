import { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Play, Save, Edit, Trash2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Exercise, CustomExercise, RoutineExercise, Routine } from '../store/data/dataSlice';
import { fetchRoutines, createRoutine, updateRoutineThunk, deleteRoutine } from '../store/data/dataSaga';
import RoutineExerciseCard from './RoutineExerciseCard';
import ExerciseSelectionModal from './ExerciseSelectionModal';
import FormInput from './FormInput';
import ModalComponent from './Modal';
import AlertModal from './AlertModal';
import { i18n } from '../i18n';
import { useRouter } from 'expo-router';

interface RoutinesProps {
	classes?: string;
}

interface RoutineSlot {
	id: string;
	exercise?: Exercise | CustomExercise;
	exerciseType?: 'standard' | 'custom';
}

function Routines (props: RoutinesProps) {
	const dispatch: AppDispatch = useDispatch();
	const { routines, exercises, customExercises } = useSelector(
		(state: RootState) => ({
			routines: state.data.routines || [],
			exercises: state.data.exercises || [],
			customExercises: state.data.customExercises || [],
		}),
		shallowEqual,
	);

	const [slots, setSlots] = useState<RoutineSlot[]>([{ id: '1' }, { id: '2' }, { id: '3' }]);
	const [showExerciseModal, setShowExerciseModal] = useState(false);
	const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
	const [showNameModal, setShowNameModal] = useState(false);
	const [routineName, setRoutineName] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
	const router = useRouter();

	useEffect(() => {
		dispatch(fetchRoutines());
	}, [dispatch]);

	const handleAddExercise = (slotId: string) => {
		setSelectedSlotId(slotId);
		setShowExerciseModal(true);
	};

	const handleSelectExercise = (exercise: Exercise | CustomExercise, exerciseType: 'standard' | 'custom') => {
		if (selectedSlotId) {
			setSlots((prevSlots) =>
				prevSlots.map((slot) => (slot.id === selectedSlotId ? { ...slot, exercise, exerciseType } : slot)),
			);
		}
	};

	const handleRemoveExercise = (slotId: string) => {
		setSlots((prevSlots) => prevSlots.map((slot) => (slot.id === slotId ? { id: slot.id } : slot)));
	};

	const handleAddSlot = () => {
		const newId = (slots.length + 1).toString();
		setSlots((prevSlots) => [...prevSlots, { id: newId }]);
	};

	const handleRemoveSlot = (slotId: string) => {
		if (slots.length > 1) {
			setSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== slotId));
		}
	};

	const handleSaveRoutine = () => {
		const filledSlots = slots.filter((slot) => slot.exercise);
		if (filledSlots.length === 0) {
			// Show error or alert
			return;
		}

		const routineExercises: RoutineExercise[] = filledSlots.map((slot, index) => ({
			exercise_id: slot.exercise!.id,
			exercise_type: slot.exerciseType!,
			order: index + 1,
		}));

		if (isEditing && editingRoutineId) {
			dispatch(
				updateRoutineThunk({
					id: editingRoutineId,
					name: routineName,
					exercises: routineExercises,
				}),
			);
		} else {
			dispatch(
				createRoutine({
					name: routineName,
					exercises: routineExercises,
				}),
			);
		}

		// Reset state
		setRoutineName('');
		setSlots([{ id: '1' }, { id: '2' }, { id: '3' }]);
		setIsEditing(false);
		setEditingRoutineId(null);
		setShowNameModal(false);
	};

	const handleSaveButtonClick = () => {
		// Show the name modal for both creating new and editing
		setShowNameModal(true);
	};

	const handleEditRoutine = (routine: any) => {
		setRoutineName(routine.name);
		setEditingRoutineId(routine.id);
		setIsEditing(true);

		// Convert routine exercises back to slots
		const routineExercises = routine.exercises || [];
		const routineSlots: RoutineSlot[] = routineExercises.map((exercise: any, index: number) => {
			const exerciseData =
				exercise.exercise_type === 'standard'
					? exercises.find((e) => e.id === exercise.exercise_id)
					: customExercises.find((e) => e.id === exercise.exercise_id);

			return {
				id: (index + 1).toString(),
				exercise: exerciseData,
				exerciseType: exercise.exercise_type,
			};
		});

		// Add empty slots if needed
		while (routineSlots.length < 3) {
			routineSlots.push({ id: (routineSlots.length + 1).toString() });
		}

		setSlots(routineSlots);
		// Don't show name modal here - let user click "Save Routine" first
	};

	const handleDeleteRoutine = (routineId: number) => {
		setRoutineToDelete(routineId);
		setShowDeleteModal(true);
	};

	const confirmDeleteRoutine = () => {
		if (routineToDelete) {
			dispatch(deleteRoutine(routineToDelete));
			setRoutineToDelete(null);
			setShowDeleteModal(false);
		}
	};

	const handleStartRoutine = (routine: Routine) => {
		// Navigate to routine execution screen
		router.push(`/(tabs)/routine-execution?routineId=${routine.id}`);
	};

	const handleCreateNew = () => {
		// Reset editing state when creating new
		setIsEditing(false);
		setEditingRoutineId(null);
		setRoutineName('');
		setSlots([{ id: '1' }, { id: '2' }, { id: '3' }]);
		// Open exercise selection modal for the first slot
		setSelectedSlotId('1');
		setShowExerciseModal(true);
	};

	return (
		<VStack space="lg" className={props.classes}>
			<HStack className="justify-between items-center">
				<Heading size="lg">{i18n.t('routines.title')}</Heading>
				<Button size="sm" variant="solid" action="primary" onPress={handleCreateNew}>
					<ButtonText>{i18n.t('routines.createNew')}</ButtonText>
					<ButtonIcon as={Plus} size="sm" />
				</Button>
			</HStack>

			{/* Current Routine Builder */}
			<Card variant="outline" className="p-4">
				<VStack space="md">
					<Heading size="md">{i18n.t('routines.builder.title')}</Heading>

					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<HStack space="md" className="pb-2">
							{slots.map((slot) => (
								<View key={slot.id} className="w-48">
									{slot.exercise ? (
										<RoutineExerciseCard
											exercise={slot.exercise}
											exerciseType={slot.exerciseType!}
											onRemove={() => handleRemoveExercise(slot.id)}
										/>
									) : (
										<Card variant="outline" className="h-32 items-center justify-center border-dashed">
											<VStack space="sm" className="items-center">
												<Icon as={Plus} size="lg" className="text-typography-400" />
												<Text size="sm" className="text-center text-typography-500">
													{i18n.t('routines.builder.addExercise')}
												</Text>
												<Button size="sm" variant="outline" onPress={() => handleAddExercise(slot.id)}>
													<ButtonText>{i18n.t('routines.builder.add')}</ButtonText>
												</Button>
											</VStack>
										</Card>
									)}
								</View>
							))}

							{/* Add/Remove Slot Buttons */}
							<VStack space="sm" className="justify-center">
								<Button size="sm" variant="outline" onPress={handleAddSlot}>
									<ButtonText>{i18n.t('routines.builder.addSlot')}</ButtonText>
								</Button>
								{slots.length > 1 && (
									<Button
										size="sm"
										variant="outline"
										action="negative"
										onPress={() => handleRemoveSlot(slots[slots.length - 1].id)}
									>
										<ButtonText>{i18n.t('routines.builder.removeSlot')}</ButtonText>
									</Button>
								)}
							</VStack>
						</HStack>
					</ScrollView>

					{slots.some((slot) => slot.exercise) && (
						<Button size="lg" variant="solid" action="primary" onPress={handleSaveButtonClick}>
							<ButtonText>
								{isEditing ? i18n.t('routines.builder.updateRoutine') : i18n.t('routines.builder.saveRoutine')}
							</ButtonText>
							<ButtonIcon as={isEditing ? Edit : Save} size="md" />
						</Button>
					)}
				</VStack>
			</Card>

			{/* Saved Routines */}
			{routines && routines.length > 0 && (
				<VStack space="md">
					<Heading size="md">{i18n.t('routines.saved.title')}</Heading>
					{routines.map((routine) => (
						<Card key={routine.id} variant="outline" className="p-4">
							<VStack space="md">
								<HStack className="justify-between items-center">
									<VStack space="xs">
										<Heading size="sm">{routine.name}</Heading>
										<Text size="sm" className="text-typography-500">
											{(routine.exercises || []).length} {i18n.t('routines.saved.exercises')}
										</Text>
										{routine.completion_count > 0 && (
											<Text size="sm" className="text-typography-500">
												{i18n.t('routines.saved.completed')} {routine.completion_count} {i18n.t('routines.saved.times')}
											</Text>
										)}
									</VStack>
									<HStack space="sm">
										<Button size="sm" variant="solid" action="primary" onPress={() => handleStartRoutine(routine)}>
											<ButtonIcon as={Play} size="sm" />
										</Button>
										<Button size="sm" variant="outline" onPress={() => handleEditRoutine(routine)}>
											<ButtonIcon as={Edit} size="sm" />
										</Button>
										<Button
											size="sm"
											variant="outline"
											action="negative"
											onPress={() => handleDeleteRoutine(routine.id)}
										>
											<ButtonIcon as={Trash2} size="sm" />
										</Button>
									</HStack>
								</HStack>
							</VStack>
						</Card>
					))}
				</VStack>
			)}

			{/* Exercise Selection Modal */}
			<ExerciseSelectionModal
				isOpen={showExerciseModal}
				onClose={() => setShowExerciseModal(false)}
				onSelectExercise={handleSelectExercise}
				currentSlots={slots}
			/>

			{/* Routine Name Modal */}
			<ModalComponent
				isOpen={showNameModal}
				onClose={() => {
					setShowNameModal(false);
					setRoutineName('');
					// Don't reset editing state or slots when canceling - let user continue editing
				}}
				onConfirm={handleSaveRoutine}
			>
				<FormInput
					formSize="md"
					label="routines.name.label"
					placeholder="routines.name.placeholder"
					inputType="text"
					inputSize="md"
					defaultValue={routineName}
					onChange={setRoutineName}
				/>
			</ModalComponent>

			{/* Delete Confirmation Modal */}
			<AlertModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={confirmDeleteRoutine}
				headingKey="routines.delete.title"
				buttonKey="general.buttons.delete"
				action="negative"
				cancelKey="general.buttons.cancel"
			/>
		</VStack>
	);
}

export default Routines;
