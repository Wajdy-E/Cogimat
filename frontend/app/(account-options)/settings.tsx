import { SafeAreaView, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BackButton from "../../components/BackButton";
import CustomSelect from "../../components/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setTheme, Theme } from "../../reducers/userSlice";
import { useState } from "react";
import { Heading } from "@/components/ui/heading";
function Settings() {
	const dispatch = useDispatch();
	const theme = useSelector(
		(state: RootState) => state.user.user.settings?.theme || "light"
	);

	const [rerender, setRerender] = useState(false);
	function handleThemeChange(newTheme: string) {
		dispatch(setTheme(newTheme as Theme));
		setRerender((prev) => !prev);
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView className={`${rerender} bg-secondary-500 h-screen`}>
				<View className="w-full flex justify-center items-center">
					<View className="w-[80%]">
						<BackButton />
						<View className="flex-row justify-between">
							<Heading size="xl">Theme</Heading>
							<CustomSelect
								options={[
									{ label: "Light", value: "light" },
									{ label: "Dark", value: "dark" },
								]}
								placeholder="Select Theme"
								value={theme}
								onChange={handleThemeChange}
							/>
						</View>
					</View>
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

export default Settings;
