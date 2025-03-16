import { UserBase } from "./authSlice";
import { CREATE_USER, SET_CURRENT_USER } from "./authActionTypes";

export const createUserAction = (user: UserBase) => ({
	type: CREATE_USER,
	payload: user,
});

export const setCurrentUserAction = (user: UserBase) => ({
	type: SET_CURRENT_USER,
	payload: user,
});
