//|Allocations by Sector module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbias";

function createAllocationsBySector(selections) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	return function draw(data) {

		console.log(data);

	};

};

export {
	createAllocationsBySector
};