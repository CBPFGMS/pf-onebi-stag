//|Contributions By Donors module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicd";

function createContributionsByDonor(selections, colors) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	return function draw(data) {


	};

};

export {
	createContributionsByDonor
};