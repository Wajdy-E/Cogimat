import { CustomExercise, Exercise } from "../../store/data/dataSlice";

export function customExerciseToExercise(customExercise: CustomExercise, isPremium: boolean) {
	return {
		uniqueIdentifier: customExercise.uniqueIdentifier,
		difficulty: customExercise.difficulty,
		description: customExercise.description,
		isPremium: isPremium,
		isChallenge: false,
		focus: customExercise.focus?.toString(),
		isFavourited: false,
		instructions: customExercise.instructions,
		name: customExercise.name,
		customizableOptions: customExercise.customizableOptions,
		type: "simple-stimulus",
		timeToComplete: customExercise.customizableOptions.exerciseTime.toString(),
		videoUrl: customExercise.videoUrl,
		imageFileUrl: customExercise.imageFileUrl,
		parameters: customExercise.parameters,
		youtubeUrl: customExercise.youtubeUrl,
	} as Exercise;
}
