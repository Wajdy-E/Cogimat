import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserSubscriptionState {
	isMonthly: boolean;
	isSubscribed: boolean;
}

export interface UserBase {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	createdAt: string;
	id: string;
	profileImageURL: string;
}

export enum Theme {
	Light = "light",
	Dark = "dark",
}

export enum LanguageEnum {
	English = "en",
	French = "fr",
	Japanese = "ja",
	Korean = "ko",
}
export interface UserSettings {
	theme: Theme;
	allowNotifications: boolean;
	allowEmails: boolean;
	language: LanguageEnum;
}

export interface User {
	baseInfo: UserBase | null;
	subscription: UserSubscriptionState | null;
	settings: UserSettings | null;
}

export interface UserState {
	user: User;
}

const initialState: UserState = {
	user: {
		baseInfo: null,
		subscription: null,
		settings: null,
	},
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setCurrentUser(state, action: PayloadAction<UserBase>) {
			state.user.baseInfo = action.payload;
		},
	},
});

export const { setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
