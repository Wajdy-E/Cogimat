import { Text } from "react-native";
import { View } from "react-native";
import TopGap from "../../components/TopGap";
import {
	Avatar,
	AvatarBadge,
	AvatarFallbackText,
} from "../components/ui/avatar"; // Make sure to import the Avatar component
import { useSelector } from "react-redux";
import { UserState } from "../../reducers/userSlice";

function Account() {
	const { firstName, lastName, username } = useSelector(({ user }: UserState) => ({
		firstName: user.baseInfo?.firstName,
		lastName: user.baseInfo?.lastName,
		username : user.baseInfo?.username
	}));
	return (
		<View className="h-screen">
			<TopGap />
			<View className="items-center mt-4">
				<Avatar size="xl">
					<AvatarFallbackText>
						{firstName ? firstName.charAt(0).toUpperCase() : ""}{" "}
						{lastName ? lastName.charAt(0).toUpperCase() : ""}
					</AvatarFallbackText>
					<AvatarBadge />
				</Avatar>
				<Text className="mt-2 text-lg">{username}</Text>
			</View>
		</View>
	);
}

export default Account;
