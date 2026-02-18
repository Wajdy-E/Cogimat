import { Box } from '@/components/ui/box';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableData, TableCaption } from '@/components/ui/table';
import { i18n } from '../i18n';
import { View, Text } from 'react-native';
import { Square, Triangle, Circle, Diamond } from 'lucide-react-native';

const isHexColor = (value: unknown): value is string =>
	typeof value === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(value);

const SHAPE_ICONS: Record<string, { icon: typeof Square; color: string }> = {
	SQUARE: { icon: Square, color: '#FF0000' },
	TRIANGLE: { icon: Triangle, color: '#00FF00' },
	CIRCLE: { icon: Circle, color: '#FFFF00' },
	DIAMOND: { icon: Diamond, color: '#0000FF' },
};

const isShape = (value: unknown): value is string =>
	typeof value === 'string' && value.toUpperCase() in SHAPE_ICONS;

function ColorCell({ hexcode }: { hexcode: string }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
			<View
				style={{
					width: 28,
					height: 28,
					borderRadius: 6,
					backgroundColor: hexcode,
					borderWidth: 1,
					borderColor: 'rgba(0,0,0,0.15)',
				}}
			/>
			<Text className="text-typography-950 font-medium">{hexcode}</Text>
		</View>
	);
}

function ShapeCell({ shape }: { shape: string }) {
	const { icon: Icon, color } = SHAPE_ICONS[shape.toUpperCase()] ?? { icon: Square, color: '#CCCCCC' };
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
			<Icon size={24} color={color} fill={color} />
			<Text className="text-typography-950 font-medium">{shape}</Text>
		</View>
	);
}

export interface TableProps {
	tableHeadKeys: string[];
	rowData: Record<any, any>[];
	caption?: string;
}

function CustomTable (props: TableProps) {
	return (
		<Box className="rounded-md overflow-hidden w-full border border-solid border-outline-200">
			<Table className="w-full">
				<TableHeader className="bg-background-700 text-typography-950">
					<TableRow>
						{props.tableHeadKeys.map((key) => (
							<TableHead key={key} className="font-extrabold">
								{i18n.t(key)}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-background-0">
					{props.rowData.map((row, index) => (
						<TableRow key={index}>
							{Object.keys(row).map((key) => {
								const value = row[key];
								const showColorSwatch = isHexColor(value);
								const showShapeIcon = isShape(value);
								const useCustomCell = showColorSwatch || showShapeIcon;
								return (
									<TableData key={key} useRNView={useCustomCell}>
										{showColorSwatch && <ColorCell hexcode={value} />}
										{showShapeIcon && !showColorSwatch && <ShapeCell shape={value} />}
										{!useCustomCell && value}
									</TableData>
								);
							})}
						</TableRow>
					))}
				</TableBody>
				{props.caption && <TableCaption className="bg-background-700">{props.caption}</TableCaption>}
			</Table>
		</Box>
	);
}

export default CustomTable;
