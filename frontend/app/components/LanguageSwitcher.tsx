// import React, { useState, useEffect } from "react";
// import { View, Button, Text } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import i18n from "../i18n";

// const LanguageSwitcher = () => {
// 	const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

// 	useEffect(() => {
// 		const loadLanguage = async () => {
// 			const storedLanguage = await AsyncStorage.getItem("appLanguage");
// 			if (storedLanguage) {
// 				i18n.locale = storedLanguage;
// 				setCurrentLanguage(storedLanguage); // Update state to trigger re-render
// 			}
// 		};
// 		loadLanguage();
// 	}, []);

// 	const changeLanguage = async (lang: string) => {
// 		i18n.locale = lang;
// 		setCurrentLanguage(lang);
// 	};

// 	return (
// 		<View>
// 			<Text>Current Language: {currentLanguage}</Text>
// 			<Button title="English" onPress={() => changeLanguage("en")} />
// 			<Button title="Français" onPress={() => changeLanguage("fr")} />
// 			<Button title="한국어" onPress={() => changeLanguage("ko")} />
// 			<Button title="日本語" onPress={() => changeLanguage("ja")} />
// 		</View>
// 	);
// };

// export default LanguageSwitcher;
