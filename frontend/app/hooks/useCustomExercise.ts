import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { CustomExercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";

export const useCustomExercise = (get: ExerciseDifficulty | number | null) => {
	const [customExercises, setExercises] = useState<CustomExercise[] | CustomExercise | null>(null);
	const allExercises = useSelector((state: RootState) => state.data.customExercises, shallowEqual);

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

	return customExercises;
};

export const useCommunityExercise = (exerciseId: number | null) => {
	const [exercise, setExercise] = useState<CustomExercise | null>(null);
	const customExercises = useSelector((state: RootState) => state.data.customExercises, shallowEqual);
	const publicExercises = useSelector((state: RootState) => state.data.publicExercises, shallowEqual);

	const updateExercise = useCallback(() => {
		if (exerciseId === null) {
			setExercise(null);
			return;
		}

		// First look in custom exercises (user's own exercises)
		let foundExercise = customExercises.find((ex) => ex.id === exerciseId);

		// If not found in custom exercises, look in public exercises (community exercises)
		if (!foundExercise) {
			foundExercise = publicExercises.find((ex) => ex.id === exerciseId);
		}

		setExercise(foundExercise || null);
	}, [exerciseId, customExercises, publicExercises]);

	useEffect(() => {
		updateExercise();
	}, [updateExercise]);

	return exercise;
};
