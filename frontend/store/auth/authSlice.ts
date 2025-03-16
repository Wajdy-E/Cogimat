import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist/lib/constants";
export interface UserSubscriptionState {
	isMonthly: boolean;
	isSubscribed: boolean;
}

export interface UserBase {
	firstName: string | null;
	lastName: string | null;
	email: string;
	username: string | null;
	createdAt?: Date | null;
	id: string;
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
	isSignedIn: boolean;
}

const initialState: UserState = {
	user: {
		baseInfo: null,
		subscription: null,
		settings: {
			theme: Theme.Light, // Default to light theme
			allowNotifications: true,
			allowEmails: true,
			language: LanguageEnum.English,
		},
	},
	isSignedIn: false,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setCurrentUser(state, action: PayloadAction<UserBase>) {
			state.user.baseInfo = action.payload;
		},
		toggleTheme(state) {
			state.user.settings!.theme = state.user.settings!.theme === Theme.Light ? Theme.Dark : Theme.Light;
		},
		setTheme(state, action: PayloadAction<Theme>) {
			state.user.settings!.theme = action.payload;
		},
		setNotifications(state, action: PayloadAction<boolean>) {
			state.user.settings!.allowNotifications = action.payload;
		},
		setIsSignedIn(state) {
			state.isSignedIn = !state.isSignedIn;
		},
	},
});

export const { setCurrentUser, toggleTheme, setTheme, setNotifications, setIsSignedIn } = userSlice.actions;
export default userSlice.reducer;
