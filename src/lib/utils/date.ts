export function extractYear(isoDate: string): number {
	const date = new Date(isoDate);
	if (isNaN(date.getTime())) return 0;

	const year = date.getUTCFullYear();
	const startOfYear = new Date(Date.UTC(year, 0, 1));
	const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

	const progress = (date.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime());
	return year + progress;
}
