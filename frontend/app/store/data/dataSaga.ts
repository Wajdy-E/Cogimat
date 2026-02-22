import { createAsyncThunk } from "@reduxjs/toolkit";
import {
	addCustomExercise,
	addExercise,
	CustomExercise,
	CustomizableExerciseOptions,
	Exercise,
	ExerciseDifficulty,
	Goals,
	removeCustomExercise,
	removeExercise,
	setCustomExercises,
	setExercises,
	setIsFavourite,
	setPublicExercises,
	setUserGoals,
	updateCustomExercise,
	updateUserGoals,
	addPublicExercise,
	RoutineExercise,
	setRoutines,
	addRoutine,
	updateRoutine,
	removeRoutine,
	setPublicExerciseFavourite,
	setWeeklyWorkoutGoal,
	updateWeeklyWorkoutGoal,
} from "./dataSlice";
import axios from "axios";
import { RootState } from "@/store/store";
import { Arrow, Color, colorOptions, Letter, NumberEnum, Shape } from "../../data/program/Program";
import { updateUserMilestone } from "../auth/authSaga";
import { uploadExerciseImage, uploadExerciseVideo } from "../../lib/exerciseMediaUpload";
const BASE_URL = process.env.BASE_URL;

//#region Sagas

export const fetchExercises = createAsyncThunk("exercises/fetch", async (_, { getState, dispatch }) => {
	try {
		const state = getState() as RootState;
		const userId = state.user.user.baseInfo?.id;

		if (!userId) {
			throw new Error("User is not authenticated");
		}
		const response = await axios.get(`${BASE_URL}/api/data/exercises`, { params: { userId } });

		const formattedExercises: Exercise[] = response.data.exercises.map((ex: any) => ({
			id: ex.id,
			uniqueIdentifier: ex.unique_identifier,
			name: ex.name,
			type: ex.type,
			difficulty: ex.difficulty,
			instructions: ex.instructions,
			isChallenge: ex.is_challenge,
			videos: ex.videos ?? undefined,
			timeToComplete: ex.time_to_complete,
			isFavourited: ex.isFavourited,
			focus: ex.focus,
			isPremium: ex.is_premium,
			parameters: {
				shapes: ex.parameters.shapes?.map((shape: string) => Shape[shape as keyof typeof Shape]),
				colors: ex.parameters.colors?.map((color: string) => {
					const foundColor = colorOptions.find((c) => c.name === Color[color as keyof typeof Color]);
					return foundColor ?? { name: Color[color as keyof typeof Color], hexcode: "#FFFFFF" };
				}),
				numbers: ex.parameters.numbers?.map(
					(number: number) => NumberEnum[number as unknown as keyof typeof NumberEnum]
				),
				letters: ex.parameters.letters?.map((letter: string) => Letter[letter as keyof typeof Letter]),
			},
			customizableOptions: {
				offScreenTime: 0.5,
				onScreenTime: 1,
				exerciseTime: parseInt(ex.time_to_complete),
			},
		}));

		dispatch(setExercises(formattedExercises));
		return { state: getState() };
	} catch (error) {
		console.error("Error fetching exercises:", error);
		throw error;
	}
});

export const submitExercise = createAsyncThunk<any, { exercise: Exercise }>(
	"exercises/submit",
	async ({ exercise }, { getState, dispatch }) => {
		try {
			const state = getState() as RootState;
			const userId = state.user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			const { data } = await axios.post(`${BASE_URL}/api/submit-exercise`, exercise);
			if (data.success) {
				dispatch(addExercise(exercise));
			}
		} catch {}
	}
);

export const unsubmitExercise = createAsyncThunk<any, { uniqueIdentifier: string; action: "remove" | "unpremium" }>(
	"exercises/unsubmit",
	async ({ uniqueIdentifier, action }, { getState, dispatch }) => {
		try {
			const state = getState() as RootState;
			const userId = state.user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			const { data } = await axios.delete(
				`${BASE_URL}/api/submit-exercise?uniqueIdentifier=${encodeURIComponent(uniqueIdentifier)}&action=${action}`
			);

			if (data.success) {
				if (action === "remove") {
					// Remove the exercise from the exercises array
					// We need to find the exercise by uniqueIdentifier since we don't have the id
					const exercises = state.data.exercises;
					const exerciseToRemove = exercises.find((ex) => ex.uniqueIdentifier === uniqueIdentifier);
					if (exerciseToRemove) {
						dispatch(removeExercise(exerciseToRemove.id));
					}
				}
				// For "unpremium" action, we don't remove from the exercises array since the exercise still exists
			}
		} catch (error) {
			console.error("Error unsubmitting exercise:", error);
		}
	}
);

