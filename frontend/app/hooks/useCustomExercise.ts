import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CustomExercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";

export const useCustomExercise = (get: ExerciseDifficulty | number | null) => {
	const [customExercises, setExercises] = useState<CustomExercise[] | CustomExercise>([]);
	const allExercises = useSelector((state: RootState) => state.data.customExercises, shallowEqual);
	useEffect(() => {
		if (get === null) {
			setExercises(allExercises);
		} else if (get in ExerciseDifficulty) {
			setExercises(allExercises.filter((exercise) => exercise.difficulty === get));
		} else {
			setExercises(allExercises.filter((exercise) => exercise.id === get)[0]);
		}
	}, [get, allExercises]);

	return customExercises;
};
