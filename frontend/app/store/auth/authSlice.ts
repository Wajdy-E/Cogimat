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
	hasQrAccess?: boolean;
	isSubscribed?: boolean;
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

export interface WeeklyExerciseStats {
	thisWeek: number;
	lastWeek: number;
	thisMonth: number;
	today: number;
	dailyBreakdown: Array<{ date: string; count: number }>;
}

export interface UserState {
	user: User;
	isSignedIn: boolean;
	milestones: UserMilestones | null;
	weeklyStats: WeeklyExerciseStats | null;
	cancelledQRSignup: boolean;
	// New authentication flow states
	isLoggingIn: boolean;
	isSigningUp: boolean;
	showQrPrompt: boolean;
	showQrScanner: boolean;
	qrCode: string;
	pendingVerification: boolean;
	verificationCode: string;
	verificationCodeError: string | null;
	sessionId: string | null;
	// Signup form states
	signupForm: {
		email: string;
		password: string;
		confirmPassword: string;
		firstName: string;
		lastName: string;
		showPassword: boolean;
		showConfirmPassword: boolean;
		termsAgreed: boolean;
	};
	// Login form states
	loginForm: {
		email: string;
		password: string;
		showPassword: boolean;
	};
	// Error states
	authError: string | null;
	userAlreadyExists: boolean;
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
	weeklyStats: null,
	cancelledQRSignup: false,
	// New authentication flow states
	isLoggingIn: false,
	isSigningUp: false,
	showQrPrompt: false,
	showQrScanner: false,
	qrCode: "",
	pendingVerification: false,
	verificationCode: "",
	verificationCodeError: null,
	sessionId: null,
	// Signup form states
	signupForm: {
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
		showPassword: false,
		showConfirmPassword: false,
		termsAgreed: false,
	},
	// Login form states
	loginForm: {
		email: "",
		password: "",
		showPassword: false,
	},
	// Error states
	authError: null,
	userAlreadyExists: false,
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setCurrentUser(state, action: PayloadAction<UserBase>) {
			state.user.baseInfo = action.payload;
			console.log("state.user.baseInfo", state.user.baseInfo);
		},
		setBaseInfoSubscription(state, action: PayloadAction<boolean>) {
			if (state.user.baseInfo) {
				state.user.baseInfo.isSubscribed = action.payload;
			}
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
		setEmails(state, action: PayloadAction<boolean>) {
			state.user.settings!.allowEmails = action.payload;
		},
		setLanguage(state, action: PayloadAction<LanguageEnum>) {
			state.user.settings!.language = action.payload;
		},
		setIsSignedIn(state, action: PayloadAction<boolean>) {
			console.log("setIsSignedIn reducer called with:", action.payload);
			state.isSignedIn = action.payload;
		},
		setMilestonesProgress(state, { payload }: PayloadAction<UserMilestones>) {
			state.milestones = payload;
		},
		setWeeklyStats(state, { payload }: PayloadAction<WeeklyExerciseStats>) {
			state.weeklyStats = payload;
		},
		setCancelledQRSignup(state, action: PayloadAction<boolean>) {
			state.cancelledQRSignup = action.payload;
		},
		// New authentication flow actions
		setIsLoggingIn(state, action: PayloadAction<boolean>) {
			state.isLoggingIn = action.payload;
		},
		setIsSigningUp(state, action: PayloadAction<boolean>) {
			console.log("setIsSigningUp reducer called with:", action.payload);
			console.trace("setIsSigningUp stack trace");
			state.isSigningUp = action.payload;
		},
		setShowQrPrompt(state, action: PayloadAction<boolean>) {
			console.log("setShowQrPrompt reducer called with:", action.payload);
			state.showQrPrompt = action.payload;
		},
		setShowQrScanner(state, action: PayloadAction<boolean>) {
			state.showQrScanner = action.payload;
		},
		setQrCode(state, action: PayloadAction<string>) {
			state.qrCode = action.payload;
		},
		setPendingVerification(state, action: PayloadAction<boolean>) {
			state.pendingVerification = action.payload;
		},
		setVerificationCode(state, action: PayloadAction<string>) {
			state.verificationCode = action.payload;
		},
		// Signup form actions
		setSignupFormField(
			state,
			action: PayloadAction<{ field: keyof typeof initialState.signupForm; value: string | boolean }>
		) {
			const { field, value } = action.payload;
			(state.signupForm as any)[field] = value;
		},
		resetSignupForm(state) {
			state.signupForm = initialState.signupForm;
		},
		// Login form actions
		setLoginFormField(
			state,
			action: PayloadAction<{ field: keyof typeof initialState.loginForm; value: string | boolean }>
		) {
			const { field, value } = action.payload;
			(state.loginForm as any)[field] = value;
		},
		resetLoginForm(state) {
			state.loginForm = initialState.loginForm;
		},
		// Error actions
		setAuthError(state, action: PayloadAction<string | null>) {
			state.authError = action.payload;
		},
		setVerificationCodeError(state, action: PayloadAction<string | null>) {
			state.verificationCodeError = action.payload;
		},
		setSessionId(state, action: PayloadAction<string | null>) {
			state.sessionId = action.payload;
		},
		setUserAlreadyExists(state, action: PayloadAction<boolean>) {
			state.userAlreadyExists = action.payload;
		},
		resetAuthState(state) {
			state.isLoggingIn = false;
			state.isSigningUp = false;
			state.showQrPrompt = false;
			state.showQrScanner = false;
			state.qrCode = "";
			state.pendingVerification = false;
			state.verificationCode = "";
			state.sessionId = null;
			state.authError = null;
			state.userAlreadyExists = false;
			state.signupForm = initialState.signupForm;
			state.loginForm = initialState.loginForm;
		},
		resetState: () => initialState,
	},
});

export const {
	setCurrentUser,
	setBaseInfoSubscription,
	toggleTheme,
	setTheme,
	setNotifications,
	setEmails,
	setLanguage,
	setIsSignedIn,
	setMilestonesProgress,
	setWeeklyStats,
	setSubscriptionStatus,
	setCancelledQRSignup,
	// New authentication flow actions
	setIsLoggingIn,
	setIsSigningUp,
	setShowQrPrompt,
	setShowQrScanner,
	setQrCode,
	setPendingVerification,
	setVerificationCode,
	setSignupFormField,
	resetSignupForm,
	setLoginFormField,
	resetLoginForm,
	setAuthError,
	setUserAlreadyExists,
	resetAuthState,
	setVerificationCodeError,
	setSessionId,
} = userSlice.actions;
export default userSlice.reducer;
