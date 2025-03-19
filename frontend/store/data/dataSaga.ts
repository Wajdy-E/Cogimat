import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Exercise, setExercises, setIsFavourite } from "./dataSlice";
import axios from "axios";
import { RootState } from "../store";
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
			parameters: ex.parameters,
			videoUrl: ex.video_url,
			imageFileName: ex.image_file_name,
			timeToComplete: ex.time_to_complete,
			isFavourited: ex.isFavourited,
			focus: ex.focus,
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
