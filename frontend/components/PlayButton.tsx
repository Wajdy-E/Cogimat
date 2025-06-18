import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { Play } from "lucide-react-native";
import { CustomExercise, Exercise } from "../store/data/dataSlice";
import { i18n } from "../i18n";

interface PlayButtonProps {
	id?: number;
	exercise?: Exercise | CustomExercise;
	isCustomExercise?: boolean;
	onClick?: () => void;
}

function PlayButton(props: PlayButtonProps) {
	const router = useRouter();
	return (
		<Button
			className="absolute bottom-0 right-0 bg-primary-400 p-3 rounded-full shadow-sm"
			onPress={() => {
				if (props.onClick) {
					props.onClick();
				} else {
					router.push({
						pathname: `${props.isCustomExercise ? `/(custom-exercise)/${props.id}` : `/(exercise)/${props.id}`}`,
						params: {
							data: JSON.stringify(props.exercise),
						},
					});
				}
			}}
			style={{ transform: [{ translateX: -15 }, { translateY: 18 }] }}
			accessibilityLabel={i18n.t("general.buttons.play")}
		>
			<Icon as={Play} size="lg" fill="white" className="fill-white stroke-white" />
		</Button>
	);
}

export default PlayButton;