export const setFavourite = createAsyncThunk<any, { exerciseId: number; isFavourited: boolean }, { state: RootState }>(
	"exercises/set-favourite",
	async ({ exerciseId, isFavourited }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			const { data } = await axios.post(`${BASE_URL}/api/favourites/exercise`, {
				user_id: userId,
				exercise_id: exerciseId,
				is_favourited: isFavourited,
			});
			if (data.success) {
				dispatch(setIsFavourite({ exerciseId, isFavourite: isFavourited }));
			}
		} catch (error) {
			console.error("Error setting exercise as favourite:", error);
		}
	}
);

export const setCommunityExerciseFavourite = createAsyncThunk<
	any,
	{ exerciseId: number; isFavourited: boolean },
	{ state: RootState }
>("communityExercises/set-favourite", async ({ exerciseId, isFavourited }, { getState, dispatch }) => {
	try {
		const clerkId = getState().user.user.baseInfo?.id;
		if (!clerkId) {
			throw new Error("User is not authenticated");
		}

		const { data } = await axios.post(`${BASE_URL}/api/favourites/community-exercise`, {
			clerk_id: clerkId,
			exercise_id: exerciseId,
			is_favourited: isFavourited,
		});
		if (data.success) {
			dispatch(setPublicExerciseFavourite({ exerciseId, isFavourite: isFavourited }));
		}
	} catch (error) {
		console.error("Error setting community exercise as favourite:", error);
	}
});

export const updateGoal = createAsyncThunk<any, { newGoal: Goals }, { state: RootState }>(
	"user/set-goals",
	async ({ newGoal }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			const { data } = await axios.put(`${BASE_URL}/api/goals`, {
				user_id: userId,
				newGoal,
			});

			if (data.success) {
				dispatch(updateUserGoals(newGoal));
			}
		} catch (error) {
			console.error("Error setting user goals:", error);
		}
	}
);

export const addGoal = createAsyncThunk<void, { newGoal: Goals }, { state: RootState }>(
	"goals/addGoal",
	async ({ newGoal }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			const response = await axios.post(`${BASE_URL}/api/goals`, {
				user_id: userId,
				newGoal,
			});

			if (response.data.success) {
				dispatch(updateUserGoals(response.data.goal));
				// Update milestone for goal creation
				dispatch(updateUserMilestone({ milestoneType: "goalsCreated" }));
			}
		} catch (error) {
			console.error("Error adding goal:", error);
			throw error;
		}
	}
);

export const fetchGoals = createAsyncThunk<any, void, { state: RootState }>(
	"goals/fetch",
	async (_, { getState, dispatch }) => {
		const userId = getState().user.user.baseInfo?.id;
		if (!userId) {
			throw new Error("User is not authenticated");
		}

		const { data } = await axios.get(`${BASE_URL}/api/goals`, {
			params: { user_id: userId },
		});

		if (data.success) {
			dispatch(setUserGoals(data.goals));
		}

		return data.goals;
	}
);

export const deleteGoal = createAsyncThunk<any, { goalId: string }, { state: RootState }>(
	"user/delete-goal",
	async ({ goalId }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			const currentGoals = getState().data.goals;
			const updatedGoals = currentGoals.filter((g) => g.id !== goalId);

			const { data } = await axios.delete(`${BASE_URL}/api/goals`, {
				params: { user_id: userId, goal_id: goalId },
			});

			if (data.success) {
				dispatch(setUserGoals(updatedGoals));
			}
		} catch (error) {
			console.error("Error deleting goal:", error);
		}
	}
);

export const uploadUserImage = createAsyncThunk<string | null, { uri: string }, { state: RootState }>(
	"user/uploadImage",
	async ({ uri }, { getState }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			// Use the new Vercel Blob upload system
			const imageUrl = await uploadExerciseImage(uri);
			return imageUrl;
		} catch (error) {
			console.error("Image upload failed:", error);
			throw error;
		}
	}
);

