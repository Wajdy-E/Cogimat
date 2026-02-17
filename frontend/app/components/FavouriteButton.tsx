import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Star } from "lucide-react-native";
import { i18n } from "../i18n";
import { View } from "react-native";

interface FavouriteButtonProps {
	isFavourited: boolean;
	onFavourite: () => void;
}
function FavouriteButton(props: FavouriteButtonProps) {
	return (
		<View className="w-full">
			<Button
				className="w-full bg-background-200 rounded-xl"
				onPress={props.onFavourite}
				variant="outline"
				action="secondary"
				accessibilityLabel={i18n.t("general.buttons.favorite")}
			>
				<Icon
					as={Star}
					size="md"
					color={props.isFavourited ? "#fbbf24" : "#6b7280"}
					fill={props.isFavourited ? "#fbbf24" : "transparent"}
					className={props.isFavourited ? "fill-yellow-500" : ""}
				/>
			</Button>
		</View>
	);
}

export default FavouriteButton;
