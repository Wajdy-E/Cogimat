import { ImageBackground, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { i18n } from "../i18n";

export default function Home() {
	const backgroundImage = require("../../assets/index.png");
	const logo = require("../../assets/cogiprologo.png");
	const router = useRouter();

	return (
		<View className="flex-1 bg-black">
			<ImageBackground source={backgroundImage} resizeMode="cover" className="h-screen">
				<View className="h-full bg-black/50 justify-center items-center">
					<Image source={logo} resizeMode="contain" className="aspect-square max-w-[250px]" />
					<View className="flex gap-3 w-[250px]">
						<Button className="rounded-xl" size="xl" action="primary" onPress={() => router.navigate("/(auth)/login")}>
							<ButtonText className="text-white">{i18n.t("login.loginButton")}</ButtonText>
						</Button>
						<Button
							className="rounded-xl"
							size="xl"
							variant="outline"
							action="primary"
							onPress={() => router.navigate("/(auth)/signup")}
						>
							<ButtonText>{i18n.t("signup.register")}</ButtonText>
						</Button>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
}
