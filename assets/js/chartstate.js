//|Chart State
const chartState = {
	selectedYearValue: null,
	selectedChartValue: null,
	selectedFundValue: null,
	get selectedYear() {
		return this.selectedYearValue;
	},
	set selectedYear(value) {
		this.selectedYearValue = value;
	},
	get selectedChart() {
		return this.selectedChartValue;
	},
	set selectedChart(value) {
		this.selectedChartValue = value;
	},
	get selectedFund() {
		return this.selectedFundValue;
	},
	set selectedFund(value) {
		this.selectedFundValue = value;
	}
};

export {chartState};