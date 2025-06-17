import { CustomExercise, Exercise } from "../../store/data/dataSlice";

export function customExerciseToExercise(customExercise: CustomExercise) {
	return {
		difficulty: customExercise.difficulty,
		description: customExercise.description,
		isPremium: true,
		isChallenge: false,
		focus: customExercise.focus?.toString(),
		isFavourited: false,
		instructions: customExercise.instructions,
		name: customExercise.name,
		customizableOptions: customExercise.customizableOptions,
		type: "simple-stimulus",
		timeToComplete: (customExercise.customizableOptions.exerciseTime * 60).toString(),
		videoUrl: customExercise.videoUrl,
		imageFileName: customExercise.imageFileUrl,
		parameters: customExercise.parameters,
	} as Exercise;
}
