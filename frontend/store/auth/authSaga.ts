import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
	setCurrentUser,
	setMilestonesProgress,
	setSubscriptionStatus,
	UserBase,
	UserMilestones,
	UserSubscriptionState,
} from "./authSlice";
import { RootState } from "../store";

const BASE_URL = process.env.BASE_URL;
console.log("BASE_URL", BASE_URL);
export const createUser = createAsyncThunk<UserBase, UserBase>(
	"auth/createUser",
	async (userData: UserBase, { dispatch, rejectWithValue }) => {
		try {
			const response = await axios.post(`${BASE_URL}/api/auth/signup`, userData);
			dispatch(setCurrentUser(userData as UserBase));
			return response.data;
		} catch (error: any) {
			console.error("Error creating user:", error);
			const errorMsg =
				error.response && error.response.data && error.response.data.message
					? error.response.data.message
					: "Failed to create user. Please try again later.";
			return rejectWithValue(errorMsg);
		}
	}
);

export const setCurrentUserThunk = createAsyncThunk<UserBase, UserBase>(
	"auth/setCurrentUser",
	async (userData: UserBase, { dispatch }) => {
		try {
			// console.log("userData", userData);
			dispatch(setCurrentUser(userData as UserBase));
			return userData;
		} catch (error) {
			console.error("Error in setCurrentUser:", error);
			throw error;
		}
	}
);

export const deleteUserThunk = createAsyncThunk("auth/deleteUser", async (clerk_id: string, { dispatch }) => {
	try {
		const response = await axios.delete(`${BASE_URL}/api/auth/delete-user`, { data: { userId: clerk_id } });
		return {
			status: response.status,
			message: response.data?.message,
		};
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
});

export const fetchUserMilestones = createAsyncThunk(
	"milestones/fetchUserMilestones",
	async (_, { getState, dispatch }) => {
		try {
			const state = getState() as RootState;
			const userId = state.user.user.baseInfo?.id;
			if (!userId) throw new Error("User is not authenticated");
			const response = await axios.get(`${BASE_URL}/api/user-milestones`, { params: { userId } });

			console.log("response", response.data);

			// The response is an array, get the first element
			const milestoneData = response.data[0] || {};

			const milestones: UserMilestones = {
				exercisesCompleted: milestoneData.exercisescompleted || 0,
				beginnerExercisesCompleted: milestoneData.beginnerexercisescompleted || 0,
				intermediateExercisesCompleted: milestoneData.intermediateexercisescompleted || 0,
				advancedExercisesCompleted: milestoneData.advancedexercisescompleted || 0,
				communityExercisesCompleted: milestoneData.communityexercisescompleted || 0,
				customExercisesCompleted: milestoneData.customexercisescompleted || 0,
				customExercisesCreated: milestoneData.customexercisescreated || 0,
				goalsCreated: milestoneData.goalscreated || 0,
				educationalArticlesCompleted: milestoneData.educationalarticlescompleted || 0,
			};
			dispatch(setMilestonesProgress(milestones));
		} catch (error) {
			console.error("Error fetching milestones progress:", error);
			throw error;
		}
	}
);

export const updateUserMilestone = createAsyncThunk(
	"milestones/updateUserMilestone",
	async (
		{ milestoneType, exerciseDifficulty }: { milestoneType: string; exerciseDifficulty?: string },
		{ getState, dispatch }
	) => {
		try {
			const state = getState() as RootState;
			const userId = state.user.user.baseInfo?.id;
			if (!userId) throw new Error("User is not authenticated");

			await axios.patch(`${BASE_URL}/api/user-milestones`, {
				userId,
				milestoneType,
				exerciseDifficulty,
			});

			// Refresh milestones after update
			dispatch(fetchUserMilestones());
		} catch (error) {
			console.error("Error updating milestone:", error);
			throw error;
		}
	}
);

export const updateSubscriptionStatus = createAsyncThunk<void, UserSubscriptionState>(
	"auth/updateSubscriptionStatus",
	async (subscriptionData: UserSubscriptionState, { dispatch, getState }) => {
		try {
			const state = getState() as RootState;
			const userId = state.user.user.baseInfo?.id;

			if (!userId) throw new Error("User is not authenticated");

			await axios.post(`${BASE_URL}/api/auth/update-subscription`, {
				userId,
				isSubscribed: subscriptionData.isSubscribed,
			});

			dispatch(setSubscriptionStatus(subscriptionData));
		} catch (error) {
			console.error("Error updating subscription status:", error);
			throw error;
		}
	}
);
