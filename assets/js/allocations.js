//|Allocations module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbiac",
	mapPercentage = 0.7,
	barChartPercentage = 1 - mapPercentage,
	mapAspectRatio = 2.225,
	centroids = {};

function createAllocations(selections, colors) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	return function draw(data, chartType) {

		console.log(data);

	};

};

export {
	createAllocations
};