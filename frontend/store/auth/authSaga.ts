import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setCurrentUser, UserBase } from "./authSlice";
import { UserData } from "@clerk/types";

const BASE_URL = process.env.BASE_URL;

export const createUser = createAsyncThunk<UserBase, UserBase>(
	"auth/createUser",
	async (userData: UserBase, { dispatch }) => {
		try {
			const response = await axios.post(`${BASE_URL}/api/auth/signup`, userData);
			dispatch(setCurrentUser(response.data));
			return response.data;
		} catch (error: any) {
			console.error("Error creating user:", error);
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
			console.error("❌ Error in setCurrentUser:", error);
			throw error;
		}
	}
);
