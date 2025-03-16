import React from "react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { Icon, ArrowRightIcon } from "@/components/ui/icon";

export interface BlogCardProps {
	/** URL for the image to display */
	imageUri: string;
	/** Alt text for the image */
	imageAlt: string;
	/** Date string to display (e.g. "May 15, 2023") */
	date: string;
	/** Title or heading for the blog card */
	title: string;
	/** URL to navigate to when the link is clicked */
	linkUrl: string;
	/** Optional text for the link (defaults to "Read Blog") */
	linkText?: string;
	/** Optional custom className for the card */
	cardClassName?: string;
	/** Optional custom className for the image */
	imageClassName?: string;
	/** Optional custom className for the date text */
	textClassName?: string;
	/** Optional custom className for the heading */
	headingClassName?: string;
	/** Optional custom className for the link text */
	linkTextClassName?: string;
}

export default function BlogCard(props: BlogCardProps) {
	return (
		<Card className={props.cardClassName}>
			<Image source={{ uri: props.imageUri }} className={props.imageClassName} alt={props.imageAlt} />
			<Text className={props.textClassName}>{props.date}</Text>
			<Heading size="md" className={props.headingClassName}>
				{props.title}
			</Heading>
			<Link href={props.linkUrl} isExternal>
				<HStack className="items-center">
					<LinkText size="sm" className={props.linkTextClassName}>
						{props.linkText || "Read Blog"}
					</LinkText>
					<Icon as={ArrowRightIcon} size="sm" className="text-info-600 mt-0.5 ml-0.5" />
				</HStack>
			</Link>
		</Card>
	);
}
