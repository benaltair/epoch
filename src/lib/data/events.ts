export interface TimelineEvent {
	id: string;
	label: string;
	startDate: string;
	endDate: string;
	level: number; // 0 for Cycle, 1 for Era, 2 for Age, 3 for Epoch, 4 for Plan
	description?: string;
	link?: string;
}

export const events: TimelineEvent[] = [
	{
		id: 'bahai-cycle',
		startDate: '1844-01-01T08:00:00.000Z',
		endDate: '2044-01-01T08:00:00.000Z',
		label: 'Bahai Cycle',
		level: 0
	},
	{
		id: 'bahai-era',
		startDate: '1844-01-01T08:00:00.000Z',
		endDate: '2044-01-01T08:00:00.000Z',
		label: 'Bahai Era',
		level: 1
	},
	{
		id: 'dispensation-bahaullah',
		startDate: '1853-01-01T08:00:00.000Z',
		endDate: '2044-01-01T08:00:00.000Z',
		label: 'Dispensation of Bahaullah',
		level: 2
	},
	{
		id: 'heroic-age',
		startDate: '1844-01-01T08:00:00.000Z',
		endDate: '1921-01-01T08:00:00.000Z',
		label: 'Heroic Age',
		level: 3
	},
	{
		id: 'formative-age',
		startDate: '1921-01-01T08:00:00.000Z',
		endDate: '2044-01-01T08:00:00.000Z',
		label: 'Formative Age',
		level: 3
	},
	{
		id: 'ministry-bab',
		startDate: '1844-01-01T08:00:00.000Z',
		endDate: '1853-01-01T08:00:00.000Z',
		label: 'Ministry of the Báb',
		level: 4
	},
	{
		id: 'ministry-bahaullah',
		startDate: '1853-01-01T08:00:00.000Z',
		endDate: '1892-01-01T08:00:00.000Z',
		label: 'Ministry of Bahaullah',
		level: 4
	},
	{
		id: 'ministry-abdul-baha',
		startDate: '1892-01-01T08:00:00.000Z',
		endDate: '1921-01-01T08:00:00.000Z',
		label: 'Ministry of Abdul-Baha',
		level: 4
	},
	{
		id: '1st-epoch',
		startDate: '1921-01-01T08:00:00.000Z',
		endDate: '1946-01-01T08:00:00.000Z',
		label: '1st Epoch',
		level: 4
	},
	{
		id: '2nd-epoch',
		startDate: '1946-01-01T08:00:00.000Z',
		endDate: '1963-01-01T08:00:00.000Z',
		label: '2nd Epoch',
		level: 4
	},
	{
		id: '3rd-epoch',
		startDate: '1963-01-01T08:00:00.000Z',
		endDate: '1986-01-01T08:00:00.000Z',
		label: '3rd Epoch',
		level: 4
	},
	{
		id: '5th-epoch',
		startDate: '1986-01-01T08:00:00.000Z',
		endDate: '2023-01-01T08:00:00.000Z',
		label: '5th Epoch',
		level: 4
	},
	{
		id: 'tablets-divine-plan',
		startDate: '1937-01-01T08:00:00.000Z',
		endDate: '2044-01-01T08:00:00.000Z',
		label: 'Tablets of the Divine Plan',
		level: 2
	},
	{
		id: '1st-epoch-plans',
		startDate: '1937-01-01T08:00:00.000Z',
		endDate: '1963-01-01T08:00:00.000Z',
		label: '1st Epoch (Plans)',
		level: 3
	},
	{
		id: '2nd-epoch-plans',
		startDate: '1963-01-01T08:00:00.000Z',
		endDate: '2021-01-01T08:00:00.000Z',
		label: '2nd Epoch (Plans)',
		level: 3
	},
	{
		id: '3rd-epoch-plans',
		startDate: '2021-01-01T08:00:00.000Z',
		endDate: '2044-01-01T08:00:00.000Z',
		label: '3rd Epoch (Plans)',
		level: 3
	},
	{
		id: '7yp-1',
		startDate: '1937-01-01T08:00:00.000Z',
		endDate: '1946-01-01T08:00:00.000Z',
		label: '7YP',
		level: 5
	},
	{
		id: '7yp-2',
		startDate: '1946-01-01T08:00:00.000Z',
		endDate: '1953-01-01T08:00:00.000Z',
		label: '7YP',
		level: 4
	},
	{
		id: '10yc',
		startDate: '1953-01-01T08:00:00.000Z',
		endDate: '1963-01-01T08:00:00.000Z',
		label: '10YC',
		level: 4
	},
	{
		id: '9yp-1',
		startDate: '1964-01-01T08:00:00.000Z',
		endDate: '1973-01-01T08:00:00.000Z',
		label: '9YP',
		level: 4
	},
	{
		id: '5yp-1',
		startDate: '1974-01-01T08:00:00.000Z',
		endDate: '1979-01-01T08:00:00.000Z',
		label: '5YP',
		level: 4
	},
	{
		id: '7yp-3',
		startDate: '1979-01-01T08:00:00.000Z',
		endDate: '1986-01-01T08:00:00.000Z',
		label: '7YP',
		level: 4
	},
	{
		id: '6yp',
		startDate: '1986-01-01T08:00:00.000Z',
		endDate: '1992-01-01T08:00:00.000Z',
		label: '6YP',
		level: 4
	},
	{
		id: '3yp',
		startDate: '1993-01-01T08:00:00.000Z',
		endDate: '1996-01-01T08:00:00.000Z',
		label: '3YP',
		level: 4
	},
	{
		id: '4yp',
		startDate: '1996-01-01T08:00:00.000Z',
		endDate: '2000-01-01T08:00:00.000Z',
		label: '4YP',
		level: 4
	},
	{
		id: '12mp',
		startDate: '2000-01-01T08:00:00.000Z',
		endDate: '2001-01-01T08:00:00.000Z',
		label: '12MP',
		level: 4
	},
	{
		id: '5yp-2',
		startDate: '2001-01-01T08:00:00.000Z',
		endDate: '2006-01-01T08:00:00.000Z',
		label: '5YP',
		level: 4
	},
	{
		id: '5yp-3',
		startDate: '2006-01-01T08:00:00.000Z',
		endDate: '2011-01-01T08:00:00.000Z',
		label: '5YP',
		level: 4
	},
	{
		id: '5yp-4',
		startDate: '2011-01-01T08:00:00.000Z',
		endDate: '2016-01-01T08:00:00.000Z',
		label: '5YP',
		level: 4
	},
	{
		id: '5yp-5',
		startDate: '2016-01-01T08:00:00.000Z',
		endDate: '2021-01-01T08:00:00.000Z',
		label: '5YP',
		level: 4
	},
	{
		id: '1yp',
		startDate: '2021-01-01T08:00:00.000Z',
		endDate: '2022-01-01T08:00:00.000Z',
		label: '1YP',
		level: 4
	},
	{
		id: '9yp-2',
		startDate: '2022-01-01T08:00:00.000Z',
		endDate: '2031-01-01T08:00:00.000Z',
		label: '9YP',
		level: 5
	}
];
