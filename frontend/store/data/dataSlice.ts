import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Exercise {
	id: number;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	description: string;
	timeToComplete: string;
	instructions: string;
	parameters: Record<string, any>;
	trackingData: Record<string, any>;
	videoUrl: string;
	imageFileName: string;
	isFavourited: boolean;
	focus: string;
}

export enum ExerciseDifficulty {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
}
// Define the initial state
export interface ExerciseState {
	exercises: Exercise[];
	selectedExercise: Exercise | null;
	progress: Record<number, any>;
}

const initialState: ExerciseState = {
	exercises: [],
	selectedExercise: null,
	progress: {},
};

const dataSlice = createSlice({
	name: "exercises",
	initialState,
	reducers: {
		setExercises(state, action: PayloadAction<Exercise[]>) {
			state.exercises = action.payload;
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
	},
});

export const { setExercises, selectExercise, setIsFavourite, updateProgress, clearSelectedExercise } =
	dataSlice.actions;

export default dataSlice.reducer;
