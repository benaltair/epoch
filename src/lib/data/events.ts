export interface TimelineEvent {
	id: string;
	label: string;
	startDate: string;
	endDate: string;
	level: 'cycle' | 'era' | 'age' | 'epoch' | 'plan' | 'event';
	description?: string;
	color?: string;
}

export const events: TimelineEvent[] = [
	{
		id: 'bahai-cycle',
		startDate: '1844-05-23T00:00:00.000Z',
		endDate: '2344-05-23T00:00:00.000Z',
		label: 'Bahá\'í Cycle',
		level: 'cycle',
		description: 'A period destined to last no less than five hundred thousand years.',
		color: '#1e3a8a'
	},
	{
		id: 'bahai-era',
		startDate: '1844-05-23T00:00:00.000Z',
		endDate: '2044-05-23T00:00:00.000Z',
		label: 'Bahá\'í Era',
		level: 'era',
		description: 'The era beginning with the Declaration of the Báb.',
		color: '#1d4ed8'
	},
	{
		id: 'dispensation-bab',
		startDate: '1844-05-23T00:00:00.000Z',
		endDate: '1853-10-15T00:00:00.000Z',
		label: 'Dispensation of the Báb',
		level: 'era',
		description: 'The ministry of the Báb, the Herald of the Bahá\'í Faith.',
		color: '#3b82f6'
	},
	{
		id: 'dispensation-bahaullah',
		startDate: '1853-10-15T00:00:00.000Z',
		endDate: '2044-05-23T00:00:00.000Z',
		label: 'Dispensation of Bahá\'u\'lláh',
		level: 'era',
		description: 'The ministry of Bahá\'u\'lláh and the period of His Revelation.',
		color: '#2563eb'
	},
	{
		id: 'heroic-age',
		startDate: '1844-05-23T00:00:00.000Z',
		endDate: '1921-11-28T00:00:00.000Z',
		label: 'Heroic Age',
		level: 'age',
		description: 'The Apostolic or Primitive Age of the Faith.',
		color: '#7c3aed'
	},
	{
		id: 'formative-age',
		startDate: '1921-11-28T00:00:00.000Z',
		endDate: '2044-05-23T00:00:00.000Z',
		label: 'Formative Age',
		level: 'age',
		description: 'The Transitional or Iron Age of the Faith, dedicated to the construction of the Administrative Order.',
		color: '#8b5cf6'
	},
	{
		id: 'ministry-bab',
		startDate: '1844-05-23T00:00:00.000Z',
		endDate: '1850-07-09T00:00:00.000Z',
		label: 'Ministry of the Báb',
		level: 'epoch',
		description: 'From the Declaration of the Báb to His Martyrdom.'
	},
	{
		id: 'ministry-bahaullah',
		startDate: '1853-10-15T00:00:00.000Z',
		endDate: '1892-05-29T00:00:00.000Z',
		label: 'Ministry of Bahá\'u\'lláh',
		level: 'epoch',
		description: 'From His intimation in the Siyah-Chal to His Ascension.'
	},
	{
		id: 'ministry-abdul-baha',
		startDate: '1892-05-29T00:00:00.000Z',
		endDate: '1921-11-28T00:00:00.000Z',
		label: 'Ministry of \'Abdu\'l-Bahá',
		level: 'epoch',
		description: 'The period of His leadership as the Center of the Covenant.'
	},
	{
		id: 'formative-1st-epoch',
		startDate: '1921-11-28T00:00:00.000Z',
		endDate: '1944-05-23T00:00:00.000Z',
		label: '1st Epoch (Formative Age)',
		level: 'epoch',
		description: 'The early years of the Guardianship.'
	},
	{
		id: 'formative-2nd-epoch',
		startDate: '1946-04-21T00:00:00.000Z',
		endDate: '1963-04-21T00:00:00.000Z',
		label: '2nd Epoch (Formative Age)',
		level: 'epoch',
		description: 'The global spread of the Faith through the Ten Year Crusade.'
	},
	{
		id: 'formative-3rd-epoch',
		startDate: '1963-04-21T00:00:00.000Z',
		endDate: '1986-04-21T00:00:00.000Z',
		label: '3rd Epoch (Formative Age)',
		level: 'epoch'
	},
	{
		id: 'formative-4th-epoch',
		startDate: '1986-04-21T00:00:00.000Z',
		endDate: '2001-04-21T00:00:00.000Z',
		label: '4th Epoch (Formative Age)',
		level: 'epoch'
	},
	{
		id: 'formative-5th-epoch',
		startDate: '2001-04-21T00:00:00.000Z',
		endDate: '2021-04-21T00:00:00.000Z',
		label: '5th Epoch (Formative Age)',
		level: 'epoch'
	},
	{
		id: 'formative-6th-epoch',
		startDate: '2021-04-21T00:00:00.000Z',
		endDate: '2031-04-21T00:00:00.000Z',
		label: '6th Epoch (Formative Age)',
		level: 'epoch'
	},
	{
		id: 'declaration-bab',
		startDate: '1844-05-23T00:00:00.000Z',
		endDate: '1844-05-24T00:00:00.000Z',
		label: 'Declaration of the Báb',
		level: 'event',
		color: '#f59e0b'
	},
	{
		id: 'martyrdom-bab',
		startDate: '1850-07-09T00:00:00.000Z',
		endDate: '1850-07-10T00:00:00.000Z',
		label: 'Martyrdom of the Báb',
		level: 'event',
		color: '#f59e0b'
	},
	{
		id: 'declaration-bahaullah',
		startDate: '1863-04-21T00:00:00.000Z',
		endDate: '1863-05-02T00:00:00.000Z',
		label: 'Declaration of Bahá\'u\'lláh',
		level: 'event',
		color: '#f59e0b'
	},
	{
		id: 'ascension-bahaullah',
		startDate: '1892-05-29T00:00:00.000Z',
		endDate: '1892-05-30T00:00:00.000Z',
		label: 'Ascension of Bahá\'u\'lláh',
		level: 'event',
		color: '#f59e0b'
	},
	{
		id: 'passing-abdulbaha',
		startDate: '1921-11-28T00:00:00.000Z',
		endDate: '1921-11-29T00:00:00.000Z',
		label: 'Passing of \'Abdu\'l-Bahá',
		level: 'event',
		color: '#f59e0b'
	},
	{
		id: 'election-uhj',
		startDate: '1963-04-21T00:00:00.000Z',
		endDate: '1963-04-22T00:00:00.000Z',
		label: 'First Election of the Universal House of Justice',
		level: 'event',
		color: '#f59e0b'
	},
	{
		id: 'ten-year-crusade',
		startDate: '1953-04-21T00:00:00.000Z',
		endDate: '1963-04-21T00:00:00.000Z',
		label: 'Ten Year Crusade',
		level: 'plan',
		description: 'The first global teaching plan.'
	},
	{
		id: 'nine-year-plan-1',
		startDate: '1964-04-21T00:00:00.000Z',
		endDate: '1973-04-21T00:00:00.000Z',
		label: 'Nine Year Plan',
		level: 'plan'
	}
];
