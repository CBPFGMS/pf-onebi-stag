//|Contributions By Donors module

import {
	chartState
} from "./chartstate.js";

import {
	donorsFlagsData
} from "./donorsflagsdata.js";

import {
	createButtons
} from "./buttons.js";

//|constants
const classPrefix = "pfbicd",
	nonMemberStateHeight = 130,
	svgWidth = 140,
	svgHeight = 68,
	donorNameDivHeight = 24,
	flagSize = 22,
	flagSizeTooltip = 30,
	flagSizeColumn = 16,
	flagPadding = 2,
	maxColumnRectHeight = 16,
	svgPadding = [10, 30, 14, 26],
	svgColumnPadding = [16, 26, 8, 80],
	yScaleRange = [svgHeight - svgPadding[2], svgPadding[0]],
	tooltipSvgPadding = [24, 12, 24, 36],
	localyScale = d3.local(),
	localLine = d3.local(),
	localTooltip = d3.local(),
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	formatSIaxes = d3.format("~s"),
	duration = 1000,
	barLabelPadding = 6,
	labelMinPadding = 5,
	labelsColumnPadding = 2,
	svgColumnChartWidth = 195,
	svgColumnChartHeight = 380,
	topDonors = 10,
	tooltipWidth = 520,
	tooltipTopHeight = 26,
	tooltipChartHeight = 280,
	tooltipDonorNameHeight = 30,
	tooltipLabelCerfPadding = 10,
	tooltipSvgHeight = tooltipChartHeight - tooltipDonorNameHeight,
	yScaleTooltipRange = [tooltipSvgHeight - tooltipSvgPadding[2], tooltipSvgPadding[0]],
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

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const breadcrumbDiv = outerDiv.append("div")
		.attr("class", classPrefix + "breadcrumbDiv");

	const breadcrumbDivInner = breadcrumbDiv.append("div")
		.attr("class", classPrefix + "breadcrumbDivInner");

	const firstBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", classPrefix + "firstBreadcrumb");

	firstBreadcrumb.append("span")
		.html("contributions");

	const middleBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", classPrefix + "middleBreadcrumb");

	const secondBreadcrumb = breadcrumbDivInner.append("div")
		.attr("class", classPrefix + "secondBreadcrumb");

	secondBreadcrumb.append("span")
		.html("by donor");

	const topButtonsDiv = breadcrumbDiv.append("div")
		.attr("class", classPrefix + "topButtonsDiv");

	createButtons(topButtonsDiv, chartState);

	const containerDiv = outerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const memberStatesContainerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "memberStatesContainerDiv")
		.style("height", (containerDiv.node().getBoundingClientRect().height - nonMemberStateHeight) + "px");

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
		.style("height", nonMemberStateHeight + "px");

	const nonMemberStatesTopDiv = nonMemberStatesContainerDiv.append("div")
		.attr("class", classPrefix + "nonMemberStatesTopDiv");

	const nonMemberStatesChartAreaDiv = nonMemberStatesContainerDiv.append("div")
		.attr("class", classPrefix + "nonMemberStatesChartAreaDiv");

	const nonMemberStatesTitle = nonMemberStatesTopDiv.append("span")
		.html("others");

	const columnChartContainer = selections.byDonorChartContainer;

	columnChartContainer.html(null);

	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	const xScale = d3.scaleBand()
		.range([svgPadding[3], svgWidth - svgPadding[1]])
		.domain(d3.range(lists.yearsArrayContributions[0], currentYear, 1))
		.paddingInner(0.4)
		.paddingOuter(0);

	const allYearsTooltipArray = d3.range(lists.yearsArrayContributions[0], currentYear + 1, 1);
	allYearsTooltipArray.splice(-1, 0, null);

	const xScaleTooltip = d3.scaleBand()
		.range([tooltipSvgPadding[3], tooltipWidth - tooltipSvgPadding[1]])
		.domain(allYearsTooltipArray)
		.paddingInner(0.4)
		.paddingOuter(0.2);

	const xScaleColumn = d3.scaleLinear()
		.range([svgColumnPadding[3], svgColumnChartWidth - svgColumnPadding[1]]);

	const yScaleColumn = d3.scaleBand()
		.range([svgColumnPadding[0], svgColumnChartHeight - svgColumnPadding[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScaleTooltip = d3.scaleLinear()
		.range(yScaleTooltipRange);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickValues(d3.extent(xScale.domain()))
		.tickSizeOuter(0)
		.tickSizeInner(3)
		.tickPadding(2);

	const xAxisTooltip = d3.axisBottom(xScaleTooltip)
		.tickSizeOuter(4)
		.tickSizeInner(4)
		.tickPadding(3);

	const xAxisColumn = d3.axisTop(xScaleColumn)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumn = d3.axisLeft(yScaleColumn)
		.tickPadding(flagSizeColumn + 2 * flagPadding)
		.tickSize(3);

	const yAxisTooltip = d3.axisLeft(yScaleTooltip)
		.tickSizeOuter(0)
		.tickSizeInner(-(tooltipWidth - tooltipSvgPadding[1] - tooltipSvgPadding[3]))
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const xAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "xAxisGroupColumn")
		.attr("transform", "translate(0," + svgColumnPadding[0] + ")");

	const yAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "yAxisGroupColumn")
		.attr("transform", "translate(" + svgColumnPadding[3] + ",0)");

	const lineGeneratorTooltip = d3.line()
		.x(d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
		.y(d => yScaleTooltip(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]))
		.curve(d3.curveMonotoneX);

	const lineGeneratorTooltipBase = d3.line()
		.x(d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
		.y(d => yScaleTooltip(0))
		.curve(d3.curveMonotoneX);

	createFundButtons();

	function draw(originalData) {

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

			if (chartState.selectedFund !== lists.defaultValues.fund) {
				if (lists.queryStringValues.has("fund")) {
					lists.queryStringValues.set("fund", chartState.selectedFund);
				} else {
					lists.queryStringValues.append("fund", chartState.selectedFund);
				};
			} else {
				lists.queryStringValues.delete("fund");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);

			const tooltipSelection = memberStatesChartAreaDiv.select("#" + classPrefix + "tooltipDiv");

			if (tooltipSelection.size()) {
				updateTooltip(tooltipSelection, data);
			};

		});

		//end of draw
	};

	function createFundButtons() {
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
			.attr("src", d => donorsFlagsData[d.isoCode.toLowerCase()]);

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
			.data(d => stack(d.contributions.filter(e => e.year < currentYear)), d => d.key);

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
			.attr("y", (d, i, n) => d[0] === d[1] ? svgHeight - svgPadding[2] : localyScale.get(n[i])(d[1]))
			.attr("height", (d, i, n) => localyScale.get(n[i])(d[0]) - localyScale.get(n[i])(d[1]));

		let barLine = donorSvg.selectAll("." + classPrefix + "barLine")
			.data(d => fillWithZeros(d.contributions.filter(e => e.year < currentYear)));

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

		donorDiv.on("mouseover", donorDivMouseOver)
			.on("mouseout", donorDivMouseOut)
			.on("click", (_, d) => donorDivClick(d, true));

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
			.data(d => stack(d.contributions.filter(e => e.year < currentYear)), d => d.key);

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
			.attr("y", (d, i, n) => d[0] === d[1] ? svgHeight - svgPadding[2] : localyScale.get(n[i])(d[1]))
			.attr("height", (d, i, n) => localyScale.get(n[i])(d[0]) - localyScale.get(n[i])(d[1]));

		let barLine = nonMemberDonorSvg.selectAll("." + classPrefix + "barLine")
			.data(d => fillWithZeros(d.contributions.filter(e => e.year < currentYear)));

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

		nonMemberDonorDiv.on("mouseover", donorDivMouseOver)
			.on("mouseout", donorDivMouseOut)
			.on("click", (_, d) => donorDivClick(d, false));

		//end of drawNonMemberStates
	};

	function donorDivMouseOver() {
		d3.select(this).classed(classPrefix + "donorDivActive", true);
		d3.select(this).append("div")
			.attr("class", classPrefix + "donorExpandDiv")
			.append("i")
			.attr("class", "fas fa-expand-arrows-alt")
	};

	function donorDivMouseOut() {
		d3.select(this).classed(classPrefix + "donorDivActive", false);
		d3.select(this)
			.select("." + classPrefix + "donorExpandDiv")
			.remove();
	};

	function donorDivClick(datum, isMember) {
		d3.select(this).classed(classPrefix + "donorDivActive", false);
		d3.select(this)
			.select("." + classPrefix + "donorExpandDiv")
			.remove();

		memberStatesChartAreaDiv.select("#" + classPrefix + "tooltipDiv")
			.remove();

		yScaleTooltip.domain([0, d3.max(datum.contributions, e => chartState.selectedFund === "cerf/cbpf" ? e.cerf + e.cbpf : e[chartState.selectedFund])]);

		const tooltipDiv = memberStatesChartAreaDiv.append("div")
			.attr("id", classPrefix + "tooltipDiv")
			.style("left", "50%")
			.style("top", "50%")
			.style("transform", "translate(-50%,-50%)");

		const innerTooltipDiv = tooltipDiv.append("div")
			.style("width", tooltipWidth + "px")
			.style("height", tooltipTopHeight + tooltipChartHeight + "px")
			.style("cursor", "default")
			.style("pointer-events", "all");

		const tooltipTopDiv = innerTooltipDiv.append("div")
			.style("width", "100%")
			.style("height", tooltipTopHeight + "px")
			.style("font-size", "25px")
			.style("text-align", "right")
			.on("click", () => tooltipDiv.remove());

		const tooltipChartDiv = innerTooltipDiv.append("div")
			.style("width", "100%")
			.style("height", tooltipChartHeight + "px");

		tooltipTopDiv.append("i")
			.attr("class", "far fa-window-close")
			.style("cursor", "pointer");

		const tooltipSvg = tooltipChartDiv.append("svg")
			.attr("width", tooltipWidth)
			.attr("height", tooltipSvgHeight)
			.attr("class", classPrefix + "tooltipSvg");

		const defs = tooltipSvg.append("defs");

		const patternCerf = defs.append("pattern")
			.attr("id", classPrefix + "patterncerf")
			.attr("width", 10)
			.attr("height", 3)
			.attr("patternUnits", "userSpaceOnUse")
			.attr("patternTransform", "rotate(-45 0 0)")
			.append("line")
			.attr("x1", 0)
			.attr("y1", 2)
			.attr("x2", 10)
			.attr("y2", 2)
			.attr("stroke-width", 1)
			.attr("stroke", colors.cerf);

		const patternCbpf = defs.append("pattern")
			.attr("id", classPrefix + "patterncbpf")
			.attr("width", 10)
			.attr("height", 3)
			.attr("patternUnits", "userSpaceOnUse")
			.attr("patternTransform", "rotate(-45 0 0)")
			.append("line")
			.attr("x1", 0)
			.attr("y1", 2)
			.attr("x2", 10)
			.attr("y2", 2)
			.attr("stroke-width", 1)
			.attr("stroke", colors.cbpf);

		const patternTotal = defs.append("pattern")
			.attr("id", classPrefix + "patterntotal")
			.attr("width", 10)
			.attr("height", 3)
			.attr("patternUnits", "userSpaceOnUse")
			.attr("patternTransform", "rotate(-45 0 0)")
			.append("line")
			.attr("x1", 0)
			.attr("y1", 2)
			.attr("x2", 10)
			.attr("y2", 2)
			.attr("stroke-width", 1)
			.attr("stroke", colors.total);

		const tooltipNameDiv = tooltipChartDiv.append("div")
			.attr("class", classPrefix + "tooltipNameDiv");

		if (isMember) {
			const donorFlag = tooltipNameDiv.append("img")
				.attr("width", flagSizeTooltip)
				.attr("height", flagSizeTooltip)
				.attr("src", donorsFlagsData[datum.isoCode.toLowerCase()]);
		};

		const donorName = tooltipNameDiv.append("span")
			.html(datum.donor);

		tooltipSvg.append("g")
			.attr("class", classPrefix + "xAxisGroupTooltip")
			.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgPadding[2]) + ")")
			.call(xAxisTooltip)
			.selectAll(".tick")
			.filter(d => d === null)
			.remove();

		tooltipSvg.append("g")
			.attr("class", classPrefix + "yAxisGroupTooltip")
			.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
			.call(yAxisTooltip)
			.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		const stackedData = stack(datum.contributions);

		localTooltip.set(tooltipSvg.node(), datum);

		const tooltipBarsGroups = tooltipSvg.selectAll(null)
			.data(stackedData, d => d.key)
			.enter()
			.append("g")
			.attr("class", classPrefix + "tooltipBarsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		const tooltipBars = tooltipBarsGroups.selectAll(null)
			.data(d => {
				d.forEach(e => e.key = d.key);
				return d
			}, d => d.data.year)
			.enter()
			.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("fill", d => d.data.year !== currentYear ? null : `url(#${classPrefix}pattern${d.key})`)
			.attr("class", classPrefix + "tooltipBars")
			.attr("width", xScaleTooltip.bandwidth())
			.attr("height", 0)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2])
			.attr("x", d => xScaleTooltip(d.data.year))
			.transition()
			.duration(duration)
			.attr("y", (d, i, n) => d[0] === d[1] ? tooltipSvgHeight - tooltipSvgPadding[2] : yScaleTooltip(d[1]))
			.attr("height", (d, i, n) => yScaleTooltip(d[0]) - yScaleTooltip(d[1]));

		const tooltipLine = tooltipSvg.selectAll(null)
			.data(fillWithZeros(datum.contributions.filter(e => e.year < currentYear)))
			.enter()
			.append("path")
			.attr("class", classPrefix + "tooltipBarLine")
			.style("stroke", "#888")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.style("opacity", 0)
			.attr("d", lineGeneratorTooltipBase)
			.transition()
			.duration(duration)
			.style("opacity", chartState.selectedFund !== "cerf/cbpf" ? 1 : 0)
			.attr("d", lineGeneratorTooltip);

		const tooltipLabel = tooltipSvg.selectAll(null)
			.data(datum.contributions.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cbpf : d[chartState.selectedFund]), d => d.year)
			.enter()
			.append("text")
			.attr("class", classPrefix + "tooltipBarLabel")
			.style("opacity", 0)
			.style("fill", chartState.selectedFund === "cerf/cbpf" ? colors.cbpf : "#444")
			.attr("x", d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2])
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleTooltip(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) - barLabelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(0, chartState.selectedFund === "cerf/cbpf" ? d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		const tooltipLabelCerfValue = tooltipSvg.selectAll(null)
			.data(chartState.selectedFund === "cerf/cbpf" ? datum.contributions.filter(d => d.cerf) : [])
			.enter()
			.append("text")
			.attr("class", classPrefix + "tooltipBarLabelCerfValue")
			.style("opacity", 0)
			.style("fill", d3.color(colors.cerf).darker(0.4))
			.attr("x", d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2])
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleTooltip(d.cerf + d.cbpf) - barLabelPadding - (d.cbpf ? tooltipLabelCerfPadding : 0))
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(0, d.cerf);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B") + (d.cbpf ? "/" : "");
			});

		//end of donorDivClick
	};

	function updateTooltip(selection, data) {

		const tooltipSvg = selection.select("." + classPrefix + "tooltipSvg");

		const originalDatum = localTooltip.get(tooltipSvg.node());

		const thisDonor = originalDatum.donorId ? data.find(d => d.donorId === originalDatum.donorId) :
			data.reduce((acc, originalRow) => {

				const row = JSON.parse(JSON.stringify(originalRow));

				if (originalDatum.donor === lists.donorTypesList[row.donorId]) {

					if (Object.keys(acc).length) {
						acc.total += row.total;
						acc.cerf += row.cerf;
						acc.cbpf += row.cbpf;
						acc["paid##total"] += row["paid##total"];
						acc["paid##cerf"] += row["paid##cerf"];
						acc["paid##cbpf"] += row["paid##cbpf"];
						acc["pledged##total"] += row["pledged##total"];
						acc["pledged##cerf"] += row["pledged##cerf"];
						acc["pledged##cbpf"] += row["pledged##cbpf"];

						row.contributions.forEach(yearRow => {
							const foundYear = acc.contributions.find(e => e.year === yearRow.year);
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
								acc.contributions.push(yearRow);
							};
						});

					} else {
						row.donor = lists.donorTypesList[row.donorId];
						row.count = 1;
						delete row.donorId;
						Object.assign(acc, row);
					};

				};

				return acc;
			}, {});

		if (!originalDatum.donorId) thisDonor.contributions.sort((a, b) => a.year - b.year);

		const minScaleValue = 1e4;

		yScaleTooltip.domain([0, d3.max(thisDonor.contributions, e => chartState.selectedFund === "cerf/cbpf" ? e.cerf + e.cbpf : e[chartState.selectedFund]) || minScaleValue]);

		tooltipSvg.select("." + classPrefix + "yAxisGroupTooltip")
			.transition()
			.duration(duration)
			.call(yAxisTooltip)
			.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		const stackedData = stack(thisDonor.contributions);

		const tooltipBarsGroups = tooltipSvg.selectAll("." + classPrefix + "tooltipBarsGroups")
			.data(stackedData, d => d.key);

		const tooltipBars = tooltipBarsGroups.selectAll("rect")
			.data(d => {
				d.forEach(e => e.key = d.key);
				return d
			}, d => d.data.year)
			.transition()
			.duration(duration)
			.attr("y", (d, i, n) => d[0] === d[1] ? tooltipSvgHeight - tooltipSvgPadding[2] : yScaleTooltip(d[1]))
			.attr("height", (d, i, n) => yScaleTooltip(d[0]) - yScaleTooltip(d[1]));

		const tooltipLine = tooltipSvg.selectAll("." + classPrefix + "tooltipBarLine")
			.data(fillWithZeros(thisDonor.contributions.filter(e => e.year < currentYear)))
			.transition()
			.duration(duration)
			.style("opacity", chartState.selectedFund !== "cerf/cbpf" ? 1 : 0)
			.attr("d", lineGeneratorTooltip);

		let tooltipLabel = tooltipSvg.selectAll("." + classPrefix + "tooltipBarLabel")
			.data(thisDonor.contributions.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cbpf : d[chartState.selectedFund]), d => d.year);

		const tooltipLabelExit = tooltipLabel.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const tooltipLabelEnter = tooltipLabel.enter()
			.append("text")
			.attr("class", classPrefix + "tooltipBarLabel")
			.style("opacity", 0)
			.style("fill", chartState.selectedFund === "cerf/cbpf" ? colors.cbpf : "#444")
			.attr("x", d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2]);

		tooltipLabel = tooltipLabelEnter.merge(tooltipLabel);

		tooltipLabel.transition()
			.duration(duration)
			.style("opacity", 1)
			.style("fill", chartState.selectedFund === "cerf/cbpf" ? colors.cbpf : "#444")
			.attr("y", d => yScaleTooltip(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) - barLabelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(0, chartState.selectedFund === "cerf/cbpf" ? d.cbpf : d[chartState.selectedFund]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let tooltipLabelCerfValue = tooltipSvg.selectAll("." + classPrefix + "tooltipBarLabelCerfValue")
			.data(chartState.selectedFund === "cerf/cbpf" ? thisDonor.contributions.filter(d => d.cerf) : []);

		const tooltipLabelCerfValueExit = tooltipLabelCerfValue.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const tooltipLabelCerfValueEnter = tooltipLabelCerfValue.enter()
			.append("text")
			.attr("class", classPrefix + "tooltipBarLabelCerfValue")
			.style("opacity", 0)
			.style("fill", d3.color(colors.cerf).darker(0.4))
			.attr("x", d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2]);

		tooltipLabelCerfValue = tooltipLabelCerfValueEnter.merge(tooltipLabelCerfValue);

		tooltipLabelCerfValue.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleTooltip(d.cerf + d.cbpf) - barLabelPadding - (d.cbpf ? tooltipLabelCerfPadding : 0))
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(0, d.cerf);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B") + (d.cbpf ? "/" : "");
			});

		//end of updateTooltip
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
					isoCode: curr.isoCode.toLowerCase(),
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
				return colors[thisKey]
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

		let flagsColumn = svgColumnChart.selectAll("." + classPrefix + "flagsColumn")
			.data(columnData.slice(0, topDonors), d => d.donor);

		const flagsColumnExit = flagsColumn.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const flagsColumnEnter = flagsColumn.enter()
			.append("image")
			.attr("class", classPrefix + "flagsColumn")
			.style("opacity", 0)
			.attr("x", svgColumnPadding[3] - flagPadding - flagSizeColumn - yAxisColumn.tickSize())
			.attr("y", d => yScaleColumn(d.donor))
			.attr("width", flagSizeColumn)
			.attr("height", flagSizeColumn)
			.attr("href", d => donorsFlagsData[d.isoCode]);

		flagsColumn = flagsColumnEnter.merge(flagsColumn);

		flagsColumn.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleColumn(d.donor));

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
			sel.selectAll(".tick text")
				.filter(d => d === "Others")
				.attr("dx", flagSizeColumn + flagPadding);
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