//|Contributions By Cerf/Cbpf module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicc",
	currentDate = new Date(),
	svgHeightRatio = 0.65,
	currentYear = currentDate.getFullYear(),
	allYears = "all",
	cerfSvgPaddings = [4, 4, 4, 4],
	cbpfSvgPaddings = [4, 4, 4, 4],
	selectedCerfCbpfYear = allYears,
	selectedCerfCbpfValue = "total",
	valueTypes = ["total", "paid", "pledged"];

function createContributionsByCerfCbpf(selections, colors, lists) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const yearButtonsDiv = topDiv.append("div")
		.attr("class", classPrefix + "yearButtonsDiv");

	const paidPledgedButtonsDiv = topDiv.append("div")
		.attr("class", classPrefix + "paidPledgedButtonsDiv");

	const chartAreaDiv = containerDiv.append("div")
		.attr("class", classPrefix + "chartAreaDiv");

	const cerfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cerfContainerDiv");

	const cbpfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cbpfContainerDiv");

	const cerfContainerWidth = cerfContainerDiv.node().getBoundingClientRect().width;
	const cbpfContainerWidth = cbpfContainerDiv.node().getBoundingClientRect().width;

	const cerfSvg = cerfContainerDiv.append("svg")
		.attr("width", cerfContainerWidth)
		.attr("height", cerfContainerWidth * svgHeightRatio);

	const cbpfSvg = cbpfContainerDiv.append("svg")
		.attr("width", cbpfContainerWidth)
		.attr("height", cbpfContainerWidth * svgHeightRatio);


	createYearButtons(yearButtonsDiv);

	createPaidPledgedButtons(paidPledgedButtonsDiv);

	function draw(data) {


	};

	function createYearButtons(container) {

		const yearsData = d3.range(lists.yearsArrayContributions[0], currentYear, 1).concat([allYears]);

		const yearsButtons = container.selectAll(null)
			.data(yearsData)
			.enter()
			.append("button")
			.classed("active", d => selectedCerfCbpfYear === d)
			.html(d => d === allYears ? capitalize(allYears) : d);

	};

	function createPaidPledgedButtons(container) {

		const valuesButtons = container.selectAll(null)
			.data(valueTypes)
			.enter()
			.append("button")
			.classed("active", d => selectedCerfCbpfValue === d)
			.html(d => capitalize(d));

	};

	return draw;

	//end of createContributionsByCerfCbpf
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

export {
	createContributionsByCerfCbpf
};