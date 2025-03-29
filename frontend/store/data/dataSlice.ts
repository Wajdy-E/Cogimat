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
}

export interface ExerciseParameters {
	shapes?: Shape[];
	colors?: ColorOption[];
	numbers?: NumberEnum[];
	letters?: Letter[];
}

export enum ExerciseDifficulty {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
}

export interface Goals {
	goal: string;
	id?: string;
	completed: boolean;
}
// Define the initial state
export interface DataState {
	exercises: Exercise[];
	selectedExercise: Exercise | null;
	progress: Record<number, any>;
	goals: Goals[];
}

const initialState: DataState = {
	exercises: [],
	selectedExercise: null,
	progress: {},
	goals: [],
};

const dataSlice = createSlice({
	name: "exercises",
	initialState,
	reducers: {
		setExercises(state, action: PayloadAction<Exercise[]>) {
			state.exercises = action.payload;
		},
		setCurrentExericse(state, { payload }: PayloadAction<Exercise>) {
			state.selectedExercise = payload;
		},
		selectExercise(state, action: PayloadAction<number>) {
			const exercise = state.exercises.find((ex) => ex.id === action.payload);
			state.selectedExercise = exercise || null;
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
	},
});

export const {
	setExercises,
	selectExercise,
	setCurrentExericse,
	setIsFavourite,
	updateProgress,
	clearSelectedExercise,
	setUserGoals,
	updateUserGoals,
	clearGoals,
} = dataSlice.actions;

export default dataSlice.reducer;
