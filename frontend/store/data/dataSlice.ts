import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NumberEnum, Letter, Shape, Color, ColorOption, ShapeOption } from "../../data/program/Program";

export interface Exercise {
	id: number;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	description: string;
	timeToComplete: string;
	instructions: string;
	parameters: ExerciseParameters;
	videoUrl: string;
	imageFileUrl: string;
	isFavourited: boolean;
	focus: string;
	isChallenge: boolean;
	customizableOptions?: CustomizableExerciseOptions;
	isPremium?: boolean;
	youtubeUrl?: string;
}

export interface CustomizableExerciseOptions {
	parameters?: ExerciseParameters;
	offScreenTime: number;
	onScreenTime: number;
	exerciseTime: number;
}

export interface CustomExercise {
	id: number;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	description: string;
	instructions: string;
	parameters: ExerciseParameters;
	videoUrl?: string;
	imageFileUrl?: string;
	isFavourited: boolean;
	focus?: string[];
	publicAccess: boolean;
	youtubeUrl?: string;
	customizableOptions: CustomizableExerciseOptions;
}

export interface ExerciseParameters {
	shapes?: Shape[];
	colors?: ColorOption[] | Color[];
	numbers?: NumberEnum[];
	letters?: Letter[];
}

export enum ExerciseDifficulty {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
}

export enum FilterType {
	Standard = "standard",
	Custom = "custom",
	Community = "community",
}

export interface Goals {
	goal: string;
	id?: string;
	completed: boolean;
}

