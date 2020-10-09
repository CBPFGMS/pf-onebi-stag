//|Contributions By Cerf/Cbpf module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicc";

function createContributionsByCerfCbpf(selections) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	return function draw(data) {


	};

};

export {
	createContributionsByCerfCbpf
};