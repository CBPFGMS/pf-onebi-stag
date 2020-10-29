//|Contributions By Donors module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicd",
	memberStatePercentage = 0.82,
	nonMemberStatePercentage = 1 - memberStatePercentage,
	svgWidth = 120,
	svgHeight = 60,
	donorNameDivHeight = 18,
	flagSize = 16,
	svgPadding = [10, 26, 14, 26],
	yScaleRange = [svgHeight - svgPadding[2], svgPadding[0]],
	localyScale = d3.local(),
	localLine = d3.local(),
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	duration = 1000,
	barLabelPadding = 6,
	labelMinPadding = 5,
	flagUrl = "./assets/img/flags16/",
	formatPercent = d3.format("%"),
	stackKeys = ["total", "cerf", "cbpf"],
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	zeroObject = {
		total: 0,
		cerf: 0,
		cbpf: 0
	};

//|variables

function createContributionsByDonor(selections, colors, lists) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const memberStatesContainerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "memberStatesContainerDiv")
		.style("height", formatPercent(memberStatePercentage));

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

	const nonMemberStatesContainerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "nonMemberStatesContainerDiv")
		.style("height", formatPercent(nonMemberStatePercentage));

	const nonMemberStatesTopDiv = nonMemberStatesContainerDiv.append("div")
		.attr("class", classPrefix + "nonMemberStatesTopDiv");

	const nonMemberStatesChartAreaDiv = nonMemberStatesContainerDiv.append("div")
		.attr("class", classPrefix + "nonMemberStatesChartAreaDiv");

	const nonMemberStatesTitle = nonMemberStatesTopDiv.append("span")
		.html("non-Member States");

	const xScale = d3.scaleBand()
		.range([svgPadding[3], svgWidth - svgPadding[1]])
		.domain(d3.range(lists.yearsArrayContributions[0], currentYear, 1))
		.paddingInner(0.4)
		.paddingOuter(0);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickValues(d3.extent(xScale.domain()))
		.tickSizeOuter(0)
		.tickSizeInner(3)
		.tickPadding(2);

	createButtons();

	function draw(originalData) {

		//CREATE SAVEFLAG FUNCTION

		const data = filterData(originalData);

		drawMemberStates(data, originalData);

		drawNonMemberStates(data, originalData);

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

			drawNonMemberStates(data, originalData);
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

		const data = unfilteredData.filter(d => lists.donorTypesList[d.donorId] === "Member State" &&
			(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]));

		data.sort((a, b) => b.total - a.total || (b.cbpf + b.cerf) - (a.cbpf + a.cerf));

		let donorDiv = memberStatesChartAreaDiv.selectAll("." + classPrefix + "donorDiv")
			.data(data, d => d.donorId);

		const donorDivExit = donorDiv.exit()
			.remove();

		const donorDivEnter = donorDiv.enter()
			.append("div")
			.attr("class", classPrefix + "donorDiv")
			.style("width", svgWidth + "px")
			.style("min-height", svgHeight + donorNameDivHeight + "px");

		const donorSvgEnter = donorDivEnter.append("svg")
			.attr("width", svgWidth)
			.attr("height", svgHeight)
			.style("overflow", "visible")

		const xAxisGroup = donorSvgEnter.append("g")
			.attr("class", classPrefix + "xAxisGroup")
			.attr("transform", "translate(0," + (svgHeight - svgPadding[2]) + ")")
			.call(xAxis);

		const donorNameDiv = donorDivEnter.append("div")
			.attr("class", classPrefix + "donorNameDiv")
			.style("min-height", donorNameDivHeight + "px");

		const donorFlag = donorNameDiv.append("img")
			.attr("width", flagSize)
			.attr("height", flagSize)
			.attr("src", d => flagUrl + d.isoCode.toLowerCase() + ".png");

		const donorName = donorNameDiv.append("span")
			.html(d => d.donor);

		donorDiv = donorDivEnter.merge(donorDiv);

		const donorSvg = donorDiv.select("svg");

		donorSvg.each((d, i, n) => {
			const yScale = localyScale.set(n[i], d3.scaleLinear()
				.range(yScaleRange)
				.domain([0, d3.max(d.contributions, e => d3.max(d.contributions, e => chartState.selectedFund === "cerf/cbpf" ? e.cerf + e.cbpf : e[chartState.selectedFund]))]))
		});

		let barsGroups = donorSvg.selectAll("." + classPrefix + "barsGroups")
			.data(d => stack(d.contributions), d => d.key);

		const barGroupsExit = barsGroups.exit().remove();

		const barGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		barsGroups = barGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll("." + classPrefix + "bars")
			.data(d => d, d => d.data.year);

		const barsExit = bars.exit()
			.transition()
			.duration(duration)
			.attr("height", 0)
			.attr("y", svgHeight - svgPadding[2])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScale.bandwidth())
			.attr("height", 0)
			.attr("y", svgHeight - svgPadding[2])
			.attr("x", d => xScale(d.data.year))

		bars = barsEnter.merge(bars);

		bars.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", (d, i, n) => d[0] === d[1] ? svgHeight - svgPadding[2] : localyScale.get(n[i])(d[1]))
			.attr("height", (d, i, n) => localyScale.get(n[i])(d[0]) - localyScale.get(n[i])(d[1]));

		let barLabel = donorSvg.selectAll("." + classPrefix + "barLabel")
			.data(d => [d.contributions.find(e => e.year === currentYear - 1) || zeroObject]);

		const barLabelExit = barLabel.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const barLabelEnter = barLabel.enter()
			.append("text")
			.attr("class", classPrefix + "barLabel")
			.style("opacity", 0)
			.attr("x", xScale(currentYear - 1) + barLabelPadding)
			.attr("y", svgHeight - svgPadding[2]);

		barLabel = barLabelEnter.merge(barLabel);

		barLabel.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", (d, i, n) => Math.min(svgHeight - svgPadding[2] - labelMinPadding, localyScale.get(n[i])(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund])))
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		//end of drawMemberStates
	};

	function drawNonMemberStates(unfilteredData, originalData) {

		const individualData = unfilteredData.filter(d => lists.donorTypesList[d.donorId] !== "Member State" &&
			(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]));

		const data = individualData.reduce((acc, originalRow) => {

			const row = JSON.parse(JSON.stringify(originalRow));

			const foundDonor = acc.find(e => e.donor === lists.donorTypesList[row.donorId]);

			if (foundDonor) {
				++foundDonor.count;
				foundDonor.total += row.total;
				foundDonor.cerf += row.cerf;
				foundDonor.cbpf += row.cbpf;
				foundDonor["paid##total"] += row["paid##total"];
				foundDonor["paid##cerf"] += row["paid##cerf"];
				foundDonor["paid##cbpf"] += row["paid##cbpf"];
				foundDonor["pledged##total"] += row["pledged##total"];
				foundDonor["pledged##cerf"] += row["pledged##cerf"];
				foundDonor["pledged##cbpf"] += row["pledged##cbpf"];

				row.contributions.forEach(yearRow => {
					const foundYear = foundDonor.contributions.find(e => e.year === yearRow.year);
					if (foundYear) {
						foundYear.total += yearRow.total;
						foundYear.cerf += yearRow.cerf;
						foundYear.cbpf += yearRow.cbpf;
						foundYear["paid##total"] += yearRow["paid##total"];
						foundYear["paid##cerf"] += yearRow["paid##cerf"];
						foundYear["paid##cbpf"] += yearRow["paid##cbpf"];
						foundYear["pledged##total"] += yearRow["pledged##total"];
						foundYear["pledged##cerf"] += yearRow["pledged##cerf"];
						foundYear["pledged##cbpf"] += yearRow["pledged##cbpf"];
					} else {
						foundDonor.contributions.push(yearRow);
					};
				});

			} else {
				row.donor = lists.donorTypesList[row.donorId];
				row.count = 1;
				delete row.donorId;
				acc.push(row);
			};

			return acc;
		}, []);

		data.sort((a, b) => b.total - a.total || (b.cbpf + b.cerf) - (a.cbpf + a.cerf));

		let nonMemberDonorDiv = nonMemberStatesChartAreaDiv.selectAll("." + classPrefix + "nonMemberDonorDiv")
			.data(data, d => d.donor);

		const nonMemberDonorDivExit = nonMemberDonorDiv.exit()
			.remove();

		const nonMemberDonorDivEnter = nonMemberDonorDiv.enter()
			.append("div")
			.attr("class", classPrefix + "nonMemberDonorDiv")
			.style("width", svgWidth + "px")
			.style("min-height", svgHeight + donorNameDivHeight + "px");

		const nonMemberDonorSvgEnter = nonMemberDonorDivEnter.append("svg")
			.attr("width", svgWidth)
			.attr("height", svgHeight)
			.style("overflow", "visible")

		const xAxisGroup = nonMemberDonorSvgEnter.append("g")
			.attr("class", classPrefix + "xAxisGroup")
			.attr("transform", "translate(0," + (svgHeight - svgPadding[2]) + ")")
			.call(xAxis);

		const nonMemberDonorNameDiv = nonMemberDonorDivEnter.append("div")
			.attr("class", classPrefix + "nonMemberDonorNameDiv")
			.style("min-height", donorNameDivHeight + "px")
			.html(d => d.donor);

		nonMemberDonorDiv = nonMemberDonorDivEnter.merge(nonMemberDonorDiv);

		const nonMemberDonorSvg = nonMemberDonorDiv.select("svg");

		nonMemberDonorSvg.each((d, i, n) => {
			const yScale = localyScale.set(n[i], d3.scaleLinear()
				.range(yScaleRange)
				.domain([0, d3.max(d.contributions, e => d3.max(d.contributions, e => chartState.selectedFund === "cerf/cbpf" ? e.cerf + e.cbpf : e[chartState.selectedFund]))]))
		});

		let barsGroups = nonMemberDonorSvg.selectAll("." + classPrefix + "barsGroups")
			.data(d => stack(d.contributions), d => d.key);

		const barGroupsExit = barsGroups.exit().remove();

		const barGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		barsGroups = barGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll("." + classPrefix + "bars")
			.data(d => d, d => d.data.year);

		const barsExit = bars.exit()
			.transition()
			.duration(duration)
			.attr("height", 0)
			.attr("y", svgHeight - svgPadding[2])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScale.bandwidth())
			.attr("height", 0)
			.attr("y", svgHeight - svgPadding[2])
			.attr("x", d => xScale(d.data.year))

		bars = barsEnter.merge(bars);

		bars.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", (d, i, n) => d[0] === d[1] ? svgHeight - svgPadding[2] : localyScale.get(n[i])(d[1]))
			.attr("height", (d, i, n) => localyScale.get(n[i])(d[0]) - localyScale.get(n[i])(d[1]));

		let barLabel = nonMemberDonorSvg.selectAll("." + classPrefix + "barLabel")
			.data(d => [d.contributions.find(e => e.year === currentYear - 1) || zeroObject]);

		const barLabelExit = barLabel.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const barLabelEnter = barLabel.enter()
			.append("text")
			.attr("class", classPrefix + "barLabel")
			.style("opacity", 0)
			.attr("x", xScale(currentYear - 1) + barLabelPadding)
			.attr("y", svgHeight - svgPadding[2]);

		barLabel = barLabelEnter.merge(barLabel);

		barLabel.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", (d, i, n) => Math.min(svgHeight - svgPadding[2] - labelMinPadding, localyScale.get(n[i])(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund])))
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		//end of drawNonMemberStates
	};

	function filterData(originalData) {

		const data = JSON.parse(JSON.stringify(originalData));

		data.forEach(donor => {
			donor.contributions.forEach(row => {
				if (chartState.selectedFund === "total") {
					row.cbpf = 0;
					row.cerf = 0;
				};
				if (chartState.selectedFund === "cerf/cbpf") {
					row.total = 0;
				};
				if (chartState.selectedFund === "cerf") {
					row.cbpf = 0;
					row.total = 0;
				};
				if (chartState.selectedFund === "cbpf") {
					row.cerf = 0;
					row.total = 0;
				};
			});
		});

		return data;

	};

	return draw;

	//end of createContributionsByDonor
};

function reverseFormat(s) {
	if (+s === 0) return 0;
	let returnValue;
	const transformation = {
		Y: Math.pow(10, 24),
		Z: Math.pow(10, 21),
		E: Math.pow(10, 18),
		P: Math.pow(10, 15),
		T: Math.pow(10, 12),
		G: Math.pow(10, 9),
		B: Math.pow(10, 9),
		M: Math.pow(10, 6),
		k: Math.pow(10, 3),
		h: Math.pow(10, 2),
		da: Math.pow(10, 1),
		d: Math.pow(10, -1),
		c: Math.pow(10, -2),
		m: Math.pow(10, -3),
		μ: Math.pow(10, -6),
		n: Math.pow(10, -9),
		p: Math.pow(10, -12),
		f: Math.pow(10, -15),
		a: Math.pow(10, -18),
		z: Math.pow(10, -21),
		y: Math.pow(10, -24)
	};
	Object.keys(transformation).some(k => {
		if (s.indexOf(k) > 0) {
			returnValue = parseFloat(s.split(k)[0]) * transformation[k];
			return true;
		}
	});
	return returnValue;
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

export {
	createContributionsByDonor
};