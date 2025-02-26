require("dotenv").config();
const jwt = require("jsonwebtoken");

const teamId = "V3VL862DLJ"; // Your Team ID
const keyId = "BNVHWH64DK"; // Your Key ID
const clientId = "com.cogipro.service"; // Your Service ID
const privateKey = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"); // Load private key from environment variable

// Function to generate Apple Client Secret
const generateAppleClientSecret = () => {
	return jwt.sign(
		{
			iss: teamId,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 15777000, // ~6 months
			aud: "https://appleid.apple.com",
			sub: clientId,
		},
		privateKey,
		{
			algorithm: "ES256",
			keyid: keyId,
		}
	);
};

const appleClientSecret = generateAppleClientSecret();
console.log("Apple Client Secret:", appleClientSecret);
