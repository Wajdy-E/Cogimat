export interface UserBase {
	firstName: string | null;
	lastName: string | null;
	email: string;
	username: string | null;
	createdAt?: Date | null;
	id: string;
}

export interface Exercise {
	id: number;
	name: string;
	type: string;
	difficulty: ExerciseDifficulty;
	description: string;
	timeToComplete: string;
	instructions: string;
	parameters: Record<string, any>;
	trackingData: Record<string, any>;
	videoUrl: string;
	imageFileName: string;
	isFavourited: boolean;
	focus: string;
}

export enum ExerciseDifficulty {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
}
