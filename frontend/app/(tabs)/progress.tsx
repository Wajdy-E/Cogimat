import { ScrollView, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { i18n } from "../../i18n";
import { getLocales } from "expo-localization";

function progress() {
	return (
		<View>
			<ScrollView showsHorizontalScrollIndicator={false} className="mt-6">
				<VStack space="md">
					<View>
						<Text>
							{i18n.t("welcome")} {i18n.t("name")}
						</Text>
						<Text>Current locale: {i18n.locale}</Text>
						<Text>Device locale: {getLocales()[0].languageCode}</Text>
					</View>
				</VStack>
			</ScrollView>
		</View>
	);
}

export default progress;
