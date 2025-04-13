import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
	addCustomExercise,
	CustomExercise,
	CustomizableExerciseOptions,
	Exercise,
	ExerciseDifficulty,
	Goals,
	removeCustomExercise,
	setCustomExercises,
	setExercises,
	setIsFavourite,
	setPublicExercises,
	setUserGoals,
	updateCustomExercise,
	updateUserGoals,
} from "./dataSlice";
import axios from "axios";
import { RootState } from "../store";
import { Color, colorOptions, Letter, NumberEnum, Shape } from "../../data/program/Program";
const BASE_URL = process.env.BASE_URL;

//#region Sagas

export const fetchExercises = createAsyncThunk("exercises/fetch", async (_, { getState, dispatch }) => {
	try {
		const state = getState() as RootState;
		const userId = state.user.user.baseInfo?.id;
		if (!userId) throw new Error("User is not authenticated");
		const response = await axios.get(`${BASE_URL}/api/data/exercises`, { params: { userId } });
		const formattedExercises: Exercise[] = response.data.exercises.map((ex: any) => ({
			id: ex.id,
			name: ex.name,
			type: ex.type,
			difficulty: ex.difficulty,
			description: ex.description,
			instructions: ex.instructions,
			isChallenge: ex.is_challenge,
			trackingData: ex.tracking_data,
			videoUrl: ex.video_url,
			imageFileName: ex.image_file_name,
			timeToComplete: ex.time_to_complete,
			isFavourited: ex.isFavourited,
			focus: ex.focus,
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
				offScreenTime: ex.off_screen_time,
				onScreenTime: ex.on_screen_time,
				exerciseTime: ex.exercise_time,
				offScreenColor: ex.off_screen_color,
				onScreenColor: ex.on_screen_color,
				restTime: ex.rest_time,
			} as CustomizableExerciseOptions,
		}));

		dispatch(setExercises(formattedExercises));
		return { state: getState() };
	} catch (error) {
		console.error("Error fetching exercises:", error);
		throw error;
	}
});

export const setFavourite = createAsyncThunk<any, { exerciseId: number; isFavourited: boolean }, { state: RootState }>(
	"exercises/set-favourite",
	async ({ exerciseId, isFavourited }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) throw new Error("User is not authenticated");

			const { data } = await axios.post(`${BASE_URL}/api/favourites/exercise`, {
				user_id: userId,
				exercise_id: exerciseId,
				is_favourited: isFavourited,
			});
			if (data.success) dispatch(setIsFavourite({ exerciseId, isFavourite: isFavourited }));
		} catch (error) {
			console.error("Error setting exercise as favourite:", error);
		}
	}
);

export const updateGoal = createAsyncThunk<any, { newGoal: Goals }, { state: RootState }>(
	"user/set-goals",
	async ({ newGoal }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) throw new Error("User is not authenticated");

			const { data } = await axios.put(`${BASE_URL}/api/goals`, {
				user_id: userId,
				newGoal,
			});

			if (data.success) dispatch(updateUserGoals(newGoal));
		} catch (error) {
			console.error("Error setting user goals:", error);
		}
	}
);

export const addGoal = createAsyncThunk<any, { newGoal: Goals }, { state: RootState }>(
	"user/set-goals",
	async ({ newGoal }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) throw new Error("User is not authenticated");

			const { data } = await axios.post(`${BASE_URL}/api/goals`, {
				user_id: userId,
				newGoal,
			});

			if (data.success) dispatch(updateUserGoals(data.goal));
		} catch (error) {
			console.error("Error setting user goals:", error);
		}
	}
);

export const fetchGoals = createAsyncThunk<any, void, { state: RootState }>(
	"goals/fetch",
	async (_, { getState, dispatch }) => {
		const userId = getState().user.user.baseInfo?.id;
		if (!userId) throw new Error("User is not authenticated");

		const { data } = await axios.get(`${BASE_URL}/api/goals`, {
			params: { user_id: userId },
		});

		if (data.success) dispatch(setUserGoals(data.goals));

		return data.goals;
	}
);

