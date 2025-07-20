import React from 'react';
import { View, Image as RNImage, Text, ScrollView } from 'react-native';

interface MediaItem {
	type: 'youtube' | 'video' | 'image';
	url: string;
	thumbnail?: string;
}

interface MediaSlideshowProps {
	mediaItems: MediaItem[];
	height?: number;
	autoPlay?: boolean;
	autoPlayInterval?: number;
	showControls?: boolean;
	placeholderImage?: any;
}

export default function MediaSlideshow ({
	mediaItems = [],
	height = 200,
	autoPlay = false,
	autoPlayInterval = 3000,
	showControls = true,
	placeholderImage,
}: MediaSlideshowProps) {
	// If no media items, show placeholder
	if (mediaItems.length === 0) {
		return (
			<ScrollView style={{ height, width: '100%' }}>
				<View style={{ height, width: '100%' }}>
					{placeholderImage && (
						<RNImage
							source={placeholderImage}
							style={{
								height: '100%',
								width: '100%',
							}}
							resizeMode="cover"
						/>
					)}
				</View>
			</ScrollView>
		);
	}

	// If only one item, show it directly
	if (mediaItems.length === 1) {
		const item = mediaItems[0];

		if (item.type === 'image') {
			return (
				<ScrollView style={{ height, width: '100%' }}>
					<View style={{ height, width: '100%' }}>
						<RNImage
							source={{ uri: item.url }}
							style={{
								height: '100%',
								width: '100%',
							}}
							resizeMode="cover"
						/>
					</View>
				</ScrollView>
			);
		}

		return (
			<ScrollView style={{ height, width: '100%' }}>
				<View style={{ height, width: '100%' }}>
					<Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
						Single {item.type} - {item.url.substring(0, 50)}...
					</Text>
				</View>
			</ScrollView>
		);
	}

	// Multiple items - simple slideshow
	return (
		<ScrollView style={{ height, width: '100%' }}>
			<View style={{ height, width: '100%' }}>
				<Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
					MULTIPLE ITEMS - {mediaItems.length} items
				</Text>
				<Text style={{ color: 'white', textAlign: 'center' }}>
					First: {mediaItems[0].type} - {mediaItems[0].url.substring(0, 30)}...
				</Text>
			</View>
		</ScrollView>
	);
}
