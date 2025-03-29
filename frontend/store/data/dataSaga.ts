import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Exercise, Goals, setExercises, setIsFavourite, setUserGoals, updateUserGoals } from "./dataSlice";
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
			isChallenge: ex.isChallenge,
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

			const { data } = await axios.post(`${BASE_URL}/api/favourites`, {
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
