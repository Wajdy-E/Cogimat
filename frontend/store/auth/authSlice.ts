import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface UserSubscriptionState {
	isMonthly: boolean;
	isSubscribed: boolean;
	isYearly: boolean;
}

export interface UserBase {
	firstName: string | null;
	lastName: string | null;
	email: string;
	username?: string | null;
	createdAt?: Date | null;
	id: string;
	profileUri?: string | null;
	isAdmin?: boolean;
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

export interface UserMilestones {
	exercisesCompleted: number;
	beginnerExercisesCompleted: number;
	intermediateExercisesCompleted: number;
	advancedExercisesCompleted: number;
	communityExercisesCompleted: number;
	customExercisesCompleted: number;
	customExercisesCreated: number;
	goalsCreated: number;
	educationalArticlesCompleted: number;
}

export interface MilestoneCardConfig {
	key: keyof UserMilestones;
	headingKey: string;
	descriptionKey: string;
	subTextKey: string;
	goalTarget: number;
}

export interface UserState {
	user: User;
	isSignedIn: boolean;
	milestones: UserMilestones | null;
}

const initialState: UserState = {
	user: {
		baseInfo: null,
		subscription: {
			isMonthly: false,
			isSubscribed: false,
			isYearly: false,
		},
		settings: {
			theme: Theme.Light, // Default to light theme
			allowNotifications: true,
			allowEmails: true,
			language: LanguageEnum.English,
		},
	},
	isSignedIn: false,
	milestones: null,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setCurrentUser(state, action: PayloadAction<UserBase>) {
			state.user.baseInfo = action.payload;
		},
		setSubscriptionStatus(state, action: PayloadAction<UserSubscriptionState>) {
			state.user.subscription = action.payload;
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
		setMilestonesProgress(state, { payload }: PayloadAction<UserMilestones>) {
			state.milestones = payload;
		},
		resetState: () => initialState,
	},
});

export const {
	setCurrentUser,
	toggleTheme,
	setTheme,
	setNotifications,
	setIsSignedIn,
	setMilestonesProgress,
	setSubscriptionStatus,
} = userSlice.actions;
export default userSlice.reducer;
