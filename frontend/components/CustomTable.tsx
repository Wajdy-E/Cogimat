import { Box } from "@/components/ui/box";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableData, TableCaption } from "@/components/ui/table";
import { i18n } from "../i18n";

export interface TableProps {
	tableHeadKeys: string[];
	rowData: Record<any, any>[];
	caption?: string;
}

function CustomTable(props: TableProps) {
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
							{Object.keys(row).map((key) => (
								<TableData key={key}>{row[key]}</TableData>
							))}
						</TableRow>
					))}
				</TableBody>
				{props.caption && <TableCaption className="bg-background-700">{props.caption}</TableCaption>}
			</Table>
		</Box>
	);
}

export default CustomTable;
