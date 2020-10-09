//|Allocations by Type module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbiat";

function createAllocationsByType(selections) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	return function draw(data) {

		console.log(data);

	};

};

export {
	createAllocationsByType
};