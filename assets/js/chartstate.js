//|Chart State
const chartState = {
	selectedYearValue: null,
	selectedChartValue: null,
	selectedFundValue: null,
	selectedRegionValue: [],
	selectedClusterValue: [],
	selectedTypeValue: [],
	showNamesValue: false,
	currentTooltipValue: null,
	currentHoveredElementValue: null,
	isSnapshotTooltipVisibleValue: false,
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
	},
	get selectedRegion() {
		return this.selectedRegionValue;
	},
	set selectedRegion(value) {
		this.selectedRegionValue = value;
	},
	get selectedCluster() {
		return this.selectedClusterValue;
	},
	set selectedCluster(value) {
		this.selectedClusterValue = value;
	},
	get selectedType() {
		return this.selectedTypeValue;
	},
	set selectedType(value) {
		this.selectedTypeValue = value;
	},
	get showNames() {
		return this.showNamesValue;
	},
	set showNames(value) {
		this.showNamesValue = value;
	},
	get currentTooltip() {
		return this.currentTooltipValue;
	},
	set currentTooltip(value) {
		this.currentTooltipValue = value;
	},
	get currentHoveredElement() {
		return this.currentHoveredElementValue;
	},
	set currentHoveredElement(value) {
		this.currentHoveredElementValue = value;
	},
	get isSnapshotTooltipVisible() {
		return this.isSnapshotTooltipVisibleValue;
	},
	set isSnapshotTooltipVisible(value) {
		this.isSnapshotTooltipVisibleValue = value;
	}
};

export {
	chartState
};