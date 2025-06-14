export interface UserBase {
	firstName: string | null;
	lastName: string | null;
	email: string;
	username?: string | null;
	createdAt?: Date | null;
	id: string;
	isSubscribed: boolean;
	isAdmin: boolean;
}

export interface Exercise {
	id: number;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	description: string;
	timeToComplete: string;
	instructions: string;
	parameters: ExerciseParameters;
	trackingData: Record<string, any>;
	videoUrl: string;
	imageFileName: string;
	isFavourited: boolean;
	focus: string;
	isPremium: boolean;
}

export interface ExerciseParameters {
	shapes?: Shape[];
	colors?: ColorOption[];
	numbers?: NumberEnum[];
	letters?: Letter[];
}

export enum ExerciseDifficulty {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
}

export enum Color {
	GREEN = "GREEN",
	YELLOW = "YELLOW",
	RED = "RED",
	BLUE = "BLUE",
}

export enum NumberEnum {
	ONE = 1,
	TWO = 2,
	THREE = 3,
	FOUR = 4,
}

export enum Letter {
	A = "A",
	B = "B",
	C = "C",
	D = "D",
}

export enum Shape {
	SQUARE = "SQUARE",
	CIRCLE = "CIRCLE",
	DIAMOND = "DIAMOND",
	TRIANGLE = "TRIANGLE",
}

export interface ColorOption {
	hexcode: string;
	name: Color;
}

export interface NumberOption {
	numAsString: NumberEnum;
	num: Number;
}

export const colorOptions: ColorOption[] = [
	{
		hexcode: "#00FF00",
		name: Color.GREEN,
	},
	{
		hexcode: "#FFFF00",
		name: Color.YELLOW,
	},
	{
		hexcode: "#FF0000",
		name: Color.RED,
	},
	{
		hexcode: "#0000FF",
		name: Color.BLUE,
	},
];

export const numOptions: NumberOption[] = [
	{ numAsString: NumberEnum.ONE, num: 1 },
	{ numAsString: NumberEnum.TWO, num: 2 },
	{ numAsString: NumberEnum.THREE, num: 3 },
	{ numAsString: NumberEnum.FOUR, num: 4 },
];

export const letterOptions: Letter[] = [Letter.A, Letter.B, Letter.C, Letter.D];

export interface Goals {
	goal: string;
	id: string;
	completed: boolean;
}
