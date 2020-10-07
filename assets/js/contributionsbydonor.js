//|Contributions By Donors
function testCont(selections) {

	const d = selections.chartContainerDiv.append("div")
		.style("width", "100%")
		.style("height", "100%")
		.style("display", "flex")
		.style("flex-direction", "column");

	const d1 = d.append("div")
		.style("width", "100%")
		.style("height", "10%")
		.style("background-color", "teal");

	const d2 = d.append("div")
		.style("width", "100%")
		.style("height", "90%")
		.style("background-color", "lime");

	return function(data) {

		const sum = d3.sum(data, d => d.PaidAmt);

		console.log(data)

		let par = d2.selectAll("p")
			.data([sum]);

		par = par.enter()
			.append("p")
			.style("font-size", "30px")
			.merge(par)
			.html(d => d);

	};

};

export {
	testCont
};