export const deleteGoal = createAsyncThunk<any, { goalId: string }, { state: RootState }>(
	"user/delete-goal",
	async ({ goalId }, { getState, dispatch }) => {
		try {
			const userId = getState().user.user.baseInfo?.id;
			if (!userId) throw new Error("User is not authenticated");

			const currentGoals = getState().data.goals;
			const updatedGoals = currentGoals.filter((g) => g.id !== goalId);

			const { data } = await axios.delete(`${BASE_URL}/api/goals`, {
				params: { user_id: userId, goal_id: goalId },
			});

			if (data.success) dispatch(setUserGoals(updatedGoals));
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
			if (!userId) throw new Error("User is not authenticated");
			const fileName = uri.split("/").pop() || "image.jpg";
			const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

			const form = new FormData();
			form.append("file", {
				uri,
				name: fileName,
				type: fileType,
			} as any); // RN requires `as any` for FormData file

			const res = await axios.post(`${BASE_URL}/api/exercise-image-upload`, form, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			return res.data.url; // You can store this in your state if needed
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
			if (!userId) throw new Error("User is not authenticated");

			const payload = {
				...formData,
				clerk_id: userId,
			};

			const response = await axios.post(`${BASE_URL}/api/custom-exercise`, payload);

			const returnedId: number = response.data.id;

			const customExercise: CustomExercise = {
				id: returnedId,
				name: formData.name,
				type: "custom",
				difficulty: formData.difficulty as ExerciseDifficulty,
				description: formData.description,
				instructions: formData.instructions,
				parameters: {
					shapes: formData.shapes as Shape[],
					colors: formData.colors as Color[],
					numbers: formData.numbers as NumberEnum[],
					letters: formData.letters as Letter[],
				},
				videoUrl: formData.videoUri,
				imageFileUrl: formData.imageUri,
				youtubeUrl: formData.youtubeUrl,
				focus: formData.focus,
				isFavourited: false,
				publicAccess: false,
				customizableOptions: {
					parameters: {
						shapes: formData.shapes as Shape[],
						colors: formData.colors as Color[],
						numbers: formData.numbers as NumberEnum[],
						letters: formData.letters as Letter[],
					},
					offScreenTime: formData.offScreenTime,
					onScreenTime: formData.onScreenTime,
					exerciseTime: formData.exerciseTime,
					offScreenColor: formData.offScreenColor,
					onScreenColor: formData.onScreenColor,
					restTime: formData.restTime,
				},
			};

			dispatch(addCustomExercise(customExercise));
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
			if (!clerk_id) throw new Error("User not authenticated");

			const payload = {
				id: exercise.id,
				clerk_id,
				name: exercise.name,
				description: exercise.description,
				instructions: exercise.instructions,
				difficulty: exercise.difficulty,
				shapes: exercise.parameters.shapes ?? [],
				letters: exercise.parameters.letters ?? [],
				numbers: exercise.parameters.numbers ?? [],
				colors: Array.isArray(exercise.parameters.colors)
					? exercise.parameters.colors.map((c) => (typeof c === "string" ? c : c.name))
					: [],
				focus: exercise.focus ?? [],
				imageUri: exercise.imageFileUrl,
				videoUri: exercise.videoUrl,
				isFavourited: exercise.isFavourited,
				offScreenTime: exercise.customizableOptions.offScreenTime,
				onScreenTime: exercise.customizableOptions.onScreenTime,
				exerciseTime: exercise.customizableOptions.exerciseTime,
				offScreenColor: exercise.customizableOptions.offScreenColor,
				onScreenColor: exercise.customizableOptions.onScreenColor,
				restTime: exercise.customizableOptions.restTime,
				publicAccess: exercise.publicAccess,
			};

			await axios.patch(`${BASE_URL}/api/custom-exercise`, payload);

			dispatch(updateCustomExercise(exercise));
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
		if (!clerk_id) throw new Error("User not authenticated");

		const res = await axios.get(`${BASE_URL}/api/custom-exercise`, {
			params: { clerk_id },
		});

		const transformed: CustomExercise[] = res.data.exercises.map((ex: any) => ({
			id: ex.id,
			name: ex.name,
			type: "custom",
			difficulty: ex.difficulty as ExerciseDifficulty,
			description: ex.description,
			instructions: ex.instructions,
			focus: ex.focus ?? [],
			isFavourited: false,
			imageFileUrl: ex.image_uri ?? undefined,
			videoUrl: ex.video_uri ?? undefined,
			publicAccess: ex.public_access,
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
				offScreenColor: ex.off_screen_color,
				onScreenColor: ex.on_screen_color,
				restTime: ex.rest_time,
			},
		}));

		dispatch(setCustomExercises(transformed));
	}
);

export const deleteCustomExercise = createAsyncThunk<number, number, { state: RootState }>(
	"customExercise/delete",
	async (exerciseId, { getState, dispatch }) => {
		const clerk_id = getState().user.user.baseInfo?.id;
		if (!clerk_id) throw new Error("User not authenticated");

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
		if (!clerk_id) throw new Error("User not authenticated");

		const res = await axios.get(`${BASE_URL}/api/public-exercises`);

		const transformed: CustomExercise[] = res.data.exercises.map((ex: any) => ({
			id: ex.id,
			name: ex.name,
			type: "custom",
			difficulty: ex.difficulty as ExerciseDifficulty,
			description: ex.description,
			instructions: ex.instructions,
			focus: ex.focus ?? [],
			isFavourited: false,
			imageFileUrl: ex.image_uri ?? undefined,
			videoUrl: ex.video_uri ?? undefined,
			publicAccess: ex.public_access,
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
				offScreenColor: ex.off_screen_color,
				onScreenColor: ex.on_screen_color,
				restTime: ex.rest_time,
			},
		}));

		dispatch(setPublicExercises(transformed));
	}
);
