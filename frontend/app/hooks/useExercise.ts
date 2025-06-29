import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Exercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";

export const useExercise = (get: ExerciseDifficulty | number | null) => {
	const [exercises, setExercises] = useState<Exercise[] | Exercise | null>(null);
	const allExercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);

	const updateExercises = useCallback(() => {
		if (get === null) {
			setExercises(allExercises);
		} else if (get in ExerciseDifficulty) {
			setExercises(allExercises.filter((exercise) => exercise.difficulty === get));
		} else {
			const foundExercise = allExercises.find((exercise) => exercise.id === get);
			setExercises(foundExercise || null);
		}
	}, [get, allExercises]);

	useEffect(() => {
		updateExercises();
	}, [updateExercises]);

	return exercises;
};
