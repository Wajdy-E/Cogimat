import { GET_EXERCISE } from "./dataActionTypes";
import { Exercise } from "./dataSlice";

export const getExerciseAction = (exercises: Exercise | null) => ({
	type: GET_EXERCISE,
	payload: exercises,
});