export const createCustomExercise = createAsyncThunk<void, any, { state: RootState }>(
	"exercise/createCustomExercise",
	async (formData, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			let videoUri = formData.videoUri;
			if (formData.videoUri?.startsWith("file://")) {
				videoUri = await uploadExerciseVideo(formData.videoUri);
			}

			console.log("Creating exercise with data:", formData);
			const payload = {
				...formData,
				clerk_id: userId,
				videoUri,
			};

			const response = await axios.post(`${BASE_URL}/api/custom-exercise`, payload);

			const returnedId: number = response.data.id;

			const customExercise: CustomExercise = {
				id: returnedId,
				uniqueIdentifier: response.data.unique_identifier,
				name: formData.name,
				type: "custom",
				difficulty: formData.difficulty as ExerciseDifficulty,
				instructions: formData.instructions,
				parameters: {
					shapes: formData.shapes as Shape[],
					colors: formData.colors as Color[],
					numbers: formData.numbers as NumberEnum[],
					letters: formData.letters as Letter[],
					arrows: formData.arrows as Arrow[],
				},
				videoUrl: videoUri,
				youtubeUrl: formData.youtubeUrl,
				focus: formData.focus,
				isFavourited: false,
				publicAccess: false,
				submittedToCogipro: false,
				isPremium: false,
				customizableOptions: {
					parameters: {
						shapes: formData.shapes as Shape[],
						colors: formData.colors as Color[],
						numbers: formData.numbers as NumberEnum[],
						letters: formData.letters as Letter[],
						arrows: formData.arrows as Arrow[],
					},
					offScreenTime: formData.offScreenTime,
					onScreenTime: formData.onScreenTime,
					exerciseTime: formData.exerciseTime,
				},
			};

			dispatch(addCustomExercise(customExercise));

			// Update milestone for custom exercise creation
			dispatch(updateUserMilestone({ milestoneType: "customExercisesCreated" }));
		} catch (err) {
			console.error("Failed to create exercise:", err);
			throw err;
		}
	}
);

export const updateCustomExerciseThunk = createAsyncThunk<void, CustomExercise, { state: RootState }>(
	"exercise/updateCustomExercise",
	async (exercise, { getState, dispatch }) => {
		try {
			const clerk_id = getState().user.user.baseInfo?.id;
			if (!clerk_id) {
				throw new Error("User not authenticated");
			}

			// Get the current state to check if the exercise was public before
			const currentState = getState() as RootState;
			const currentExercise = currentState.data.customExercises.find((e) => e.id === exercise.id);
			const wasPublicBefore = currentExercise?.publicAccess || false;

			let videoUri = exercise.videoUrl;
			if (exercise.videoUrl?.startsWith("file://")) {
				videoUri = await uploadExerciseVideo(exercise.videoUrl, exercise.id);
			}

			const payload = {
				id: exercise.id,
				clerk_id,
				name: exercise.name,
				instructions: exercise.instructions,
				difficulty: exercise.difficulty,
				shapes: exercise.parameters.shapes ?? [],
				letters: exercise.parameters.letters ?? [],
				numbers: exercise.parameters.numbers ?? [],
				colors: Array.isArray(exercise.parameters.colors)
					? exercise.parameters.colors.map((c) => (typeof c === "string" ? c : c.name))
					: [],
				focus: exercise.focus ?? [],
				videoUri,
				isFavourited: exercise.isFavourited,
				offScreenTime: exercise.customizableOptions.offScreenTime,
				onScreenTime: exercise.customizableOptions.onScreenTime,
				exerciseTime: exercise.customizableOptions.exerciseTime,
				publicAccess: exercise.publicAccess,
				submittedToCogipro: exercise.submittedToCogipro,
				isPremium: exercise.isPremium,
			};

			await axios.patch(`${BASE_URL}/api/custom-exercise`, payload);

			const updatedExercise = {
				...exercise,
				videoUrl: videoUri,
			};

			dispatch(updateCustomExercise(updatedExercise));

			// If the exercise is being made public (wasn't public before but is now), add it to public exercises
			if (!wasPublicBefore && exercise.publicAccess) {
				dispatch(addPublicExercise(updatedExercise));
			}
		} catch (err) {
			console.error("Failed to update exercise:", err);
			throw err;
		}
	}
);

