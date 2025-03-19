import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Exercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";

export const useExercise = (get: ExerciseDifficulty | number | null) => {
	const [exercises, setExercises] = useState<Exercise[] | Exercise>([]);
	const allExercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);
	useEffect(() => {
		if (get === null) {
			setExercises(allExercises);
		} else if (get in ExerciseDifficulty) {
			setExercises(allExercises.filter((exercise) => exercise.difficulty === get));
		} else {
			setExercises(allExercises.filter((exercise) => exercise.id === get)[0]);
		}
	}, [get, allExercises]);

	return exercises;
};
