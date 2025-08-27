export interface Event {
	startDate: string;
	endDate: string;
	label: string;
	type?: string;
	children?: Event[];
}