export const getCustomExercises = createAsyncThunk<void, void, { state: RootState }>(
	"customExercise/getAll",
	async (_, { getState, dispatch }) => {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}
		const res = await axios.get(`${BASE_URL}/api/custom-exercise`, {
			params: { clerk_id },
		});

		const transformed: CustomExercise[] = res.data.exercises.map((ex: any) => ({
			id: ex.id,
			uniqueIdentifier: ex.unique_identifier,
			name: ex.name,
			type: "custom",
			difficulty: ex.difficulty as ExerciseDifficulty,
			instructions: ex.instructions,
			focus: ex.focus ?? [],
			isFavourited: ex.is_favourited,
			videoUrl: ex.video_uri ?? undefined,
			publicAccess: ex.public_access,
			submittedToCogipro: ex.submitted_to_cogipro ?? false,
			isPremium: ex.is_premium ?? false,
			parameters: {
				shapes: ex.shapes ?? [],
				letters: ex.letters ?? [],
				numbers: ex.numbers ?? [],
				colors: ex.colors ?? [],
			},

			customizableOptions: {
				parameters: {
					shapes: ex.shapes ?? [],
					letters: ex.letters ?? [],
					numbers: ex.numbers ?? [],
					colors: ex.colors ?? [],
				},
				offScreenTime: ex.off_screen_time,
				onScreenTime: ex.on_screen_time,
				exerciseTime: ex.exercise_time,
			},
		}));

		dispatch(setCustomExercises(transformed));
	}
);

export const deleteCustomExercise = createAsyncThunk<number, number, { state: RootState }>(
	"customExercise/delete",
	async (exerciseId, { getState, dispatch }) => {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}

		await axios.delete(`${BASE_URL}/api/custom-exercise`, {
			data: { id: exerciseId, clerk_id },
		});

		dispatch(removeCustomExercise(exerciseId));
		return exerciseId;
	}
);

export const getPublicExercises = createAsyncThunk<void, void, { state: RootState }>(
	"publicExercises/getAll",
	async (_, { getState, dispatch }) => {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}

		const res = await axios.get(`${BASE_URL}/api/public-exercises`, {
			params: { clerkId: clerk_id },
		});

		const transformed: CustomExercise[] = res.data.exercises.map((ex: any) => ({
			id: ex.id,
			uniqueIdentifier: ex.unique_identifier,
			name: ex.name,
			type: "custom",
			difficulty: ex.difficulty as ExerciseDifficulty,
			instructions: ex.instructions,
			focus: ex.focus ?? [],
			isFavourited: ex.isFavourited ?? false,
			videoUrl: ex.video_uri ?? undefined,
			publicAccess: ex.public_access,
			submittedToCogipro: ex.submitted_to_cogipro ?? false,
			isPremium: ex.is_premium ?? false,
			parameters: {
				shapes: ex.shapes ?? [],
				letters: ex.letters ?? [],
				numbers: ex.numbers ?? [],
				colors: ex.colors ?? [],
			},

			customizableOptions: {
				parameters: {
					shapes: ex.shapes ?? [],
					letters: ex.letters ?? [],
					numbers: ex.numbers ?? [],
					colors: ex.colors ?? [],
				},
				offScreenTime: ex.off_screen_time,
				onScreenTime: ex.on_screen_time,
				exerciseTime: ex.exercise_time,
			},
		}));

		dispatch(setPublicExercises(transformed));
	}
);

// Routine Sagas
export const fetchRoutines = createAsyncThunk<void, void, { state: RootState }>(
	"routines/fetch",
	async (_, { getState, dispatch }) => {
		try {
			const clerk_id = getState().user.user.baseInfo?.id;
			if (!clerk_id) {
				throw new Error("User not authenticated");
			}

			const response = await axios.get(`${BASE_URL}/api/routines`, {
				params: { clerk_id },
			});

			if (response.data.success) {
				dispatch(setRoutines(response.data.routines));
			}
		} catch (error) {
			console.error("Error fetching routines:", error);
			throw error;
		}
	}
);

export const createRoutine = createAsyncThunk<
	void,
	{ name: string; description?: string; exercises: RoutineExercise[] },
	{ state: RootState }
>("routines/create", async ({ name, description, exercises }, { getState, dispatch }) => {
	try {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}

		const response = await axios.post(`${BASE_URL}/api/routines`, {
			clerk_id,
			name,
			description,
			exercises,
		});

		if (response.data.success) {
			dispatch(addRoutine(response.data.routine));
		}
	} catch (error) {
		console.error("Error creating routine:", error);
		throw error;
	}
});

export const updateRoutineThunk = createAsyncThunk<
	void,
	{ id: number; name: string; description?: string; exercises: RoutineExercise[] },
	{ state: RootState }
