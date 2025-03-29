import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setCurrentUser, UserBase } from "./authSlice";

const BASE_URL = process.env.BASE_URL;
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
