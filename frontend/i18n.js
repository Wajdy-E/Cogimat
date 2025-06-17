import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_STORAGE_KEY = "app_language";

// Function to initialize language from storage
export const initializeLanguage = async () => {
	try {
		const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
		if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr" || savedLanguage === "ja")) {
			return savedLanguage;
		}
	} catch (error) {
		console.error("Error loading saved language:", error);
	}

	// Fallback to device locale or English
	const deviceLocale = getLocales()[0].languageCode;
	if (deviceLocale === "fr" || deviceLocale === "ja") {
		return deviceLocale;
	}
	return "en";
};

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
			welcomeBack: "Welcome Back!",
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
		forgotPassword: {
			title: "Forgot Password",
			email: "Email",
			emailPlaceholder: "Enter your email",
			enterResetCode: "Enter the reset",
			resetCodePlaceholder: "Enter reset code",
			sendPasswordResetCode: "Send password reset code",
			passwordResetCodeSent: "Password reset code sent",
			passwordResetCodeSentMessage: "Please check your email for a password reset code.",
			reset: "Reset",
			resetCode: "Reset Code",
			newPassword: "New Password",
			newPasswordPlaceholder: "Enter new password",
			resetCodeRequired: "Reset code is required",
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
				play: "Play Exercise",
				favorite: "Toggle Favorite",
				confirm: "Confirm",
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
			alerts: {
				warning: "Warning",
				error: "Error",
				success: "Success",
				info: "Information",
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
			premium: {
				locked: "Premium",
				unlocked: "Premium ✓",
				upgradeTitle: "Upgrade to Access",
				upgradeMessage: "This is a premium exercise. Upgrade to CogiPro to access this and other premium features.",
			},
			sections: {
				customization: "Customization",
				durationSettings: "Duration Settings",
				colorSettings: "Color Settings",
			},
			page: {
				description: "Description",
				instructions: "Instructions",
				makePublic: "Make Exercise Public",
				submitToCogipro: "Submit to Cogipro",
				makePublicMessage:
					"Are you sure you want to make this exercise public? This will allow other users to see and use it.",
			},
			card: {
				minutes: "min",
				seconds: "sec",
				imageAlt: "Exercise thumbnail",
			},
		},
		progress: {
			milestones: "Milestones",
			overview: "Overview",
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
		exerciseProgress: {
			stimulus: "Stimulus",
			count: "Count",
		},
		paywall: {
			title: "Upgrade to CogiPro",
			subtitle: "Unlock all premium features",
			features: {
				title: "What you'll get",
				list: [
					"Unlimited custom exercises",
					"Advanced exercise tracking",
					"Priority support",
					"Ad-free experience",
					"Exclusive content updates",
				],
			},
			pricing: {
				monthly: "Monthly",
				annual: "Annual",
				monthlyPrice: "$9.99/month",
				annualPrice: "$79.99/year",
				annualSaving: "Save 33%",
			},
			buttons: {
				subscribe: "Continue",
				restore: "Restore Purchases",
			},
		},
		upgradeCard: {
			title: "Upgrade to CogiPro",
			description:
				"Get exclusive access to unique and creative ways to use your Cogimat, featuring exercises designed by our expert team.",
			button: "Upgrade",
		},
	},
	fr: {
		pages: {
			home: "Accueil",
			progress: "Progrès",
			createExercise: "Créer un exercice",
			favourites: "Favoris",
			account: "Compte",
		},
		home: {
			greeting: "Salut, {{name}}",
			subtitle: "Il est temps de repousser vos limites.",
			tabs: {
				allExercises: "Tous les exercices",
				interactiveExercises: "Exercices interactifs",
				noCustomExercises: "Vous n'avez créé aucun exercice personnalisé",
				createCustomExercise: "Créer mon premier exercice personnalisé",
				noPublicExercises: "Il n'y a pas d'exercices publics. Veuillez vérifier plus tard.",
				myCustomExercises: "Mes exercices personnalisés",
				community: "Communauté",
			},
			exercisePrograms: {
				allTitle: "Programmes d'exercices",
				customTitle: "Mes exercices personnalisés",
				communityTitle: "Exercices de la communauté",
				seeAll: "Voir tout",
			},
			exerciseOfTheDay: "Exercice du jour",
			articleDateFormat: "D MMMM YYYY",
		},
		account: {
			signout: "Se déconnecter",
			username: "Nom d'utilisateur",
			signOutConfirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
			deleteAccountConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ?",
			deleteAccount: "Supprimer le compte",
			title: "Compte",
			email: "Adresse e-mail",
			subscribe: "S'abonner à CogiPro",
			subscriptionCode: "J'ai un code QR d'abonnement",
			viewReport: "Voir le rapport de fitness",
			askTeam: "Question de fitness ? Demandez à notre équipe",

			appSettings: "Paramètres de l'application",
			notifications: "Notifications",
			darkMode: "Mode sombre",
			emailMarketing: "Marketing par e-mail",
			appLanguage: "Langue de l'application",
			english: "🇬🇧 Anglais",
			français: "🇫🇷 Français",
			日本語: "🇯🇵 Japonais",
			help: "Aide",
			billingHelp: "Aide pour le compte et la facturation",
			contactSupport: "Contacter le support",
			restore: "Restaurer l'abonnement",

			legal: "Mentions légales",
			terms: "Conditions générales",
			privacy: "Politique de confidentialité",
			version: "Version",
		},
		signup: {
			title: "S'inscrire",
			verifyEmailTitle: "Vérifiez votre e-mail",
			verify: "Vérifier",
			verifyCode: "Code de vérification",
			verifyCodePlaceholder: "Entrez votre code de vérification",
			orSignUpWith: "Ou s'inscrire avec",
			googleSignUp: "Continuer avec Google",
			appleSignUp: "Continuer avec Apple",
			alreadyHaveAccount: "Vous avez déjà un compte ?",
			login: "Se connecter",
			alert: {
				invalidData: "Données d'inscription invalides",
				verificationFailed: "La vérification a échoué",
			},
			form: {
				firstName: "Prénom",
				firstNamePlaceholder: "Entrez votre prénom",
				lastName: "Nom de famille",
				lastNamePlaceholder: "Entrez votre nom de famille",
				email: "E-mail",
				emailPlaceholder: "Entrez votre e-mail",
				password: "Mot de passe",
				passwordPlaceholder: "Entrez votre mot de passe",
				signUp: "S'inscrire",
			},
			errors: {
				firstNameShort: "Le prénom doit contenir au moins 2 caractères",
				firstNameRequired: "Le prénom est requis",
				lastNameShort: "Le nom de famille doit contenir au moins 2 caractères",
				lastNameRequired: "Le nom de famille est requis",
				invalidEmail: "Adresse e-mail invalide",
				emailRequired: "L'e-mail est requis",
				passwordShort: "Le mot de passe doit contenir au moins 6 caractères",
				passwordRequired: "Le mot de passe est requis",
			},
		},
		login: {
			title: "Se connecter",
			welcomeBack: "Bon retour !",
			email: "E-mail",
			emailPlaceholder: "Entrez votre e-mail",
			password: "Mot de passe",
			passwordPlaceholder: "Entrez votre mot de passe",
			forgotPassword: "Mot de passe oublié ?",
			loginButton: "Connexion",
			orSignInWith: "Ou se connecter avec",
			googleSignIn: "Continuer avec Google",
			appleSignIn: "Continuer avec Apple",
			noAccount: "Vous n'avez pas de compte ?",
			signUp: "S'inscrire",
			alerts: {
				validationError: "Erreur de validation",
				invalidCredentials: "La connexion a échoué. Veuillez vérifier vos identifiants.",
			},
			errors: {
				invalidEmail: "Format d'e-mail invalide",
				emailRequired: "L'e-mail est requis",
				passwordShort: "Le mot de passe doit contenir au moins 6 caractères",
				passwordRequired: "Le mot de passe est requis",
			},
		},
		forgotPassword: {
			title: "Mot de passe oublié",
			email: "E-mail",
			emailPlaceholder: "Entrez votre e-mail",
			enterResetCode: "Entrez le code de réinitialisation",
			resetCodePlaceholder: "Entrez le code de réinitialisation",
			sendPasswordResetCode: "Envoyer le code de réinitialisation",
			passwordResetCodeSent: "Code de réinitialisation envoyé",
			passwordResetCodeSentMessage: "Veuillez vérifier votre e-mail pour le code de réinitialisation.",
			reset: "Réinitialiser",
			resetCode: "Code de réinitialisation",
			newPassword: "Nouveau mot de passe",
			newPasswordPlaceholder: "Entrez le nouveau mot de passe",
			resetCodeRequired: "Le code de réinitialisation est requis",
		},

		general: {
			buttons: {
				next: "Suivant",
				previous: "Précédent",
				done: "Terminé",
				cancel: "Annuler",
				save: "Enregistrer",
				submit: "Soumettre",
				delete: "Supprimer",
				edit: "Modifier",
				play: "Jouer l'exercice",
				favorite: "Basculer favori",
				confirm: "Confirmer",
			},
			time: {
				seconds: "secondes",
				minutes: "minutes",
				hours: "heures",
				days: "jours",
			},
			pageSubHeadings: {
				allExercises: "Tous les exercices",
				myCustomExercises: "Mes exercices personnalisés",
			},
			filters: {
				all: "Tous",
				standard: "Nos exercices",
				custom: "Mes exercices",
				favouritesOnly: "Favoris uniquement",
				difficulty: "Difficulté",
				sort: "Trier",
				sortAZ: "A → Z",
				sortZA: "Z → A",
			},
			noExercisesFound: "Aucun exercice trouvé",
			alerts: {
				warning: "Avertissement",
				error: "Erreur",
				success: "Succès",
				info: "Information",
			},
		},
		createExercise: {
			steps: {
				description: "Détails de l'exercice",
				settings: "Paramètres",
			},
			form: {
				nameLabel: "Nom de l'exercice",
				namePlaceholder: "Entrez le nom de l'exercice",
				descriptionLabel: "Description",
				focusLabel: "Focus",
				focusPlaceholder: "Entrez les zones de focus",
				descriptionPlaceholder: "Entrez la description",
				instructionsLabel: "Instructions",
				instructionsPlaceholder: "Votre texte ici...",
				difficultyLabel: "Difficulté",
				difficultyPlaceholder: "Difficulté (Facile, Moyen, Difficile)",
				focusHelper: "Liste séparée par des virgules des zones de focus",
				sets: "Séries",
				reps: "Répétitions",
				restTime: "Temps de repos",
				restTimePlaceholder: "Entrez le temps de repos",
				ytUrl: "URL YouTube",
				ytUrlPlaceholder: "Entrez l'URL YouTube",
				ytUrlHelper: "Lorsqu'entré, remplace la vidéo téléchargée ci-dessous",
			},
		},
		exercise: {
			difficulty: {
				beginner: "Débutant",
				intermediate: "Intermédiaire",
				advanced: "Avancé",
			},
			form: {
				offScreenTime: "Temps hors écran",
				onScreenTime: "Temps à l'écran",
				exerciseTime: "Temps d'exercice",
				restTime: "Temps de repos",
				offScreenColor: "Couleur hors écran {{offScreenColor}}",
				onScreenColor: "Couleur à l'écran {{onScreenColor}}",
				startNow: "Commencer maintenant",
			},
			premium: {
				locked: "Premium",
				unlocked: "Premium ✓",
				upgradeTitle: "Mettre à niveau pour accéder",
				upgradeMessage:
					"Ceci est un exercice premium. Mettez à niveau vers CogiPro pour accéder à cette fonctionnalité et à d'autres fonctionnalités premium.",
			},
			sections: {
				customization: "Personnalisation",
				durationSettings: "Paramètres de durée",
				colorSettings: "Paramètres de couleur",
			},
			page: {
				description: "Description",
				instructions: "Instructions",
				makePublic: "Rendre l'exercice public",
				makePublicMessage:
					"Êtes-vous sûr de vouloir rendre cet exercice public ? Cela permettra à d'autres utilisateurs de le voir et de l'utiliser.",
			},
			card: {
				minutes: "min",
				seconds: "sec",
				imageAlt: "Miniature de l'exercice",
			},
		},
		progress: {
			milestones: "Étapes importantes",
			overview: "Aperçu",
			actions: {
				deleteGoal: "Êtes-vous sûr de vouloir supprimer cet objectif ?",
			},
			days: {
				monday: "Lundi",
				tuesday: "Mardi",
				wednesday: "Mercredi",
				thursday: "Jeudi",
				friday: "Vendredi",
				saturday: "Samedi",
				sunday: "Dimanche",
			},
			goals: {
				workouts: "ENTRAÎNEMENTS",
				milestones: "ÉTAPES IMPORTANTES",
				weeklyGoal: "OBJECTIF HEBDOMADAIRE",
				tbd: "À DÉFINIR",
				customGoalsTitle: "Mes objectifs personnalisés",
				setGoalButton: "Définir un nouvel objectif",
				modal: {
					label: "Définir un objectif",
					placeholder: "ex. Compléter 5 entraînements",
				},
			},
		},
		yupErrors: {
			form: {
				nameRequired: "Le nom est requis",
				nameMin: "Le nom doit contenir au moins 3 caractères",
				nameMax: "Le nom ne peut pas dépasser 50 caractères",

				descriptionRequired: "La description est requise",
				descriptionMin: "La description doit contenir au moins 10 caractères",
				descriptionMax: "La description ne peut pas dépasser 500 caractères",

				instructionsRequired: "Les instructions sont requises",
				instructionsMin: "Les instructions doivent contenir au moins 10 caractères",
				instructionsMax: "Les instructions ne peuvent pas dépasser 1000 caractères",

				focusMin: "Le focus doit être un mot",
				focusMax: "Maximum 5 points de focus",

				difficultyRequired: "La difficulté est requise",
				difficultyInvalid: "Niveau de difficulté invalide",

				visualInputMissing: "Sélectionnez au moins une forme, lettre, nombre ou couleur",

				offScreenTime: "Le temps hors écran doit être d'au moins 0,5 seconde",
				onScreenTime: "Le temps à l'écran doit être d'au moins 0,5 seconde",
				exerciseTime: "Le temps d'exercice doit être d'au moins 1 minute",
				restTime: "Le temps de repos doit être d'au moins 1 seconde",

				offScreenColor: "La couleur hors écran est requise",
				onScreenColor: "La couleur à l'écran est requise",

				invalidUrl: "Doit être une URL valide",

				firstNameRequired: "Le prénom est requis",
				firstNameMin: "Le prénom doit contenir au moins 2 caractères",

				lastNameRequired: "Le nom de famille est requis",
				lastNameMin: "Le nom de famille doit contenir au moins 2 caractères",

				emailRequired: "L'e-mail est requis",
				emailInvalid: "Adresse e-mail invalide",

				passwordRequired: "Le mot de passe est requis",
				passwordMin: "Le mot de passe doit contenir au moins 6 caractères",
			},
		},
		milestones: {
			exercisesCompleted: {
				heading: "Total des exercices terminés",
				description: "Suivez le nombre total d'exercices que vous avez terminés dans tous les types.",
				subtext: "{{count}}% de votre objectif",
			},
			beginner: {
				heading: "Exercices débutants",
				description: "Construisez votre base en terminant l'entraînement de niveau débutant.",
				subtext: "{{count}}% de votre objectif",
			},
			intermediate: {
				heading: "Exercices intermédiaires",
				description: "Défiez-vous avec des tâches de niveau intermédiaire.",
				subtext: "{{count}}% de votre objectif",
			},
			advanced: {
				heading: "Exercices avancés",
				description: "Prouvez vos compétences avec des exercices de difficulté avancée.",
				subtext: "{{count}}% de votre objectif",
			},
			customCreated: {
				heading: "Exercices personnalisés créés",
				description: "Créez et personnalisez vos propres routines d'entraînement.",
				subtext: "{{count}}% de votre objectif",
			},
			goals: {
				heading: "Objectifs créés",
				description: "Définissez des objectifs pour rester motivé et sur la bonne voie avec vos progrès.",
				subtext: "{{count}}% de votre objectif",
			},
			articles: {
				heading: "Articles éducatifs lus",
				description: "Élargissez vos connaissances en terminant les supports d'apprentissage.",
				subtext: "{{count}}% de votre objectif",
			},
		},
		exerciseProgress: {
			stimulus: "Stimulus",
			count: "Compteur",
		},
		paywall: {
			title: "Mettre à niveau vers CogiPro",
			subtitle: "Débloquez toutes les fonctionnalités premium",
			features: {
				title: "Ce que vous obtiendrez",
				list: [
					"Exercices personnalisés illimités",
					"Suivi avancé des exercices",
					"Support prioritaire",
					"Expérience sans publicité",
					"Mises à jour de contenu exclusives",
				],
			},
			pricing: {
				monthly: "Mensuel",
				annual: "Annuel",
				monthlyPrice: "9,99 €/mois",
				annualPrice: "79,99 €/an",
				annualSaving: "Économisez 33%",
			},
			buttons: {
				subscribe: "Continuer",
				restore: "Restaurer les achats",
			},
		},
		upgradeCard: {
			title: "Mettre à niveau vers CogiPro",
			description:
				"Obtenez un accès exclusif à des moyens uniques et créatifs d'utiliser votre Cogimat, avec des exercices conçus par notre équipe d'experts.",
			button: "Mettre à niveau",
		},
	},
};
export const i18n = new I18n(translations);

// Initialize with device locale, will be updated by initializeLanguage() when called
i18n.locale = getLocales()[0].languageCode ?? "en";

i18n.enableFallback = true;