export interface WeeklyWorkoutGoal {
	id?: number;
	clerk_id: string;
	selected_days: string[];
	reminder_time: string; // HH:MM:SS format
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface RoutineExercise {
	exercise_id: number;
	exercise_type: "standard" | "custom";
	order: number;
}

export interface Routine {
	id: number;
	clerk_id: string;
	name: string;
	description?: string;
	exercises: RoutineExercise[];
	is_active: boolean;
	created_at: string;
	updated_at: string;
	last_completed_at?: string;
	completion_count: number;
}

export interface PopupStates {
	customExerciseModalIsOpen: boolean;
	paywallIsOpen: boolean;
	routineModalIsOpen: boolean;
}

export interface RoutineExecutionState {
	currentExerciseIndex: number;
	completedExercises: number[];
	isRoutineComplete: boolean;
	showCountdown: boolean;
	hasProcessedCompletion: boolean;
}

export interface DataState {
	exercises: Exercise[];
	selectedExercise: Exercise | CustomExercise | null;
	progress: Record<number, any>;
	goals: Goals[];
	customExercises: CustomExercise[];
	currentFilter: FilterType[];
	publicExercises: CustomExercise[];
	customizedExercises: Record<number, CustomizableExerciseOptions>;
	routines: Routine[];
	popupStates: PopupStates;
	weeklyWorkoutGoal: WeeklyWorkoutGoal | null;
	routineExecution: RoutineExecutionState | null;
}

const initialState: DataState = {
	exercises: [],
	selectedExercise: null,
	progress: {},
	goals: [],
	customExercises: [],
	currentFilter: [FilterType.Standard],
	publicExercises: [],
	customizedExercises: {} as Record<number, CustomizableExerciseOptions>,
	routines: [],
	popupStates: {
		customExerciseModalIsOpen: false,
		paywallIsOpen: false,
		routineModalIsOpen: false,
	},
	weeklyWorkoutGoal: null,
	routineExecution: null,
};

const dataSlice = createSlice({
	name: "exercises",
	initialState,
	reducers: {
		setExercises(state, action: PayloadAction<Exercise[]>) {
			state.exercises = action.payload;
		},
		setCurrentExercise(state, { payload }: PayloadAction<Exercise | CustomExercise | null>) {
			state.selectedExercise = payload;
		},
		addExercise(state, { payload }: PayloadAction<Exercise>) {
			state.exercises.push(payload);
		},
		selectExercise(state, action: PayloadAction<number>) {
			const exercise = state.exercises.find((ex) => ex.id === action.payload);
			state.selectedExercise = exercise || null;
		},
		updateExercise(state, { payload }: PayloadAction<CustomizableExerciseOptions>) {
			if (state.selectedExercise && "publicAccess"! in state.selectedExercise) {
				state.selectedExercise.customizableOptions = payload;

				const exerciseIndex = state.exercises.findIndex((ex) => ex.id === state.selectedExercise?.id);
				if (exerciseIndex !== -1) {
					state.exercises[exerciseIndex] = state.selectedExercise as unknown as Exercise;
				}
			}
		},
		updateCustomOptions(state, action) {
			const { id, options } = action.payload;
			state.customizedExercises[id] = options;
		},
		updateProgress(state, action: PayloadAction<{ exerciseId: number; progress: any }>) {
			state.progress[action.payload.exerciseId] = action.payload.progress;
		},
		setIsFavourite(state, { payload }: PayloadAction<{ exerciseId: number; isFavourite: boolean }>) {
			const exerciseIndex = state.exercises.findIndex((exercise) => exercise.id === payload.exerciseId);
			if (exerciseIndex !== -1) {
				state.exercises[exerciseIndex].isFavourited = !state.exercises[exerciseIndex].isFavourited;
			}
		},
		setCustomExerciseIsFavourite(state, { payload }: PayloadAction<{ exerciseId: number; isFavourite: boolean }>) {
			const exerciseIndex = state.customExercises.findIndex((exercise) => exercise.id === payload.exerciseId);
			if (exerciseIndex !== -1) {
				state.customExercises[exerciseIndex].isFavourited = !state.customExercises[exerciseIndex].isFavourited;
			}
		},
		setPublicExerciseFavourite(state, { payload }: PayloadAction<{ exerciseId: number; isFavourite: boolean }>) {
			const exerciseIndex = state.publicExercises.findIndex((exercise) => exercise.id === payload.exerciseId);
			if (exerciseIndex !== -1) {
				state.publicExercises[exerciseIndex].isFavourited = payload.isFavourite;
			}
		},
		clearSelectedExercise(state) {
			state.selectedExercise = null;
		},
		setUserGoals(state, { payload }: PayloadAction<Goals[]>) {
			state.goals = payload;
		},
		updateUserGoals(state, { payload }: PayloadAction<Goals>) {
			const index = state.goals.findIndex((goal) => goal.id === payload.id);
			if (index !== -1) {
				state.goals[index] = payload;
			} else {
				state.goals.push(payload);
			}
		},
		clearGoals(state) {
			state.goals = [];
		},
		setCustomExercises(state, { payload }: PayloadAction<CustomExercise[]>) {
			state.customExercises = payload;
		},
		addCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			state.customExercises.push(payload);
			// If the exercise is public, also add it to public exercises
			if (payload.publicAccess) {
				state.publicExercises.push(payload);
			}
		},
		setCurrentCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			state.selectedExercise = payload as CustomExercise;
		},
		updateCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			const index = state.customExercises.findIndex((e) => e.id === payload.id);
			if (index !== -1) {
				state.customExercises[index] = payload;
			}

			// If the exercise is now public, add it to publicExercises
			if (payload.publicAccess) {
				const publicIndex = state.publicExercises.findIndex((e) => e.id === payload.id);
				if (publicIndex === -1) {
					state.publicExercises.push(payload);
				} else {
					state.publicExercises[publicIndex] = payload;
				}
			} else {
				// If the exercise is no longer public, remove it from publicExercises
				state.publicExercises = state.publicExercises.filter((e) => e.id !== payload.id);
			}
		},
		addPublicExercise(state, { payload }: PayloadAction<CustomExercise>) {
			const index = state.publicExercises.findIndex((e) => e.id === payload.id);
			if (index === -1) {
				state.publicExercises.push(payload);
			} else {
				state.publicExercises[index] = payload;
			}
		},
		removeCustomExercise(state, { payload }: PayloadAction<number>) {
			state.customExercises = state.customExercises.filter((ex) => ex.id !== payload);
			state.publicExercises = state.publicExercises.filter((ex) => ex.id !== payload);
		},
		removeExercise(state, { payload }: PayloadAction<number>) {
			state.exercises = state.exercises.filter((ex) => ex.id !== payload);
		},
		setCurrentFilter(state, { payload }: PayloadAction<FilterType[]>) {
			state.currentFilter = payload;
		},
		setPublicExercises(state, { payload }: PayloadAction<CustomExercise[]>) {
			state.publicExercises = payload;
		},
		setCustomExerciseModalPopup(state, { payload }: PayloadAction<boolean>) {
			state.popupStates.customExerciseModalIsOpen = payload;
		},
		setPaywallModalPopup(state, { payload }: PayloadAction<boolean>) {
			state.popupStates.paywallIsOpen = payload;
		},
		setRoutineModalPopup(state, { payload }: PayloadAction<boolean>) {
			state.popupStates.routineModalIsOpen = payload;
		},
		setRoutines(state, { payload }: PayloadAction<Routine[]>) {
			state.routines = payload;
		},
		addRoutine(state, { payload }: PayloadAction<Routine>) {
			state.routines.push(payload);
		},
		updateRoutine(state, { payload }: PayloadAction<Routine>) {
			const index = state.routines.findIndex((r) => r.id === payload.id);
			if (index !== -1) {
				state.routines[index] = payload;
			}
		},
		removeRoutine(state, { payload }: PayloadAction<number>) {
			state.routines = state.routines.filter((r) => r.id !== payload);
		},
		setWeeklyWorkoutGoal(state, { payload }: PayloadAction<WeeklyWorkoutGoal | null>) {
			state.weeklyWorkoutGoal = payload;
		},
		updateWeeklyWorkoutGoal(state, { payload }: PayloadAction<WeeklyWorkoutGoal>) {
			state.weeklyWorkoutGoal = payload;
		},
		// Routine Execution Reducers
		startRoutineExecution(state, { payload }: PayloadAction<{ routineId: number }>) {
			state.routineExecution = {
				currentExerciseIndex: 0,
				completedExercises: [],
				isRoutineComplete: false,
				showCountdown: false,
				hasProcessedCompletion: false,
			};
		},
		setRoutineExecutionState(state, { payload }: PayloadAction<RoutineExecutionState>) {
			state.routineExecution = payload;
		},
		completeExercise(state, { payload }: PayloadAction<{ exerciseId: number }>) {
			if (state.routineExecution) {
				if (!state.routineExecution.completedExercises.includes(payload.exerciseId)) {
					state.routineExecution.completedExercises.push(payload.exerciseId);
				}
				state.routineExecution.hasProcessedCompletion = true;
			}
		},
		nextExercise(state) {
			if (state.routineExecution) {
				state.routineExecution.currentExerciseIndex += 1;
				state.routineExecution.hasProcessedCompletion = false;
			}
		},
		skipExercise(state) {
			if (state.routineExecution) {
				state.routineExecution.currentExerciseIndex += 1;
			}
		},
		setRoutineComplete(state) {
			if (state.routineExecution) {
				state.routineExecution.isRoutineComplete = true;
			}
		},
		setShowCountdown(state, { payload }: PayloadAction<boolean>) {
			if (state.routineExecution) {
				state.routineExecution.showCountdown = payload;
			}
		},
		resetRoutineExecution(state) {
			state.routineExecution = null;
		},
		resetState: () => initialState,
	},
});

export const {
	setExercises,
	selectExercise,
	setCurrentExercise,
	addExercise,
	setCustomExerciseModalPopup,
	setPaywallModalPopup,
	setRoutineModalPopup,
	setIsFavourite,
	setCustomExerciseIsFavourite,
	setPublicExerciseFavourite,
	updateProgress,
	updateCustomOptions,
	updateExercise,
	clearSelectedExercise,
	setUserGoals,
	updateUserGoals,
	clearGoals,
	setCustomExercises,
	addCustomExercise,
	updateCustomExercise,
	setCurrentCustomExercise,
	removeCustomExercise,
	removeExercise,
	setCurrentFilter,
	setPublicExercises,
	addPublicExercise,
	setRoutines,
	addRoutine,
	updateRoutine,
	removeRoutine,
	setWeeklyWorkoutGoal,
	updateWeeklyWorkoutGoal,
	startRoutineExecution,
	setRoutineExecutionState,
	completeExercise,
	nextExercise,
	skipExercise,
	setRoutineComplete,
	setShowCountdown,
	resetRoutineExecution,
	resetState,
} = dataSlice.actions;

export default dataSlice.reducer;