>("routines/update", async ({ id, name, description, exercises }, { getState, dispatch }) => {
	try {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}

		const response = await axios.patch(`${BASE_URL}/api/routines/${id}`, {
			clerk_id,
			name,
			description,
			exercises,
			is_active: true,
		});

		if (response.data.success) {
			dispatch(updateRoutine(response.data.routine));
		}
	} catch (error) {
		console.error("Error updating routine:", error);
		throw error;
	}
});

export const deleteRoutine = createAsyncThunk<void, number, { state: RootState }>(
	"routines/delete",
	async (routineId, { getState, dispatch }) => {
		try {
			const clerk_id = getState().user.user.baseInfo?.id;
			if (!clerk_id) {
				throw new Error("User not authenticated");
			}

			const response = await axios.delete(`${BASE_URL}/api/routines/${routineId}?clerk_id=${clerk_id}`);

			if (response.data.success) {
				dispatch(removeRoutine(routineId));
			}
		} catch (error) {
			console.error("Error deleting routine:", error);
			throw error;
		}
	}
);

export const completeRoutine = createAsyncThunk<void, number, { state: RootState }>(
	"routines/complete",
	async (routineId, { getState, dispatch }) => {
		try {
			const clerk_id = getState().user.user.baseInfo?.id;
			if (!clerk_id) {
				throw new Error("User not authenticated");
			}

			const response = await axios.post(`${BASE_URL}/api/routines/${routineId}/complete`, {
				clerk_id,
			});

			if (response.data.success) {
				dispatch(updateRoutine(response.data.routine));
			}
		} catch (error) {
			console.error("Error completing routine:", error);
			throw error;
		}
	}
);

// Weekly Workout Goal Sagas
export const fetchWeeklyWorkoutGoal = createAsyncThunk<void, void, { state: RootState }>(
	"weeklyWorkoutGoal/fetch",
	async (_, { getState, dispatch }) => {
		try {
			const clerk_id = getState().user.user.baseInfo?.id;
			if (!clerk_id) {
				throw new Error("User not authenticated");
			}

			const response = await axios.get(`${BASE_URL}/api/weekly-goals`, {
				params: { clerk_id },
			});

			if (response.data.success) {
				dispatch(setWeeklyWorkoutGoal(response.data.weeklyGoal));
			}
		} catch (error) {
			console.error("Error fetching weekly workout goal:", error);
			throw error;
		}
	}
);

export const saveWeeklyWorkoutGoal = createAsyncThunk<
	void,
	{ selected_days: string[]; reminder_time: string },
	{ state: RootState }
>("weeklyWorkoutGoal/save", async ({ selected_days, reminder_time }, { getState, dispatch }) => {
	try {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}

		const response = await axios.post(`${BASE_URL}/api/weekly-goals`, {
			clerk_id,
			selected_days,
			reminder_time,
		});

		if (response.data.success) {
			dispatch(updateWeeklyWorkoutGoal(response.data.weeklyGoal));
		}
	} catch (error) {
		console.error("Error saving weekly workout goal:", error);
		throw error;
	}
});

export const updateWeeklyWorkoutGoalThunk = createAsyncThunk<
	void,
	{ selected_days?: string[]; reminder_time?: string; is_active?: boolean },
	{ state: RootState }
>("weeklyWorkoutGoal/update", async (updates, { getState, dispatch }) => {
	try {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) {
			throw new Error("User not authenticated");
		}

		const response = await axios.put(`${BASE_URL}/api/weekly-goals`, {
			clerk_id,
			...updates,
		});

		if (response.data.success) {
			dispatch(updateWeeklyWorkoutGoal(response.data.weeklyGoal));
		}
	} catch (error) {
		console.error("Error updating weekly workout goal:", error);
		throw error;
	}
});

export const deleteWeeklyWorkoutGoal = createAsyncThunk<void, void, { state: RootState }>(
	"weeklyWorkoutGoal/delete",
	async (_, { getState, dispatch }) => {
		try {
			const clerk_id = getState().user.user.baseInfo?.id;
			if (!clerk_id) {
				throw new Error("User not authenticated");
			}

			const response = await axios.delete(`${BASE_URL}/api/weekly-goals`, {
				params: { clerk_id },
			});

			if (response.data.success) {
				dispatch(setWeeklyWorkoutGoal(null));
			}
		} catch (error) {
			console.error("Error deleting weekly workout goal:", error);
			throw error;
		}
	}
);
