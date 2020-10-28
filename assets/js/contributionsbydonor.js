//|Contributions By Donors module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicd",
	memberStatePercentage = 0.8,
	nonMemberStatePercentage = 1 - memberStatePercentage,
	donorDivWidth = 80,
	donorDivHeight = 50,
	formatPercent = d3.format("%"),
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"];

//|variables

function createContributionsByDonor(selections, colors, lists) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const memberStatesContainerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "memberStatesContainerDiv")
		.style("height", formatPercent(memberStatePercentage));

	const nonMemberStatesContainerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "nonMemberStatesContainerDiv")
		.style("height", formatPercent(nonMemberStatePercentage));

	const memberStatesTopDiv = memberStatesContainerDiv.append("div")
		.attr("class", classPrefix + "memberStatesTopDiv");

	const memberStatesTitleDiv = memberStatesTopDiv.append("div")
		.attr("class", classPrefix + "memberStatesTitleDiv");

	const buttonsContainerDiv = memberStatesTopDiv.append("div")
		.attr("class", classPrefix + "buttonsContainerDiv");

	const buttonsDiv = buttonsContainerDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const memberStatesChartAreaDiv = memberStatesContainerDiv.append("div")
		.attr("class", classPrefix + "memberStatesChartAreaDiv");

	const memberStatesTitle = memberStatesTitleDiv.append("span")
		.html("Member States");



	createButtons();

	function draw(originalData) {

		const data = filterData(originalData);

		drawMemberStates(data, originalData);

		// createColumnTopValues(originalData);

		// createColumnChart(originalData);

		const buttons = buttonsDiv.selectAll("button");

		buttons.on("click", (event, d) => {
			chartState.selectedFund = d;

			buttons.classed("active", d => chartState.selectedFund === d);

			const data = filterData(originalData);

			// createColumnTopValues(originalData);

			// createColumnChart(originalData);

			drawMemberStates(data, originalData);
		});

		//end of draw
	};

	function createButtons() {
		const buttons = buttonsDiv.selectAll(null)
			.data(buttonsList)
			.enter()
			.append("button")
			.classed("active", d => chartState.selectedFund === d)
			.attr("id", d => classPrefix + "button" + d);

		const bullet = buttons.append("span")
			.attr("class", "icon-circle")
			.append("i")
			.attr("class", (_, i) => i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
			.style("color", (d, i) => i !== 1 ? colors[d] : null);

		const title = buttons.append("span")
			.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));
	};

	function drawMemberStates(unfilteredData, originalData) {

		console.log(unfilteredData);

	};

	function filterData(originalData) {

		return originalData;

	};

	return draw;

	//end of createContributionsByDonor
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

export {
	createContributionsByDonor
};