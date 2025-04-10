import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const translations = {
	en: {
		pages: {
			home: "Home",
			progress: "Progress",
			createExercise: "Create Exercise",
			favourites: "Favourites",
			account: "Account",
		},
		home: {
			greeting: "Hi, {{name}}",
			subtitle: "It's time to challenge your limits.",
			tabs: {
				allExercises: "All Exercises",
				interactiveExercises: "Interactive Exercises",
				myCustomExercises: "My Custom Exercises",
				community: "Community",
			},
			exercisePrograms: {
				title: "Exercise programs",
				seeAll: "See All",
			},
			exerciseOfTheDay: "Exercise of the day",
			articleDateFormat: "MMMM D, YYYY",
		},
		account: {
			signout: "Sign out",
			deleteAccount: "Delete account",
			title: "Account",
			email: "Email Address",
			subscribe: "Subscribe to CogiPro",
			subscriptionCode: "I Have a Subscription QR Code",
			viewReport: "View fitness report",
			askTeam: "Fitness question? Ask our team",

			appSettings: "App Settings",
			notifications: "Notifications",
			darkMode: "Dark Mode",
			emailMarketing: "Email Marketing",

			help: "Help",
			billingHelp: "Account & Billing Help",
			contactSupport: "Contact Support",
			restore: "Restore Subscription",

			legal: "Legal",
			terms: "Terms & Conditions",
			privacy: "Privacy Policy",
			version: "Version",
		},
		signup: {
			title: "Sign Up",
			verifyEmailTitle: "Verify Your Email",
			verify: "Verify",
			verifyCode: "Verification Code",
			verifyCodePlaceholder: "Enter your verification code",
			orSignUpWith: "Or sign up with",
			googleSignUp: "Continue with Google",
			appleSignUp: "Continue with Apple",
			alreadyHaveAccount: "Already have an account?",
			login: "Log in",
			alert: {
				invalidData: "Invalid signup data",
				verificationFailed: "Verification failed",
			},
			form: {
				firstName: "First Name",
				firstNamePlaceholder: "Enter your first name",
				lastName: "Last Name",
				lastNamePlaceholder: "Enter your last name",
				email: "Email",
				emailPlaceholder: "Enter your email",
				password: "Password",
				passwordPlaceholder: "Enter your password",
				signUp: "Sign Up",
			},
			errors: {
				firstNameShort: "First name must be at least 2 characters",
				firstNameRequired: "First name is required",
				lastNameShort: "Last name must be at least 2 characters",
				lastNameRequired: "Last name is required",
				invalidEmail: "Invalid email address",
				emailRequired: "Email is required",
				passwordShort: "Password must be at least 6 characters",
				passwordRequired: "Password is required",
			},
		},
		login: {
			title: "Log In",
			email: "Email",
			emailPlaceholder: "Enter your email",
			password: "Password",
			passwordPlaceholder: "Enter your password",
			forgotPassword: "Forgot Password?",
			loginButton: "Login",
			orSignInWith: "Or Sign In With",
			googleSignIn: "Continue with Google",
			appleSignIn: "Continue with Apple",
			noAccount: "Don't have an account?",
			signUp: "Sign Up",
			alerts: {
				validationError: "Validation Error",
				invalidCredentials: "Login failed. Please check your credentials.",
			},
			errors: {
				invalidEmail: "Invalid email format",
				emailRequired: "Email is required",
				passwordShort: "Password must be at least 6 characters",
				passwordRequired: "Password is required",
			},
		},
		general: {
			buttons: {
				next: "Next",
				previous: "Previous",
				done: "Done",
				cancel: "Cancel",
				save: "Save",
				submit: "Submit",
				delete: "Delete",
				edit: "Edit",
			},
			time: {
				seconds: "seconds",
				minutes: "minutes",
				hours: "hours",
				days: "days",
			},
		},
		createExercise: {
			steps: {
				description: "Exercise details",
				settings: "Settings",
			},
			form: {
				nameLabel: "Exercise Name",
				namePlaceholder: "Enter exercise name",
				descriptionLabel: "Description",
				focusLabel: "Focus",
				focusPlaceholder: "Enter focus areas",
				descriptionPlaceholder: "Enter description",
				instructionsLabel: "Instructions",
				instructionsPlaceholder: "Your text goes here...",
				difficultyLabel: "Difficulty",
				difficultyPlaceholder: "Difficulty (Easy, Medium, Hard)",
				focusHelper: "Comma separated list of focus areas",
				sets: "Sets",
				reps: "Reps",
				restTime: "Rest Time",
				restTimePlaceholder: "Enter rest time",
			},
		},
		exercise: {
			difficulty: {
				beginner: "Beginner",
				intermediate: "Intermediate",
				advanced: "Advanced",
			},
			form: {
				offScreenTime: "Off screen time",
				onScreenTime: "On screen time",
				exerciseTime: "Exercise time",
				offScreenColor: "Off screen color {{offScreenColor}}",
				onScreenColor: "On screen color {{onScreenColor}}",
				startNow: "Start Now",
			},
			sections: {
				customization: "Customization",
				durationSettings: "Duration Settings",
				colorSettings: "Color Settings",
			},
		},
		yupErrors: {
			form: {
				nameRequired: "Name is required",
				nameMin: "Name must be at least 3 characters",
				nameMax: "Name cannot exceed 50 characters",

				descriptionRequired: "Description is required",
				descriptionMin: "Description must be at least 10 characters",
				descriptionMax: "Description cannot exceed 500 characters",

				instructionsRequired: "Instructions are required",
				instructionsMin: "Instructions must be at least 10 characters",
				instructionsMax: "Instructions cannot exceed 1000 characters",

				focusMin: "Focus must be a word",
				focusMax: "Maximum 5 focus points",

				difficultyRequired: "Difficulty is required",
				difficultyInvalid: "Invalid difficulty level",

				visualInputMissing: "Select at least one of shapes, letters, numbers, or colors",

				offScreenTime: "Off screen time must be at least 0.5 seconds",
				onScreenTime: "On screen time must be at least 0.5 seconds",
				exerciseTime: "Exercise time must be at least 1 minute",
				restTime: "Rest time must be at least 1 second",

				offScreenColor: "Off screen color is required",
				onScreenColor: "On screen color is required",

				invalidUrl: "Must be a valid URL",

				firstNameRequired: "First name is required",
				firstNameMin: "First name must be at least 2 characters",

				lastNameRequired: "Last name is required",
				lastNameMin: "Last name must be at least 2 characters",

				emailRequired: "Email is required",
				emailInvalid: "Invalid email address",

				passwordRequired: "Password is required",
				passwordMin: "Password must be at least 6 characters",
			},
		},
	},
};
export const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? "en";

i18n.enableFallback = true;
i18n.locale = "ja";
