//|Allocations by Country module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbiac";

function createAllocationsByCountry(selections) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	return function draw(data) {

		console.log(data);

	};

};

export {
	createAllocationsByCountry
};