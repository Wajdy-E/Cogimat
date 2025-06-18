import { signIn } from "next-auth/react";

export async function POST(req: Request) {
	signIn();
}
