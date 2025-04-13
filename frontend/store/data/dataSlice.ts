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
	trackingData: Record<string, any>;
	videoUrl: string;
	imageFileName: string;
	isFavourited: boolean;
	focus: string;
	isChallenge: boolean;
	customizableOptions?: CustomizableExerciseOptions;
}

export interface CustomizableExerciseOptions {
	parameters?: ExerciseParameters;
	offScreenTime: number;
	onScreenTime: number;
	exerciseTime: number;
	offScreenColor: string;
	onScreenColor: string;
	restTime: number;
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
}

export interface Goals {
	goal: string;
	id?: string;
	completed: boolean;
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
};

const dataSlice = createSlice({
	name: "exercises",
	initialState,
	reducers: {
		setExercises(state, action: PayloadAction<Exercise[]>) {
			state.exercises = action.payload;
		},
		setCurrentExercise(state, { payload }: PayloadAction<Exercise>) {
			state.selectedExercise = payload;
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
		},
		setCurrentCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			state.selectedExercise = payload as CustomExercise;
		},
		updateCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			const index = state.customExercises.findIndex((e) => e.id === payload.id);
			if (index !== -1) {
				state.customExercises[index] = payload;
			}
		},
		removeCustomExercise(state, { payload }: PayloadAction<number>) {
			state.customExercises = state.customExercises.filter((ex) => ex.id !== payload);
		},
		setCurrentFilter(state, { payload }: PayloadAction<FilterType[]>) {
			state.currentFilter = payload;
		},
		setPublicExercises(state, { payload }: PayloadAction<CustomExercise[]>) {
			state.publicExercises = payload;
		},
	},
});

export const {
	setExercises,
	selectExercise,
	setCurrentExercise,
	setIsFavourite,
	setCustomExerciseIsFavourite,
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
	setCurrentFilter,
	setPublicExercises,
} = dataSlice.actions;

export default dataSlice.reducer;
