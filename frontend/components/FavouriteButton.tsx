import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Star } from "lucide-react-native";
import { i18n } from "../i18n";

interface FavouriteButtonProps {
	isFavourited: boolean;
	onFavourite: () => void;
}
function FavouriteButton(props: FavouriteButtonProps) {
	return (
		<Button
			className="absolute top-2 right-0 bg-black/50 py-2 px-3 rounded-full"
			style={{ transform: [{ translateX: -15 }, { translateY: 2 }] }}
			onPress={props.onFavourite}
			variant="link"
			accessibilityLabel={i18n.t("general.buttons.favorite")}
		>
			<Icon
				as={Star}
				size="lg"
				color={`${props.isFavourited ? "yellow" : "white"}`}
				fill={`${props.isFavourited ? "yellow" : "white"}`}
				className={`${props.isFavourited ? "fill-yellow-300" : ""}`}
			/>
		</Button>
	);
}

export default FavouriteButton;
