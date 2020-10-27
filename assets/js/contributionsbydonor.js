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
	formatPercent = d3.format("%");

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


	return function draw(originalData) {


	};

};

export {
	createContributionsByDonor
};