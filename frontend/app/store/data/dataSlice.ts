import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NumberEnum, Letter, Shape, Color, ColorOption, Arrow } from "../../data/program/Program";

/** Single video entry in exercises.videos (public exercises only). */
export interface ExerciseVideoEntry {
	url: string;
	isPremium?: boolean;
}

/** Video sources for public exercises. Custom exercises use videoUrl / youtubeUrl. */
export interface ExerciseVideos {
	youtube?: ExerciseVideoEntry;
	mp4?: ExerciseVideoEntry;
}

export interface Exercise {
	id: number;
	uniqueIdentifier: string;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	timeToComplete: string;
	instructions: string;
	parameters: ExerciseParameters;
	/** Public exercises: video sources with optional isPremium. */
	videos?: ExerciseVideos;
	/** Legacy / custom: single video URL. */
	videoUrl?: string;
	isFavourited: boolean;
	focus: string;
	isChallenge: boolean;
	customizableOptions: CustomizableExerciseOptions;
	isPremium?: boolean;
	/** Legacy / custom: YouTube URL. */
	youtubeUrl?: string;
}

export interface MetronomeSettings {
	enabled: boolean;
	bpm: number;
	/** Selected metronome sound id (persisted per exercise). */
	soundId?: string;
}

export interface CustomizableExerciseOptions {
	parameters?: ExerciseParameters;
	offScreenTime: number;
	onScreenTime: number;
	exerciseTime: number;
	metronome?: MetronomeSettings;
}

export interface CustomExercise {
	id: number;
	uniqueIdentifier: string;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	instructions: string;
	parameters: ExerciseParameters;
	videoUrl?: string;
	isFavourited: boolean;
	focus?: string[];
	publicAccess: boolean;
	submittedToCogipro: boolean;
	isPremium?: boolean;
	youtubeUrl?: string;
	customizableOptions: CustomizableExerciseOptions;
}

export interface ExerciseParameters {
	shapes?: Shape[];
	colors?: ColorOption[] | Color[];
	numbers?: NumberEnum[];
	letters?: Letter[];
	arrows?: Arrow[];
}

export enum ExerciseDifficulty {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
}

export enum FilterType {
	Standard = "standard",
	Custom = "custom",
	Community = "community",
}

export interface Goals {
	goal: string;
	id?: string;
	completed: boolean;
}

