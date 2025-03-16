import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Exercise, setExercises, setIsFavourite } from "./dataSlice";
import axios from "axios";

const BASE_URL = process.env.BASE_URL;

//#region Sagas

export const fetchExercises = createAsyncThunk("exercises/fetch", async (_, { dispatch }) => {
	try {
		const response = await axios.get(`${BASE_URL}/api/data/exercises`);

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
			isFavourited: ex.is_favourite,
			focus: ex.focus,
		}));

		dispatch(setExercises(formattedExercises));
	} catch (error) {
		console.error("Error fetching exercises:", error);
	}
});

export const setFavourite = createAsyncThunk<any, Exercise>(
	"exercises/set-favourite",
	async (exercise: Exercise, { dispatch }) => {
		try {
			const { data } = await axios.post(`${BASE_URL}/api/favourites`, exercise);

			const formattedExercise: Exercise = {
				id: data.updatedexercise.id,
				name: data.updatedexercise.name,
				type: data.updatedexercise.type,
				difficulty: data.updatedexercise.difficulty,
				description: data.updatedexercise.description,
				instructions: data.updatedexercise.instructions,
				trackingData: data.updatedexercise.tracking_data,
				parameters: data.updatedexercise.parameters,
				videoUrl: data.updatedexercise.video_url,
				imageFileName: data.updatedexercise.image_file_name,
				timeToComplete: data.updatedexercise.time_to_complete,
				isFavourited: data.updatedexercise.is_favourite,
				focus: data.updatedexercise.focus,
			};

			dispatch(setIsFavourite(formattedExercise));
		} catch (error) {
			console.error("Error fetching exercises:", error);
		}
	}
);
