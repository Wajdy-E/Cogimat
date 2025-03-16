import WebView from "react-native-webview";

function youtubeVideo() {
	return (
		<WebView
			source={{ uri: "https://www.youtube.com/embed/Z_6v7b7BLmg?si=PIDQMzJVGTqDv-Do" }}
			style={{ flex: 1, maxHeight: 250 }}
		/>
	);
}

export default youtubeVideo;