export interface WeeklyWorkoutGoal {
	id?: number;
	clerk_id: string;
	selected_days: string[];
	reminder_time: string; // HH:MM:SS format
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface RoutineExercise {
	exercise_id: number;
	exercise_type: "standard" | "custom";
	order: number;
}

export interface Routine {
	id: number;
	clerk_id: string;
	name: string;
	description?: string;
	exercises: RoutineExercise[];
	is_active: boolean;
	created_at: string;
	updated_at: string;
	last_completed_at?: string;
	completion_count: number;
}

export interface PopupStates {
	customExerciseModalIsOpen: boolean;
	paywallIsOpen: boolean;
	routineModalIsOpen: boolean;
}

export interface RoutineExecutionState {
	currentExerciseIndex: number;
	completedExercises: number[];
	isRoutineComplete: boolean;
	showCountdown: boolean;
	hasProcessedCompletion: boolean;
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
	routines: Routine[];
	popupStates: PopupStates;
	weeklyWorkoutGoal: WeeklyWorkoutGoal | null;
	routineExecution: RoutineExecutionState | null;
	exerciseStopped: boolean;
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
	routines: [],
	popupStates: {
		customExerciseModalIsOpen: false,
		paywallIsOpen: false,
		routineModalIsOpen: false,
	},
	weeklyWorkoutGoal: null,
	routineExecution: null,
	exerciseStopped: false,
};

const dataSlice = createSlice({
	name: "exercises",
	initialState,
	reducers: {
		setExercises(state, action: PayloadAction<Exercise[]>) {
			state.exercises = action.payload;
		},
		setCurrentExercise(state, { payload }: PayloadAction<Exercise | CustomExercise | null>) {
			state.selectedExercise = payload;
		},
		addExercise(state, { payload }: PayloadAction<Exercise>) {
			state.exercises.push(payload);
		},
		selectExercise(state, action: PayloadAction<number>) {
			const exercise = state.exercises.find((ex) => ex.id === action.payload);
			state.selectedExercise = exercise || null;
		},
		updateExercise(
			state,
			{ payload }: PayloadAction<{ exerciseId: number; options: CustomizableExerciseOptions }>
		) {
			state.customizedExercises[payload.exerciseId] = payload.options;
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
		setPublicExerciseFavourite(state, { payload }: PayloadAction<{ exerciseId: number; isFavourite: boolean }>) {
			const exerciseIndex = state.publicExercises.findIndex((exercise) => exercise.id === payload.exerciseId);
			if (exerciseIndex !== -1) {
				state.publicExercises[exerciseIndex].isFavourited = payload.isFavourite;
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
			// If the exercise is public, also add it to public exercises
			if (payload.publicAccess) {
				state.publicExercises.push(payload);
			}
		},
		setCurrentCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			state.selectedExercise = payload as CustomExercise;
		},
		updateCustomExercise(state, { payload }: PayloadAction<CustomExercise>) {
			const index = state.customExercises.findIndex((e) => e.id === payload.id);
			if (index !== -1) {
				state.customExercises[index] = payload;
			}

			// If the exercise is now public, add it to publicExercises
			if (payload.publicAccess) {
				const publicIndex = state.publicExercises.findIndex((e) => e.id === payload.id);
				if (publicIndex === -1) {
					state.publicExercises.push(payload);
				} else {
					state.publicExercises[publicIndex] = payload;
				}
			} else {
				// If the exercise is no longer public, remove it from publicExercises
				state.publicExercises = state.publicExercises.filter((e) => e.id !== payload.id);
			}
		},
		addPublicExercise(state, { payload }: PayloadAction<CustomExercise>) {
			const index = state.publicExercises.findIndex((e) => e.id === payload.id);
			if (index === -1) {
				state.publicExercises.push(payload);
			} else {
				state.publicExercises[index] = payload;
			}
		},
		removeCustomExercise(state, { payload }: PayloadAction<number>) {
			state.customExercises = state.customExercises.filter((ex) => ex.id !== payload);
			state.publicExercises = state.publicExercises.filter((ex) => ex.id !== payload);
		},
		removeExercise(state, { payload }: PayloadAction<number>) {
			state.exercises = state.exercises.filter((ex) => ex.id !== payload);
		},
		setCurrentFilter(state, { payload }: PayloadAction<FilterType[]>) {
			state.currentFilter = payload;
		},
		setPublicExercises(state, { payload }: PayloadAction<CustomExercise[]>) {
			state.publicExercises = payload;
		},
		setCustomExerciseModalPopup(state, { payload }: PayloadAction<boolean>) {
			state.popupStates.customExerciseModalIsOpen = payload;
		},
		setPaywallModalPopup(state, { payload }: PayloadAction<boolean>) {
			state.popupStates.paywallIsOpen = payload;
		},
		setRoutineModalPopup(state, { payload }: PayloadAction<boolean>) {
			state.popupStates.routineModalIsOpen = payload;
		},
		setRoutines(state, { payload }: PayloadAction<Routine[]>) {
			state.routines = payload;
		},
		addRoutine(state, { payload }: PayloadAction<Routine>) {
			state.routines.push(payload);
		},
		updateRoutine(state, { payload }: PayloadAction<Routine>) {
			const index = state.routines.findIndex((r) => r.id === payload.id);
			if (index !== -1) {
				state.routines[index] = payload;
			}
		},
		removeRoutine(state, { payload }: PayloadAction<number>) {
			state.routines = state.routines.filter((r) => r.id !== payload);
		},
		setWeeklyWorkoutGoal(state, { payload }: PayloadAction<WeeklyWorkoutGoal | null>) {
			state.weeklyWorkoutGoal = payload;
		},
		updateWeeklyWorkoutGoal(state, { payload }: PayloadAction<WeeklyWorkoutGoal>) {
			state.weeklyWorkoutGoal = payload;
		},
		// Routine Execution Reducers
		startRoutineExecution(state, { payload }: PayloadAction<{ routineId: number }>) {
			state.routineExecution = {
				currentExerciseIndex: 0,
				completedExercises: [],
				isRoutineComplete: false,
				showCountdown: false,
				hasProcessedCompletion: false,
			};
		},
		setRoutineExecutionState(state, { payload }: PayloadAction<RoutineExecutionState>) {
			state.routineExecution = payload;
		},
		completeExercise(state, { payload }: PayloadAction<{ exerciseId: number }>) {
			if (state.routineExecution) {
				if (!state.routineExecution.completedExercises.includes(payload.exerciseId)) {
					state.routineExecution.completedExercises.push(payload.exerciseId);
				}
				state.routineExecution.hasProcessedCompletion = true;
			}
		},
		nextExercise(state) {
			if (state.routineExecution) {
				state.routineExecution.currentExerciseIndex += 1;
				state.routineExecution.hasProcessedCompletion = false;
			}
		},
		skipExercise(state) {
			if (state.routineExecution) {
				state.routineExecution.currentExerciseIndex += 1;
			}
		},
		setRoutineComplete(state) {
			if (state.routineExecution) {
				state.routineExecution.isRoutineComplete = true;
			}
		},
		setShowCountdown(state, { payload }: PayloadAction<boolean>) {
			if (state.routineExecution) {
				state.routineExecution.showCountdown = payload;
			}
		},
		resetRoutineExecution(state) {
			state.routineExecution = null;
		},
		setExerciseStopped(state, { payload }: PayloadAction<boolean>) {
			state.exerciseStopped = payload;
		},
		resetState: () => initialState,
	},
});

export const {
	setExercises,
	selectExercise,
	setCurrentExercise,
	addExercise,
	setCustomExerciseModalPopup,
	setPaywallModalPopup,
	setRoutineModalPopup,
	setIsFavourite,
	setCustomExerciseIsFavourite,
	setPublicExerciseFavourite,
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
	removeExercise,
	setCurrentFilter,
	setPublicExercises,
	addPublicExercise,
	setRoutines,
	addRoutine,
	updateRoutine,
	removeRoutine,
	setWeeklyWorkoutGoal,
	updateWeeklyWorkoutGoal,
	startRoutineExecution,
	setRoutineExecutionState,
	completeExercise,
	nextExercise,
	skipExercise,
	setExerciseStopped,
	setRoutineComplete,
	setShowCountdown,
	resetRoutineExecution,
	resetState,
} = dataSlice.actions;

/** Returns visible video/youtube URLs for an exercise (respects videos[].isPremium for public exercises). */
export function getVisibleExerciseMedia(
	exercise: Exercise,
	isSubscribed: boolean
): { youtubeUrl?: string; videoUrl?: string } {
	if (exercise.videos) {
		const youtube = exercise.videos.youtube;
		const mp4 = exercise.videos.mp4;
		return {
			youtubeUrl:
				youtube?.url && (!youtube.isPremium || isSubscribed) ? youtube.url : undefined,
			videoUrl: mp4?.url && (!mp4.isPremium || isSubscribed) ? mp4.url : undefined,
		};
	}
	return {
		youtubeUrl: exercise.youtubeUrl,
		videoUrl: exercise.videoUrl,
	};
}

export type ExerciseMediaItem = { type: "youtube" | "video" | "image"; url: string; isLocked?: boolean };

/** Returns all media items for an exercise (videos + image), with isLocked for premium-only videos when !isSubscribed. */
export function getExerciseMediaItemsWithLock(
	exercise: Exercise,
	isSubscribed: boolean
): ExerciseMediaItem[] {
	const items: ExerciseMediaItem[] = [];

	if (exercise.videos) {
		const y = exercise.videos.youtube;
		const m = exercise.videos.mp4;
		if (y?.url) {
			const match = y.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/);
			const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}?si=SWqkZtlRD8J8sBL-` : y.url;
			items.push({ type: "youtube", url: embedUrl, isLocked: y.isPremium === true && !isSubscribed });
		}
		if (m?.url) {
			items.push({ type: "video", url: m.url, isLocked: m.isPremium === true && !isSubscribed });
		}
	} else {
		// Legacy: only visible media, no lock state
		if (exercise.youtubeUrl) {
			const videoId = exercise.youtubeUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/)?.[1];
			if (videoId) items.push({ type: "youtube", url: `https://www.youtube.com/embed/${videoId}?si=SWqkZtlRD8J8sBL-` });
		}
		if (exercise.videoUrl) items.push({ type: "video", url: exercise.videoUrl });
	}

	return items;
}

// Helper function to get customized options for an exercise
export const getExerciseCustomizedOptions = (
	exercise: Exercise,
	customizedExercises: Record<number, CustomizableExerciseOptions>
): CustomizableExerciseOptions => {
	// If there are customized options for this exercise, use them
	if (customizedExercises[exercise.id]) {
		return customizedExercises[exercise.id];
	}

	// Otherwise, return default options based on the exercise's timeToComplete
	return {
		offScreenTime: 0.5,
		onScreenTime: 1,
		exerciseTime: parseInt(exercise.timeToComplete),
		metronome: {
			enabled: false,
			bpm: 120,
			soundId: "tick",
		},
	};
};

export default dataSlice.reducer;
