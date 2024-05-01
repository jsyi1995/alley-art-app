const format = {
	toDate(timestamp: string) {
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		const date = new Date(timestamp)
		return (
			monthNames[date.getUTCMonth()] +
			' ' +
			date.getDate() +
			', ' +
			date.getUTCFullYear()
		)
	},
	toStat(value: number) {
		if (value > 1000000) {
			return Math.floor(value / 1000000) + 'M'
		}
		if (value > 1000) {
			return Math.floor(value / 1000) + 'K'
		}
		return value
	},
}

export default format
