import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { i18n } from "../i18n";
import { Trophy } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { useDispatch } from "react-redux";
import { setPaywallModalPopup } from "@/store/data/dataSlice";
export default function UpgradeCard() {
	const dispatch = useDispatch();

	return (
		<Card>
			<Box className="flex flex-col gap-4">
				<Box className="flex flex-row gap-4">
					<Icon as={Trophy} size="xl" />
					<Heading>{i18n.t("upgradeCard.title")}</Heading>
				</Box>
				<Text>{i18n.t("upgradeCard.description")}</Text>
				<Button onPress={() => dispatch(setPaywallModalPopup(true))}>
					<ButtonText>{i18n.t("upgradeCard.button")}</ButtonText>
				</Button>
			</Box>
		</Card>
	);
}
