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
	maxColumnRectHeight = 16,
	svgPadding = [10, 26, 14, 26],
	svgColumnPadding = [16, 26, 8, 60],
	yScaleRange = [svgHeight - svgPadding[2], svgPadding[0]],
	localyScale = d3.local(),
	localLine = d3.local(),
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	formatSIaxes = d3.format("~s"),
	duration = 1000,
	barLabelPadding = 6,
	labelMinPadding = 5,
	labelsColumnPadding = 2,
	svgColumnChartWidth = 195,
	topDonors = 10,
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

	const columnChartContainer = selections.byDonorChartContainer;

	columnChartContainer.html(null);

	const svgColumnChartHeight = columnChartContainer.node().getBoundingClientRect().height;

	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	const xScale = d3.scaleBand()
		.range([svgPadding[3], svgWidth - svgPadding[1]])
		.domain(d3.range(lists.yearsArrayContributions[0], currentYear, 1))
		.paddingInner(0.4)
		.paddingOuter(0);

	const xScaleColumn = d3.scaleLinear()
		.range([svgColumnPadding[3], svgColumnChartWidth - svgColumnPadding[1]]);

	const yScaleColumn = d3.scaleBand()
		.range([svgColumnPadding[0], svgColumnChartHeight - svgColumnPadding[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickValues(d3.extent(xScale.domain()))
		.tickSizeOuter(0)
		.tickSizeInner(3)
		.tickPadding(2);

	const xAxisColumn = d3.axisTop(xScaleColumn)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumn = d3.axisLeft(yScaleColumn)
		.tickSize(4);

	const xAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "xAxisGroupColumn")
		.attr("transform", "translate(0," + svgColumnPadding[0] + ")");

	const yAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "yAxisGroupColumn")
		.attr("transform", "translate(" + svgColumnPadding[3] + ",0)");

	createButtons();

	function draw(originalData) {

		//CREATE SAVEFLAG FUNCTION

		const data = filterData(originalData);

		drawMemberStates(data);

		drawNonMemberStates(data);

		createColumnTopValues(originalData);

		createColumnChart(data);

		const buttons = buttonsDiv.selectAll("button");

		buttons.on("click", (event, d) => {
			chartState.selectedFund = d;

			buttons.classed("active", d => chartState.selectedFund === d);

			const data = filterData(originalData);

			createColumnTopValues(originalData);

			createColumnChart(data);

			drawMemberStates(data);

			drawNonMemberStates(data);
		});

		//end of draw
	};

	function createButtons() {
		const buttons = buttonsDiv.selectAll(null)
			.data(buttonsList)
			.enter()
			.append("button")
			.classed("active", d => chartState.selectedFund === d);

		const bullet = buttons.append("span")
			.attr("class", "icon-circle")
			.append("i")
			.attr("class", (_, i) => i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
			.style("color", (d, i) => i !== 1 ? colors[d] : null);

		const title = buttons.append("span")
			.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));
	};

	function drawMemberStates(unfilteredData) {

		const data = unfilteredData.filter(d => lists.donorTypesList[d.donorId] === "Member State" &&
			(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]));

		data.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? (b.cbpf + b.cerf) - (a.cbpf + a.cerf) :
			b[chartState.selectedFund] - a[chartState.selectedFund]);

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

		donorDiv.order();

		const donorSvg = donorDiv.select("svg");

		donorSvg.each((d, i, n) => {
			const yScale = localyScale.set(n[i], d3.scaleLinear()
				.range(yScaleRange)
				.domain([0, d3.max(d.contributions, e => d3.max(d.contributions, e => chartState.selectedFund === "cerf/cbpf" ? e.cerf + e.cbpf : e[chartState.selectedFund]))]));

			localLine.set(n[i], d3.line()
				.x(d => xScale(d.year) + xScale.bandwidth() / 2)
				.y(d => yScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]))
				.curve(d3.curveMonotoneX));
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

		let barLine = donorSvg.selectAll("." + classPrefix + "barLine")
			.data(d => fillWithZeros(d.contributions));

		const barLineExit = barLine.exit()
			.remove();

		const barLineEnter = barLine.enter()
			.append("path")
			.attr("class", classPrefix + "barLine")
			.style("stroke", "#888")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.style("opacity", 0)
			.attr("d", (d, i, n) => localLine.get(n[i])(d));

		barLine = barLineEnter.merge(barLine);

		barLine.transition()
			.duration(duration)
			.style("opacity", chartState.selectedFund !== "cerf/cbpf" ? 1 : 0)
			.attr("d", (d, i, n) => localLine.get(n[i])(d));

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

	function drawNonMemberStates(unfilteredData) {

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

		data.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? (b.cbpf + b.cerf) - (a.cbpf + a.cerf) :
			b[chartState.selectedFund] - a[chartState.selectedFund]);

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

		nonMemberDonorDiv.order();

		const nonMemberDonorSvg = nonMemberDonorDiv.select("svg");

		nonMemberDonorSvg.each((d, i, n) => {
			const yScale = localyScale.set(n[i], d3.scaleLinear()
				.range(yScaleRange)
				.domain([0, d3.max(d.contributions, e => d3.max(d.contributions, e => chartState.selectedFund === "cerf/cbpf" ? e.cerf + e.cbpf : e[chartState.selectedFund]))]));

			localLine.set(n[i], d3.line()
				.x(d => xScale(d.year) + xScale.bandwidth() / 2)
				.y(d => yScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]))
				.curve(d3.curveMonotoneX));
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

		let barLine = nonMemberDonorSvg.selectAll("." + classPrefix + "barLine")
			.data(d => fillWithZeros(d.contributions));

		const barLineExit = barLine.exit()
			.remove();

		const barLineEnter = barLine.enter()
			.append("path")
			.attr("class", classPrefix + "barLine")
			.style("stroke", "#888")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.style("opacity", 0)
			.attr("d", (d, i, n) => localLine.get(n[i])(d));

		barLine = barLineEnter.merge(barLine);

		barLine.transition()
			.duration(duration)
			.style("opacity", chartState.selectedFund !== "cerf/cbpf" ? 1 : 0)
			.attr("d", (d, i, n) => localLine.get(n[i])(d));

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

	function createColumnTopValues(originalData) {

		let totalContributions = 0,
			totalPaid = 0,
			totalPledged = 0;

		const numberOfDonors = originalData.length;

		originalData.forEach(row => {
			totalContributions += chartState.selectedFund === "cerf/cbpf" ? row.cerf + row.cbpf : row[chartState.selectedFund];
			totalPaid += chartState.selectedFund === "cerf/cbpf" ? row["paid##cerf"] + row["paid##cbpf"] : row[`paid##${chartState.selectedFund}`];
			totalPledged += chartState.selectedFund === "cerf/cbpf" ? row["pledged##cerf"] + row["pledged##cbpf"] : row[`pledged##${chartState.selectedFund}`];
		});

		const updateTransition = d3.transition()
			.duration(duration);

		selections.byDonorContributionsValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalContributions);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byDonorPaidValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalPaid);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byDonorPledgedValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalPledged);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byDonorDonorsValue.transition(updateTransition)
			.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfDonors));

		selections.byDonorDonorsText.html(numberOfDonors > 1 ? "Donors" : "Donor");

		//end of createColumnTopValues
	};

	function createColumnChart(data) {

		data.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? (b.cbpf + b.cerf) - (a.cbpf + a.cerf) :
			b[chartState.selectedFund] - a[chartState.selectedFund]);

		const columnData = data.reduce((acc, curr, index) => {
			if (index < topDonors) {
				acc.push({
					donor: curr.donor,
					total: curr.total,
					cerf: curr.cerf,
					cbpf: curr.cbpf
				});
			} else if (index === topDonors) {
				acc.push({
					donor: "Others",
					total: curr.total,
					cerf: curr.cerf,
					cbpf: curr.cbpf
				});
			} else {
				acc[topDonors].total += curr.total;
				acc[topDonors].cerf += curr.cerf;
				acc[topDonors].cbpf += curr.cbpf;
			};
			return acc;
		}, []);

		yScaleColumn.domain(columnData.map(e => e.donor))
			.range([svgColumnPadding[0],
				Math.min(svgColumnChartHeight - svgColumnPadding[2], maxColumnRectHeight * 2 * (columnData.length + 1))
			]);

		xScaleColumn.domain([0, d3.max(columnData, e => chartState.selectedFund === "total" ? e.total : e.cbpf + e.cerf)]);

		const stackedData = stack(columnData);

		let barsGroupsColumn = svgColumnChart.selectAll("." + classPrefix + "barsGroupsColumn")
			.data(stackedData, d => d.key);

		const barsGroupsColumnExit = barsGroupsColumn.exit().remove();

		const barsGroupsColumnEnter = barsGroupsColumn.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroupsColumn")
			.attr("pointer-events", "none");

		barsGroupsColumn = barsGroupsColumnEnter.merge(barsGroupsColumn);

		let barsColumn = barsGroupsColumn.selectAll("." + classPrefix + "barsColumn")
			.data(d => d, d => d.data.donor);

		const barsColumnExit = barsColumn.exit()
			.transition()
			.duration(duration)
			.attr("width", 0)
			.attr("x", svgColumnPadding[3])
			.style("opacity", 0)
			.remove();

		const barsColumnEnter = barsColumn.enter()
			.append("rect")
			.attr("class", classPrefix + "barsColumn")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("height", yScaleColumn.bandwidth())
			.attr("width", 0)
			.style("fill", (d, i, n) => {
				const thisKey = d3.select(n[i].parentNode).datum().key;
				return d3.color(colors[thisKey]).brighter(0.25)
			})
			.attr("x", xScaleColumn(0))
			.attr("y", d => yScaleColumn(d.data.donor))

		barsColumn = barsColumnEnter.merge(barsColumn);

		barsColumn.transition()
			.duration(duration)
			.attr("height", yScaleColumn.bandwidth())
			.attr("y", d => yScaleColumn(d.data.donor))
			.attr("x", d => d[0] === d[1] ? xScaleColumn(0) : xScaleColumn(d[0]))
			.attr("width", d => xScaleColumn(d[1]) - xScaleColumn(d[0]));

		let labelsColumn = svgColumnChart.selectAll("." + classPrefix + "labelsColumn")
			.data(columnData, d => d.donor);

		const labelsColumnExit = labelsColumn.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const labelsColumnEnter = labelsColumn.enter()
			.append("text")
			.attr("class", classPrefix + "labelsColumn")
			.style("opacity", 0)
			.attr("x", svgColumnPadding[3] + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.donor) + yScaleColumn.bandwidth() / 2);

		labelsColumn = labelsColumnEnter.merge(labelsColumn);

		labelsColumn.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => xScaleColumn(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.donor) + yScaleColumn.bandwidth() / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
				return t => formatSIFloat(interpolator(t)).replace("G", "B");
			});

		xAxisColumn.tickSizeInner(-(yScaleColumn.range()[1] - yScaleColumn.range()[0]));

		xAxisGroupColumn.transition()
			.duration(duration)
			.call(xAxisColumn);

		xAxisGroupColumn.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		yAxisGroupColumn.transition()
			.duration(duration)
			.call(customAxis);

		function customAxis(group) {
			const sel = group.selection ? group.selection() : group;
			group.call(yAxisColumn);
			sel.selectAll(".tick text")
				.filter(d => d.indexOf(" ") > -1)
				.text(d => d.split(" ")[0])
				.attr("x", -(yAxisColumn.tickPadding() + yAxisColumn.tickSize()))
				.attr("dy", "-0.3em")
				.append("tspan")
				.attr("dy", "1.1em")
				.attr("x", -(yAxisColumn.tickPadding() + yAxisColumn.tickSize()))
				.text(d => d.split(" ")[1]);
			if (sel !== group) group.selectAll(".tick text")
				.filter(d => d.indexOf(" ") > -1)
				.attrTween("x", null)
				.tween("text", null);
		};

		//end of createColumnChart
	};

	function filterData(originalData) {

		const data = JSON.parse(JSON.stringify(originalData));

		data.forEach(donor => {
			if (chartState.selectedFund === "total") {
				donor.cbpf = 0;
				donor.cerf = 0;
			};
			if (chartState.selectedFund === "cerf/cbpf") {
				donor.total = 0;
			};
			if (chartState.selectedFund === "cerf") {
				donor.cbpf = 0;
				donor.total = 0;
			};
			if (chartState.selectedFund === "cbpf") {
				donor.cerf = 0;
				donor.total = 0;
			};
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

	function fillWithZeros(contributionsArray) {
		const copiedArray = JSON.parse(JSON.stringify(contributionsArray));
		xScale.domain().forEach(year => {
			if (!copiedArray.find(e => e.year === year)) {
				copiedArray.push({
					year: year,
					total: 0,
					cerf: 0,
					cbpf: 0,
					"paid##total": 0,
					"paid##cerf": 0,
					"paid##cbpf": 0,
					"pledged##total": 0,
					"pledged##cerf": 0,
					"pledged##cbpf": 0
				})
			};
		});
		copiedArray.sort((a, b) => a.year - b.year);
		return [copiedArray];
	};

	return draw;

	//end of createContributionsByDonor
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
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