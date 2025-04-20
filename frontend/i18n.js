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
				noCustomExercises: "You have not created any custom exercises",
				createCustomExercise: "Create my first custom exercise",
				noPublicExercises: "There are no public exercises. Please check again later.",
				myCustomExercises: "My Custom Exercises",
				community: "Community",
			},
			exercisePrograms: {
				allTitle: "Exercise programs",
				customTitle: "My Custom Exercises",
				communityTitle: "Community Exercises",
				seeAll: "See All",
			},
			exerciseOfTheDay: "Exercise of the day",
			articleDateFormat: "MMMM D, YYYY",
		},
		account: {
			signout: "Sign out",
			username: "Username",
			signOutConfirm: "Are you sure you want to sign out?",
			deleteAccountConfirm: "Are you sure you want to delete your account?",
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
			appLanguage: "App Language",
			english: "🇬🇧 English",
			français: "🇫🇷 Français",
			日本語: "🇯🇵 日本語",
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
			pageSubHeadings: {
				allExercises: "All Exercises",
				myCustomExercises: "My Custom Exercises",
			},
			filters: {
				all: "All",
				standard: "Our Exercises",
				custom: "My Exercises",
				favouritesOnly: "Favourited",
				difficulty: "Difficulty",
				sort: "Sort",
				sortAZ: "A → Z",
				sortZA: "Z → A",
			},
			noExercisesFound: "No exercises found",
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
				ytUrl: "Youtube URL",
				ytUrlPlaceholder: "Enter Youtube URL",
				ytUrlHelper: "When entered overrides uploaded video below",
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
				restTime: "Rest Time",
				offScreenColor: "Off screen color {{offScreenColor}}",
				onScreenColor: "On screen color {{onScreenColor}}",
				startNow: "Start Now",
			},
			sections: {
				customization: "Customization",
				durationSettings: "Duration Settings",
				colorSettings: "Color Settings",
			},
			page: {
				description: "Description",
				instructions: "Instructions",
			},
		},
		progress: {
			actions: {
				deleteGoal: "Are you sure you want to delete this goal?",
			},
			days: {
				monday: "Monday",
				tuesday: "Tuesday",
				wednesday: "Wednesday",
				thursday: "Thursday",
				friday: "Friday",
				saturday: "Saturday",
				sunday: "Sunday",
			},
			goals: {
				workouts: "WORKOUTS",
				milestones: "MILESTONES",
				weeklyGoal: "WEEKLY GOAL",
				tbd: "TBD",
				customGoalsTitle: "My Custom Goals",
				setGoalButton: "Set a new goal",
				modal: {
					label: "Set a goal",
					placeholder: "e.g. Complete 5 workouts",
				},
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
		milestones: {
			exercisesCompleted: {
				heading: "Total Exercises Completed",
				description: "Track the total number of exercises you've completed across all types.",
				subtext: "{{count}}% of your goal",
			},
			beginner: {
				heading: "Beginner Exercises",
				description: "Build your foundation by completing beginner-level training.",
				subtext: "{{count}}% of your goal",
			},
			intermediate: {
				heading: "Intermediate Exercises",
				description: "Challenge yourself with intermediate-level tasks.",
				subtext: "{{count}}% of your goal",
			},
			advanced: {
				heading: "Advanced Exercises",
				description: "Prove your skills with advanced difficulty exercises.",
				subtext: "{{count}}% of your goal",
			},
			customCreated: {
				heading: "Custom Exercises Created",
				description: "Create and personalize your own training routines.",
				subtext: "{{count}}% of your goal",
			},
			goals: {
				heading: "Goals Created",
				description: "Set goals to stay motivated and on track with your progress.",
				subtext: "{{count}}% of your goal",
			},
			articles: {
				heading: "Educational Articles Read",
				description: "Expand your knowledge by completing learning materials.",
				subtext: "{{count}}% of your goal",
			},
		},
	},
};
export const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? "en";

i18n.enableFallback = true;
