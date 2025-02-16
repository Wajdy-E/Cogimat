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
		settings: {
			theme: Theme.Light, // Default to light theme
			allowNotifications: true,
			allowEmails: true,
			language: LanguageEnum.English,
		},
	},
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setCurrentUser(state, action: PayloadAction<UserBase>) {
			state.user.baseInfo = action.payload;
		},
		toggleTheme(state) {
			state.user.settings!.theme =
				state.user.settings!.theme === Theme.Light ? Theme.Dark : Theme.Light;
		},
		setTheme(state, action: PayloadAction<Theme>) {
			state.user.settings!.theme = action.payload;
		},
	},
});

export const { setCurrentUser, toggleTheme, setTheme } = userSlice.actions;
export default userSlice.reducer;
