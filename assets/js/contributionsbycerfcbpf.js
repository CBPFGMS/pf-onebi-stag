//|Contributions By Cerf/Cbpf module

import {
	chartState
} from "./chartstate.js";

import {
	donorsFlagsData
} from "./donorsflagsdata.js";

import {
	createLinks
} from "./links.js";

//|constants
const classPrefix = "pfbicc",
	currentDate = new Date(),
	cumulativeChartHeightPercentage = 0.38,
	currentYear = currentDate.getFullYear(),
	localVariable = d3.local(),
	allYears = "all",
	svgPaddingsCerf = [38, 42, 20, 50],
	svgPaddingsCbpf = [38, 42, 20, 50],
	svgColumnPadding = [16, 26, 8, 80],
	svgCumulativePaddingsCerf = [28, 42, 46, 50],
	svgCumulativePaddingsCbpf = [28, 42, 46, 50],
	arrowPaddingLeft = 22,
	arrowPaddingRight = 22,
	arrowCircleRadius = 15,
	innerTooltipDivWidth = 290,
	maxTooltipDonorNumber = 20,
	maxTooltipNameLength = 26,
	svgColumnChartWidth = 195,
	maxColumnRectHeight = 16,
	svgColumnChartHeight = 380,
	labelsColumnPadding = 2,
	maxYearNumber = 4,
	flagSize = 16,
	flagSizeTooltip = 20,
	flagPadding = 2,
	duration = 1000,
	labelMargin = 22,
	labelPadding = 8,
	labelPaddingInner = 4,
	titlePadding = 6,
	precision = 6,
	topDonors = 10,
	tooltipPadding = 12,
	legendPadding = 36,
	legendRectSize = 16,
	legendTextPadding = 4,
	xGroupExtraPadding = 18,
	lineOpacity = 0.75,
	fadeOpacity = 0.1,
	legendPledgedPadding = 180,
	cumulativeTitlePadding = 20,
	cumulativeStrokeWidth = 2,
	cumulativeLabelPadding = 6,
	maxNumberOfBars = 12,
	tickMove = 6,
	tickSize = 6,
	secondTickSize = 6,
	secondTickPadding = 14,
	unBlue = "#1F69B3",
	arrowFadeColor = "#f1f1f1",
	blankImg = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
	formatMoney0Decimals = d3.format(",.0f"),
	formatPercent = d3.format("%"),
	monthFormat = d3.timeFormat("%b"),
	monthFormatFull = d3.timeFormat("%B"),
	monthAbbrvParse = d3.timeParse("%b"),
	monthParse = d3.timeParse("%m"),
	pledgeDateParse = d3.timeParse("%m-%Y"),
	formatSIaxes = d3.format("~s"),
	monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
	separator = "##",
	stackKeys = ["cerf", "cbpf"],
	valueTypes = ["pledged", "paid", "total"];

//|variables
let selectedYear,
	selectedValue,
	yearsArray,
	yearsArrayCerf,
	yearsArrayCbpf;

function createContributionsByCerfCbpf(selections, colors, lists) {

	d3.select("#pfbihpPlayButton")
		.property("disabled", false);

	selectedYear = lists.queryStringValues.has("contributionYear") ? lists.queryStringValues.get("contributionYear").split("|").map(e => +e) :
		lists.queryStringValues.has("year") ? [+lists.queryStringValues.get("year")] : [allYears];
	selectedValue = lists.queryStringValues.has("value") ? lists.queryStringValues.get("value") : "total";

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
		.html("by CERF/CBPF");

	const topButtonsDiv = breadcrumbDiv.append("div")
		.attr("data-html2canvas-ignore", "true")
		.attr("class", classPrefix + "topButtonsDiv");

	createLinks(topButtonsDiv);

	const containerDiv = outerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const tooltipDiv = containerDiv.append("div")
		.attr("id", classPrefix + "tooltipDiv")
		.style("display", "none");

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const yearButtonsDiv = topDiv.append("div")
		.attr("class", classPrefix + "yearButtonsDiv");

	const paidPledgedButtonsDiv = topDiv.append("div")
		.attr("class", classPrefix + "paidPledgedButtonsDiv");

	const chartAreaDiv = containerDiv.append("div")
		.attr("class", classPrefix + "chartAreaDiv");

	const cerfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cerfContainerDiv");

	const cbpfContainerDiv = chartAreaDiv.append("div")
		.attr("class", classPrefix + "cbpfContainerDiv");

	chartState.currentTooltip = tooltipDiv;

	const cerfContainerDivSize = cerfContainerDiv.node().getBoundingClientRect();
	const cbpfContainerDivSize = cbpfContainerDiv.node().getBoundingClientRect();

	const svgWidthCerf = cerfContainerDivSize.width,
		svgWidthCbpf = cbpfContainerDivSize.width,
		svgHeightCerf = cerfContainerDivSize.height,
		svgHeightCbpf = cbpfContainerDivSize.height;

	const tickStepCerf = (svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]) / maxNumberOfBars,
		tickStepCbpf = (svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]) / maxNumberOfBars;

	const svgCerf = cerfContainerDiv.append("svg")
		.attr("width", svgWidthCerf)
		.attr("height", svgHeightCerf);

	const svgCbpf = cbpfContainerDiv.append("svg")
		.attr("width", svgWidthCbpf)
		.attr("height", svgHeightCbpf);

	const clipPathCerf = svgCerf.append("clipPath")
		.attr("id", classPrefix + "clipPathCerf")
		.append("rect")
		.attr("height", svgHeightCerf - svgPaddingsCerf[0] - svgPaddingsCerf[2])
		.attr("width", svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]);

	const clipPathGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "clipPathGroupCerf")
		.attr("transform", "translate(" + svgPaddingsCerf[3] + ",0)")
		.attr("clip-path", "url(#" + classPrefix + "clipPathCerf)");

	const chartAreaCerf = clipPathGroupCerf.append("g")
		.attr("class", classPrefix + "chartAreaCerf")
		.attr("transform", "translate(0,0)");

	const clipPathCbpf = svgCbpf.append("clipPath")
		.attr("id", classPrefix + "clipPathCbpf")
		.append("rect")
		.attr("height", svgHeightCbpf - svgPaddingsCbpf[0] - svgPaddingsCbpf[2])
		.attr("width", svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]);

	const clipPathGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "clipPathGroupCbpf")
		.attr("transform", "translate(" + svgPaddingsCbpf[3] + ",0)")
		.attr("clip-path", "url(#" + classPrefix + "clipPathCbpf)");

	const chartAreaCbpf = clipPathGroupCbpf.append("g")
		.attr("class", classPrefix + "chartAreaCbpf")
		.attr("transform", "translate(0,0)");

	const columnChartContainer = selections.byCerfCbpfChartContainer;

	columnChartContainer.html(null);

	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	yearsArray = d3.range(lists.yearsArrayContributions[0], currentYear + 1, 1);
	yearsArrayCerf = d3.range(lists.yearsArrayContributionsCerf[0], currentYear + 1, 1);
	yearsArrayCbpf = d3.range(lists.yearsArrayContributionsCbpf[0], currentYear + 1, 1);

	const xScaleCerf = d3.scaleBand()
		.range([svgPaddingsCerf[3], svgWidthCerf - svgPaddingsCerf[1]])
		.paddingOuter(0.2);

	const xScaleCerfInner = d3.scaleBand()
		.paddingInner(0.35)
		.paddingOuter(0.2);

	const xScaleCbpf = d3.scaleBand()
		.range([svgPaddingsCbpf[3], svgWidthCbpf - svgPaddingsCbpf[1]])
		.paddingOuter(0.2);

	const xScaleCbpfInner = d3.scaleBand()
		.paddingInner(0.35)
		.paddingOuter(0.2);

	const yScaleCerf = d3.scaleLinear()
		.range([(svgHeightCerf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCerf[2], svgPaddingsCerf[0] + labelMargin]);

	const yScaleCbpf = d3.scaleLinear()
		.range([(svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCbpf[2], svgPaddingsCbpf[0] + labelMargin]);

	const yScaleCumulativeCerf = d3.scaleLinear()
		.range([svgHeightCerf - svgPaddingsCerf[2] - svgCumulativePaddingsCerf[2], (svgHeightCerf * (1 - cumulativeChartHeightPercentage)) + svgCumulativePaddingsCerf[0]]);

	const yScaleCumulativeCbpf = d3.scaleLinear()
		.range([svgHeightCbpf - svgPaddingsCbpf[2] - svgCumulativePaddingsCbpf[2], (svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) + svgCumulativePaddingsCbpf[0]]);

	const xScaleColumn = d3.scaleLinear()
		.range([svgColumnPadding[3], svgColumnChartWidth - svgColumnPadding[1]]);

	const yScaleColumn = d3.scaleBand()
		.range([svgColumnPadding[0], svgColumnChartHeight - svgColumnPadding[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const cumulativeLineGeneratorCerf = d3.line()
		.y(d => yScaleCumulativeCerf(d.total))
		.x(d => xScaleCerf(selectedYear[0] === allYears ? d.year : d.month) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const cumulativeLineGeneratorCbpf = d3.line()
		.y(d => yScaleCumulativeCbpf(d.total))
		.x(d => xScaleCbpf(selectedYear[0] === allYears ? d.year : d.month) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const xAxisCerf = d3.axisBottom(xScaleCerf)
		.tickSizeOuter(0);

	const xAxisCbpf = d3.axisBottom(xScaleCbpf)
		.tickSizeOuter(0);

	const xAxisGroupedCerf = d3.axisBottom(xScaleCerfInner)
		.tickFormat(d => d % 100 < 10 ? "0" + d % 100 : d % 100)
		.tickSizeInner(3)
		.tickSizeOuter(0);

	const xAxisGroupedCbpf = d3.axisBottom(xScaleCbpfInner)
		.tickFormat(d => d % 100 < 10 ? "0" + d % 100 : d % 100)
		.tickSizeInner(3)
		.tickSizeOuter(0);

	const yAxisCerf = d3.axisLeft(yScaleCerf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]))
		.tickSizeOuter(0);

	const yAxisCbpf = d3.axisLeft(yScaleCbpf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]))
		.tickSizeOuter(0);

	const yAxisCumulativeCerf = d3.axisLeft(yScaleCumulativeCerf)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]))
		.tickSizeOuter(0);

	const yAxisCumulativeCbpf = d3.axisLeft(yScaleCumulativeCbpf)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeInner(-(svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]))
		.tickSizeOuter(0);

	const xAxisGroupCerf = chartAreaCerf.append("g")
		.attr("class", classPrefix + "xAxisGroupCerf")
		.attr("transform", "translate(0," + ((svgHeightCerf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCerf[2]) + ")");

	const xAxisGroupCbpf = chartAreaCbpf.append("g")
		.attr("class", classPrefix + "xAxisGroupCbpf")
		.attr("transform", "translate(0," + ((svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCbpf[2]) + ")");

	const yAxisGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupCerf")
		.attr("transform", "translate(" + svgPaddingsCerf[3] + ",0)");

	const yAxisGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupCbpf")
		.attr("transform", "translate(" + svgPaddingsCbpf[3] + ",0)");

	const yAxisGroupCumulativeCerf = svgCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupCumulativeCerf")
		.attr("transform", "translate(" + svgCumulativePaddingsCerf[3] + ",0)");

	const yAxisGroupCumulativeCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupCumulativeCbpf")
		.attr("transform", "translate(" + svgCumulativePaddingsCbpf[3] + ",0)");

	const xAxisColumn = d3.axisTop(xScaleColumn)
		.tickSizeOuter(0)
		.ticks(2)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumn = d3.axisLeft(yScaleColumn)
		.tickPadding(flagSize + 2 * flagPadding)
		.tickSize(3);

	const xAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "xAxisGroupColumn")
		.attr("transform", "translate(0," + svgColumnPadding[0] + ")");

	const yAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "yAxisGroupColumn")
		.attr("transform", "translate(" + svgColumnPadding[3] + ",0)");

	const chartLayerCerf = chartAreaCerf.append("g");
	const chartLayerCbpf = chartAreaCbpf.append("g");
	const tooltipRectLayerCerf = chartAreaCerf.append("g");
	const tooltipRectLayerCbpf = chartAreaCbpf.append("g");

	const defsCerf = svgCerf.append("defs")

	const patternCerf = defsCerf.append("pattern")
		.attr("id", classPrefix + "patternCerf")
		.attr("width", 10)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(-45 0 0)")
		.append("line")
		.attr("x1", 0)
		.attr("y1", 2)
		.attr("x2", 10)
		.attr("y2", 2)
		.attr("stroke-width", 2)
		.attr("stroke", colors.cerf);

	const defsCbpf = svgCbpf.append("defs")

	const patternCbpf = defsCbpf.append("pattern")
		.attr("id", classPrefix + "patternCbpf")
		.attr("width", 10)
		.attr("height", 6)
		.attr("patternUnits", "userSpaceOnUse")
		.attr("patternTransform", "rotate(-45 0 0)")
		.append("line")
		.attr("x1", 0)
		.attr("y1", 2)
		.attr("x2", 10)
		.attr("y2", 2)
		.attr("stroke-width", 2)
		.attr("stroke", colors.cbpf);

	createYearButtons(yearButtonsDiv);

	createPaidPledgedButtons(paidPledgedButtonsDiv);

	function draw(originalData) {

		let data = filterData(originalData);
		let columnData = filterDataColumn(originalData);

		drawCerf(data);
		drawCbpf(data);
		createColumnTopValues(columnData);
		createColumnChart(columnData);

		const yearButtons = yearButtonsDiv.selectAll("button");

		const valueButtons = paidPledgedButtonsDiv.selectAll("button");

		yearButtons.on("mouseover", mouseoveryearButtons)
			.on("mouseout", mouseoutyearButtons)
			.on("click", (event, d) => {
				tooltipDiv.style("display", "none");
				const self = event.currentTarget;
				if (event.altKey) {
					clickyearButtons(d, false);
					return;
				};
				if (localVariable.get(self) !== "clicked") {
					localVariable.set(self, "clicked");
					setTimeout(() => {
						if (localVariable.get(self) === "clicked") {
							clickyearButtons(d, true);
						};
						localVariable.set(self, null);
					}, 250);
				} else {
					clickyearButtons(d, false);
					localVariable.set(self, null);
				};
			});

		function mouseoveryearButtons(_, d) {
			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltip = tooltipDiv.append("div")
				.style("max-width", "180px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html(d === allYears ? "Click to show all years" : "Click for selecting a single year, double-click or ALT + click for selecting multiple years. Maximum: " + maxYearNumber + " years.");

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			tooltipDiv.style("left", (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					tooltipPadding :
					thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		};

		function mouseoutyearButtons() {
			tooltipDiv.html(null)
				.style("display", "none");
		};

		function clickyearButtons(d, singleSelection) {
			if (singleSelection || d === allYears || selectedYear[0] === allYears) {
				selectedYear = [d];
				chartState.selectedYear = d;
			} else {
				const index = selectedYear.indexOf(d);
				if (index > -1) {
					if (selectedYear.length === 1) {
						return;
					} else {
						selectedYear.splice(index, 1);
					}
				} else {
					selectedYear.push(d);
					if (selectedYear.length > maxYearNumber) selectedYear.shift();
					chartState.selectedYear = d;
				};
			};

			data = filterData(originalData);
			columnData = filterDataColumn(originalData);

			drawCerf(data);
			drawCbpf(data);
			createColumnTopValues(columnData);
			createColumnChart(columnData);

			yearButtons.classed("active", d => selectedYear.indexOf(d) > -1);
			selections.yearDropdown.select("#pfbihpdisabledOption")
				.html(selectedYear.length > 1 ? "Multiple years" : selectedYear[0] === allYears ? "All" : selectedYear[0]);

			selections.yearDropdown.dispatch("change");

			if (selectedYear[0] !== allYears) {
				const yearValues = selectedYear.join("|");
				if (lists.queryStringValues.has("contributionYear")) {
					lists.queryStringValues.set("contributionYear", yearValues);
				} else {
					lists.queryStringValues.append("contributionYear", yearValues);
				};
			} else {
				lists.queryStringValues.delete("contributionYear");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);

		};

		valueButtons.on("click", (event, d) => {
			selectedValue = d;
			valueButtons.classed("active", e => e === selectedValue);
			drawCerf(data);
			drawCbpf(data);
			createColumnTopValues(columnData);
			createColumnChart(columnData);

			if (selectedValue !== "total") {
				if (lists.queryStringValues.has("value")) {
					lists.queryStringValues.set("value", selectedValue);
				} else {
					lists.queryStringValues.append("value", selectedValue);
				};
			} else {
				lists.queryStringValues.delete("value");
			};
			const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
			window.history.replaceState(null, "", newURL);
		});

		//end of draw
	};

	function createYearButtons(container) {

		const yearsData = yearsArray.concat([allYears]);

		const yearLeftArrow = container.append("div")
			.attr("class", classPrefix + "yearLeftArrow")
			.style("cursor", "pointer");

		const yearButtonsContainerDiv = container.append("div")
			.attr("class", classPrefix + "yearButtonsContainerDiv");

		const yearButtonsContainer = yearButtonsContainerDiv.append("div")
			.attr("class", classPrefix + "yearButtonsContainer");

		const yearRightArrow = container.append("div")
			.attr("class", classPrefix + "yearRightArrow")
			.style("opacity", fadeOpacity)
			.style("cursor", "default");

		yearLeftArrow.append("i")
			.attr("class", "fas fa-angle-left");

		yearRightArrow.append("i")
			.attr("class", "fas fa-angle-right");

		const yearsButtons = yearButtonsContainer.selectAll(null)
			.data(yearsData)
			.enter()
			.append("button")
			.classed("active", d => selectedYear.indexOf(d) > -1)
			.html(d => d === allYears ? capitalize(allYears) : d);

		let yearButtonsSize,
			yearButtonsContainerSize;

		setTimeout(function() {
			yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth;
			yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;

			yearButtonsContainer.style("left", -1 * (yearButtonsSize - yearButtonsContainerSize) + "px");
		}, duration / 10);

		yearLeftArrow.on("click", () => {
			const thisLeft = parseInt(yearButtonsContainer.style("left"), 10);
			yearRightArrow.style("opacity", 1)
				.style("cursor", "pointer");
			yearButtonsContainer.transition()
				.duration(duration)
				.style("left", Math.min(thisLeft + yearButtonsContainerSize, 0) + "px")
				.on("end", () => {
					if (parseInt(yearButtonsContainer.style("left"), 10) === 0) {
						yearLeftArrow.style("opacity", fadeOpacity)
							.style("cursor", "default");
					};
				});
		});

		yearRightArrow.on("click", () => {
			const thisLeft = parseInt(yearButtonsContainer.style("left"), 10);
			yearLeftArrow.style("opacity", 1)
				.style("cursor", "pointer");
			yearButtonsContainer.transition()
				.duration(duration)
				.style("left", Math.max(thisLeft - yearButtonsContainerSize, -1 * (yearButtonsSize - yearButtonsContainerSize)) + "px")
				.on("end", () => {
					if (parseInt(yearButtonsContainer.style("left"), 10) === -1 * (yearButtonsSize - yearButtonsContainerSize)) {
						yearRightArrow.style("opacity", fadeOpacity)
							.style("cursor", "default");
					};
				});
		});

		//end of createYearButtons
	};

	function createPaidPledgedButtons(container) {

		const valuesButtons = container.selectAll(null)
			.data(valueTypes)
			.enter()
			.append("button")
			.classed("active", d => selectedValue === d)
			.html(d => capitalize(d));

	};

	function drawCerf(data) {

		if (selectedYear[0] !== allYears) {
			chartAreaCerf.transition()
				.duration(duration)
				.attr("transform", "translate(0,0)");
		};

		const noCerfValues = selectedYear.every(e => e < yearsArrayCerf[0]);

		const xValue = selectedYear[0] === allYears ? "year" : "month";

		const dataYear = selectedYear[0] === allYears ? data.filter(e => yearsArrayCerf.includes(e.year)) : [];

		const dataMonth = selectedYear[0] === allYears || noCerfValues ? [] : data;

		if (dataMonth.length) {
			dataMonth.forEach(row => {
				const monthlyData = row.monthValues.reduce((acc, curr) => {
					if (curr.PooledFundId === lists.cerfPooledFundId) {
						const foundYear = acc.find(e => e.year === +curr.PledgePaidDate.split("-")[1]);
						if (foundYear) {
							foundYear.total += curr.PaidAmt + curr.PledgeAmt;
							foundYear.paid += curr.PaidAmt;
							foundYear.pledged += curr.PledgeAmt;
						} else {
							acc.push({
								year: +curr.PledgePaidDate.split("-")[1],
								total: curr.PaidAmt + curr.PledgeAmt,
								paid: curr.PaidAmt,
								pledged: curr.PledgeAmt
							});
						};
					};
					return acc;
				}, []);
				monthlyData.sort((a, b) => b.year - a.year);
				row.cerfMonthlyData = monthlyData;
			});
		};

		const dataMonthWithZeros = monthsArray.reduce((acc, curr) => {
			const foundMonth = dataMonth.find(e => e.month === curr);
			if (foundMonth) {
				if (foundMonth.cerfMonthlyData.length !== selectedYear.length) {
					selectedYear.forEach(year => {
						const foundYear = foundMonth.cerfMonthlyData.find(f => f.year === year);
						if (!foundYear) {
							foundMonth.cerfMonthlyData.push({
								year: year,
								total: 0,
								paid: 0,
								pledged: 0
							});
						};
					});
				};
				acc.push(foundMonth);
			} else if (!(selectedYear.length === 1 && selectedYear[0] === currentYear)) {
				const obj = {
					month: curr,
					cerfMonthlyData: []
				};
				selectedYear.forEach(year => {
					obj.cerfMonthlyData.push({
						year: year,
						total: 0,
						paid: 0,
						pledged: 0
					});
				});
				acc.push(obj);
			};
			return acc;
		}, []);

		const dataCumulative = noCerfValues ? [] :
			selectedYear[0] === allYears ?
			dataYear.reduce((acc, curr, index) => {
				acc[0].values.push({
					year: curr.year,
					total: curr[`${selectedValue}${separator}cerf`] + (acc[0].values[index - 1] ? acc[0].values[index - 1].total : 0)
				});
				return acc;
			}, [{
				year: allYears,
				values: []
			}]) : dataMonthWithZeros.reduce((acc, curr, index) => {
				curr.cerfMonthlyData.forEach(d => {
					const foundYear = acc.find(e => e.year === d.year);
					if (foundYear) {
						foundYear.values.push({
							month: curr.month,
							total: d[selectedValue] + (foundYear.values[index - 1] ? foundYear.values[index - 1].total : 0)
						});
					} else {
						acc.push({
							year: d.year,
							values: [{
								month: curr.month,
								total: d[selectedValue]
							}]
						});
					};
				});
				return acc;
			}, []);

		const minxScaleValue = d3.max(data, d => d[`total${separator}cerf`]) || 1e3;

		const minxScaleInnerValue = d3.max(dataMonth, d => d3.max(d.cerfMonthlyData, e => e.total)) || 1e3;

		xScaleCerf.domain(selectedYear[0] === allYears ? yearsArrayCerf : monthsArray)
			.range([0, (selectedYear[0] === allYears ? yearsArrayCerf.length : monthsArray.length) * tickStepCerf]);

		xScaleCerf.paddingInner(selectedYear[0] === allYears ? 0.5 : 0.2);

		yScaleCerf.domain([0, (selectedYear[0] === allYears ?
			d3.max(data, d => d[`${selectedValue}${separator}cerf`]) || minxScaleValue :
			d3.max(dataMonth, d => d3.max(d.cerfMonthlyData, e => e[selectedValue])) || minxScaleInnerValue)]);

		yScaleCumulativeCerf.domain([0, (selectedYear[0] === allYears ?
			dataCumulative[0].values[dataCumulative[0].values.length - 1].total || minxScaleValue :
			d3.max(dataCumulative, d => d.values[d.values.length - 1].total) || minxScaleInnerValue)]);

		xScaleCerfInner.domain(selectedYear[0] === allYears ? [] : selectedYear.slice().sort((a, b) => a - b))
			.range([0, xScaleCerf.bandwidth()]);

		let chartTitleCerf = svgCerf.selectAll("." + classPrefix + "chartTitleCerf")
			.data([true]);

		const chartTitleEnterCerf = chartTitleCerf.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitleCerf")
			.attr("x", svgPaddingsCerf[3] + (svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]) / 2)
			.attr("y", noCerfValues ? d3.mean(yScaleCerf.range()) : svgPaddingsCerf[0] - titlePadding)
			.text(noCerfValues ? "" : "CERF ");

		chartTitleEnterCerf.append("tspan")
			.attr("class", classPrefix + "chartTitleSpanCerf")
			.text(noCerfValues ? "CERF started operations in " + yearsArrayCerf[0] :
				"(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		chartTitleCerf = chartTitleEnterCerf.merge(chartTitleCerf);

		chartTitleCerf.attr("y", noCerfValues ? d3.mean(yScaleCerf.range()) : svgPaddingsCerf[0] - titlePadding);

		chartTitleCerf.node().childNodes[0].textContent = noCerfValues ? "" : "CERF ";

		chartTitleCerf.select("tspan")
			.text(noCerfValues ? "CERF started operations in " + yearsArrayCerf[0] :
				"(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		let barsCerf = chartLayerCerf.selectAll("." + classPrefix + "barsCerf")
			.data(dataYear, d => d.year);

		const barsCerfExit = barsCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsCerfEnter = barsCerf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsCerf")
			.attr("x", d => xScaleCerf(d.year))
			.attr("width", xScaleCerf.bandwidth())
			.attr("y", d => yScaleCerf(0))
			.attr("height", 0)
			.style("fill", d => selectedYear[0] === allYears && d.year === currentYear ? `url(#${classPrefix}patternCerf)` : colors.cerf)
			.attr("stroke", d => selectedYear[0] === allYears && d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => selectedYear[0] === allYears && d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsCerf = barsCerfEnter.merge(barsCerf);

		barsCerf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
			.attr("height", d => yScaleCerf(0) - yScaleCerf(d[`${selectedValue}${separator}cerf`]));

		let labelsCerf = chartLayerCerf.selectAll("." + classPrefix + "labelsCerf")
			.data(dataYear.filter(e => e[`${selectedValue}${separator}cerf`]), d => d.year);

		const labelsCerfExit = labelsCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.style("opacity", 0)
			.remove();

		const labelsCerfEnter = labelsCerf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsCerf")
			.attr("x", d => xScaleCerf(d.year) + xScaleCerf.bandwidth() / 2)
			.attr("y", d => d[`pledged${separator}cerf`] && selectedValue === "total" ? yScaleCerf(0) - (2 * labelPadding) : yScaleCerf(0) - labelPadding);

		labelsCerf = labelsCerfEnter.merge(labelsCerf);

		labelsCerf.transition()
			.duration(duration)
			.attr("y", d => d[`pledged${separator}cerf`] && selectedValue === "total" ? yScaleCerf(d[`total${separator}cerf`]) - (2 * labelPadding) : yScaleCerf(d[`${selectedValue}${separator}cerf`]) - labelPadding)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}cerf`]);
				return !d[`pledged${separator}cerf`] || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCerf(d.year) + xScaleCerf.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d[`pledged${separator}cerf`])(d[`pledged${separator}cerf`]) + ")");
			});

		let groupCerf = chartLayerCerf.selectAll("." + classPrefix + "groupCerf")
			.data(dataMonth, d => d.month);

		const groupExitCerf = groupCerf.exit()
			.remove();

		const groupEnterCerf = groupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "groupCerf")
			.attr("transform", d => "translate(" + xScaleCerf(d.month) + ",0)");

		groupCerf = groupEnterCerf.merge(groupCerf);

		groupCerf.attr("transform", d => "translate(" + xScaleCerf(d.month) + ",0)");

		let barsGroupCerf = groupCerf.selectAll("." + classPrefix + "barsGroupCerf")
			.data(d => d.cerfMonthlyData, d => d.year);

		const barsGroupExitCerf = barsGroupCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsGroupEnterCerf = barsGroupCerf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsGroupCerf")
			.attr("x", d => xScaleCerfInner(d.year))
			.attr("width", xScaleCerfInner.bandwidth())
			.attr("y", d => yScaleCerf(0))
			.attr("height", 0)
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patternCerf)` : colors.cerf)
			.attr("stroke", d => d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsGroupCerf = barsGroupEnterCerf.merge(barsGroupCerf);

		barsGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1)
			.style("fill", (d, i, n) => d.year === currentYear ? `url(#${classPrefix}patternCerf)` :
				n.length > 1 ? colors.cerfAnalogous[i] : colors.cerf)
			.attr("x", d => xScaleCerfInner(d.year))
			.attr("width", xScaleCerfInner.bandwidth())
			.attr("y", d => yScaleCerf(d[selectedValue]))
			.attr("height", d => yScaleCerf(0) - yScaleCerf(d[selectedValue]));

		let labelsGroupCerf = groupCerf.selectAll("." + classPrefix + "labelsGroupCerf")
			.data(d => d.cerfMonthlyData.filter((e, i) => e[selectedValue] && (!i || i === d.cerfMonthlyData.length - 1)), d => d.year);

		const labelsGroupCerfExit = labelsGroupCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.style("opacity", 0)
			.remove();

		const labelsGroupCerfEnter = labelsGroupCerf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsGroupCerf")
			.attr("x", d => xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCerf(0) - (3 * labelPaddingInner) : yScaleCerf(0) - labelPaddingInner);

		labelsGroupCerf = labelsGroupCerfEnter.merge(labelsGroupCerf);

		labelsGroupCerf.raise();

		labelsGroupCerf.transition()
			.duration(duration)
			.attr("x", d => xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCerf(d[selectedValue]) - (3 * labelPaddingInner) : yScaleCerf(d[selectedValue]) - labelPaddingInner)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedValue]);
				return !d.pledged || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCerfInner(d.year) + xScaleCerfInner.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d.pledged)(d.pledged) + ")");
			});

		let xAxisGroupedGroupCerf = groupCerf.selectAll("." + classPrefix + "xAxisGroupedGroupCerf")
			.data([true]);

		xAxisGroupedGroupCerf = xAxisGroupedGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupedGroupCerf")
			.attr("transform", "translate(0," + (yScaleCerf(0)) + ")")
			.merge(xAxisGroupedGroupCerf)
			.style("opacity", selectedYear.length > 1 ? 1 : 0);

		xAxisGroupedGroupCerf.transition()
			.duration(duration)
			.call(xAxisGroupedCerf);

		let tooltipRectCerf = tooltipRectLayerCerf.selectAll("." + classPrefix + "tooltipRectCerf")
			.data(dataYear, d => d.year);

		const tooltipRectCerfExit = tooltipRectCerf.exit()
			.remove();

		const tooltipRectCerfEnter = tooltipRectCerf.enter()
			.append("rect")
			.style("opacity", 0)
			.attr("pointer-events", "all")
			.attr("class", classPrefix + "tooltipRectCerf")
			.attr("x", d => xScaleCerf(d[xValue]))
			.attr("y", svgPaddingsCerf[0])
			.attr("width", xScaleCerf.bandwidth())
			.attr("height", (svgHeightCerf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCerf[0] - svgPaddingsCerf[2]);

		tooltipRectCerf = tooltipRectCerfEnter.merge(tooltipRectCerf);

		tooltipRectCerf.attr("x", d => xScaleCerf(d[xValue]))
			.attr("width", xScaleCerf.bandwidth());

		let tooltipGroupCerf = chartLayerCerf.selectAll("." + classPrefix + "tooltipGroupCerf")
			.data(dataMonth, d => d.month);

		const tooltipGroupExitCerf = tooltipGroupCerf.exit()
			.remove();

		const tooltipGroupEnterCerf = tooltipGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "tooltipGroupCerf")
			.attr("transform", d => "translate(" + xScaleCerf(d.month) + ",0)");

		tooltipGroupCerf = tooltipGroupEnterCerf.merge(tooltipGroupCerf);

		tooltipGroupCerf.attr("transform", d => "translate(" + xScaleCerf(d.month) + ",0)")
			.each(d => d.cerfMonthlyData.forEach(e => e.parentData = d));

		let tooltipRectGroupCerf = tooltipGroupCerf.selectAll("." + classPrefix + "tooltipRectGroupCerf")
			.data(d => d.cerfMonthlyData, d => d.year);

		const tooltipRectGroupExitCerf = tooltipRectGroupCerf.exit()
			.remove();

		const tooltipRectGroupEnterCerf = tooltipRectGroupCerf.enter()
			.append("rect")
			.attr("class", classPrefix + "tooltipRectGroupCerf")
			.attr("x", d => xScaleCerfInner(d.year))
			.attr("width", xScaleCerfInner.bandwidth())
			.attr("y", svgPaddingsCerf[0])
			.attr("height", (svgHeightCerf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCerf[0] - svgPaddingsCerf[2])
			.style("opacity", 0)
			.attr("pointer-events", "all");

		tooltipRectGroupCerf = tooltipRectGroupEnterCerf.merge(tooltipRectGroupCerf);

		tooltipRectGroupCerf.transition()
			.duration(duration)
			.attr("x", d => xScaleCerfInner(d.year))
			.attr("width", xScaleCerfInner.bandwidth());

		tooltipRectCerf.on("mouseover", (event, d) => mouseoverTooltipCerf(event, d, "yearTooltip"))
			.on("mouseout", mouseoutTooltipCerf);

		tooltipRectGroupCerf.on("mouseover", (event, d) => mouseoverTooltipCerf(event, d, "monthTooltip"))
			.on("mouseout", mouseoutTooltipCerf);

		function mouseoverTooltipCerf(event, d, tooltipType) {

			chartState.currentHoveredElement = event.currentTarget;

			groupCerf.call(highlightSelection);
			labelsCerf.call(highlightSelection);
			barsCerf.call(highlightSelection);

			function highlightSelection(selection) {
				selection.style("opacity", e => d.parentData ? (e.month === d.parentData.month ? 1 : fadeOpacity) :
					e.year === d.year ? 1 : fadeOpacity);
			};

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(tooltipType === "yearTooltip" ? d.year : monthFormatFull(monthAbbrvParse(d.parentData.month)) + " " + d.year);

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			const valuesArray = tooltipType === "yearTooltip" ? d.yearValues : d.parentData.monthValues.filter(e => e.FiscalYear === d.year);

			const totalValues = valuesArray.reduce((acc, curr) => {
				if (curr.PooledFundId === lists.cerfPooledFundId) {
					acc.total += curr.PaidAmt + curr.PledgeAmt;
					acc.paid += curr.PaidAmt;
					acc.pledged += curr.PledgeAmt;
				};
				return acc;
			}, {
				total: 0,
				paid: 0,
				pledged: 0
			});

			let tooltipData = valuesArray.reduce((acc, curr) => {
				if (curr.PooledFundId === lists.cerfPooledFundId) {
					const foundDonor = acc.find(e => e.donorId === curr.DonorId);
					if (foundDonor) {
						foundDonor.total += curr.PaidAmt + curr.PledgeAmt;
						foundDonor.paid += curr.PaidAmt;
						foundDonor.pledged += curr.PledgeAmt;
					} else {
						acc.push({
							donorId: curr.DonorId,
							total: curr.PaidAmt + curr.PledgeAmt,
							paid: curr.PaidAmt,
							pledged: curr.PledgeAmt
						});
					};
				};
				return acc;
			}, []);

			tooltipData.sort((a, b) => b[selectedValue] - a[selectedValue]);

			tooltipData = tooltipData.reduce((acc, curr, index) => {
				if (index < maxTooltipDonorNumber) {
					acc.push(curr)
				} else if (index === maxTooltipDonorNumber) {
					curr.donorId = null;
					acc.push(curr);
				} else {
					acc[maxTooltipDonorNumber].total += curr.total;
					acc[maxTooltipDonorNumber].paid += curr.paid;
					acc[maxTooltipDonorNumber].pledged += curr.pledged;
				};
				return acc;
			}, []);

			const rowDivTotal = tooltipContainer.append("div")
				.style("display", "flex")
				.style("align-items", "center")
				.style("margin-bottom", "12px")
				.style("width", "100%");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipYears")
				.html("Total");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html("$" + formatMoney0Decimals(totalValues[selectedValue]));

			tooltipData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("img")
					.attr("width", flagSizeTooltip)
					.attr("height", flagSizeTooltip)
					.style("margin-right", "4px")
					.attr("src", row.donorId ? (donorsFlagsData[lists.donorIsoCodesList[row.donorId].toLowerCase()] || blankImg) : blankImg);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(row.donorId ? lists.donorNamesList[row.donorId].substring(0, maxTooltipNameLength) : "Others");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row[selectedValue]));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = event.currentTarget.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisOffsetLeft = tooltipSize.width > containerSize.right - thisSize.right - tooltipPadding ?
				thisSize.left - containerSize.left - thisSize.width - tooltipSize.width - tooltipPadding :
				thisSize.left - containerSize.left + thisSize.width + tooltipPadding;

			tooltipDiv.style("left", thisOffsetLeft + "px")
				.style("top", Math.max((thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top, 0) + "px");

		};

		function mouseoutTooltipCerf() {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			groupCerf.style("opacity", 1);
			labelsCerf.style("opacity", 1);
			barsCerf.style("opacity", 1);

			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisCerf.tickSizeInner(selectedYear.length === 1 ? tickSize : 0);

		xAxisGroupCerf.transition()
			.duration(duration)
			.style("opacity", noCerfValues ? 0 : 1)
			.attr("transform", "translate(0," + (selectedYear.length === 1 ?
				yScaleCerf(0) : yScaleCerf(0) + xGroupExtraPadding) + ")")
			.call(xAxisCerf);

		let secondTick = xAxisGroupCerf.selectAll(".tick")
			.selectAll("." + classPrefix + "secondTick")
			.data([true]);

		secondTick = secondTick.enter()
			.append("line")
			.attr("class", classPrefix + "secondTick")
			.attr("stroke", "currentColor")
			.merge(secondTick)
			.attr("y1", secondTickPadding + xAxisCerf.tickSizeInner())
			.attr("y2", secondTickPadding + xAxisCerf.tickSizeInner() + secondTickSize);

		yAxisGroupCerf.transition()
			.duration(duration)
			.style("opacity", noCerfValues ? 0 : 1)
			.call(yAxisCerf);

		yAxisGroupCerf.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		yAxisGroupCumulativeCerf.transition()
			.duration(duration)
			.style("opacity", noCerfValues ? 0 : 1)
			.call(yAxisCumulativeCerf)
			.selectAll("line")
			.style("stroke-dasharray", d => !d ? "none" : null)
			.style("stroke", d => !d ? "#bbb" : null);

		let legendGroupCerf = svgCerf.selectAll("." + classPrefix + "legendGroupCerf")
			.data(selectedYear[0] === allYears || selectedYear.indexOf(currentYear) > -1 ? [true] : []);

		const legendGroupExitCerf = legendGroupCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendGroupEnterCerf = legendGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroupCerf")
			.attr("transform", "translate(" + (svgPaddingsCerf[3] + xScaleCerf.paddingOuter() * xScaleCerf.step()) + "," + (svgHeightCerf - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnterCerf.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", "url(#" + classPrefix + "patternCerf)");

		legendGroupEnterCerf.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendRectSize / 2)
			.text("Current year");

		legendGroupCerf = legendGroupEnterCerf.merge(legendGroupCerf);

		legendGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1);

		let legendPledgedCerf = svgCerf.selectAll("." + classPrefix + "legendPledgedCerf")
			.data(dataYear.some(e => e[`pledged${separator}cerf`]) || dataMonth.some(e => e[`pledged${separator}cerf`]) ? [true] : []);

		const legendPledgedExitCerf = legendPledgedCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendPledgedEnterCerf = legendPledgedCerf.enter()
			.append("text")
			.attr("class", classPrefix + "legendPledgedCerf")
			.style("opacity", 0)
			.attr("x", legendGroupCerf.size() ? legendPledgedPadding : svgPaddingsCerf[3] + xScaleCerf.paddingOuter() * xScaleCerf.step())
			.attr("y", svgHeightCerf - legendPadding + legendRectSize / 2)
			.classed(classPrefix + "pledgedValue", true)
			.text("(*)");

		legendPledgedEnterCerf.append("tspan")
			.style("fill", "#777")
			.text(": Pledged values");

		legendPledgedCerf = legendPledgedEnterCerf.merge(legendPledgedCerf);

		legendPledgedCerf.transition()
			.duration(duration)
			.attr("x", legendGroupCerf.size() ? legendPledgedPadding : svgPaddingsCerf[3] + xScaleCerf.paddingOuter() * xScaleCerf.step())
			.style("opacity", 1);

		//cumulative chart CERF

		let cumulativeTitleCerf = svgCerf.selectAll("." + classPrefix + "cumulativeTitleCerf")
			.data([true]);

		const cumulativeTitleEnterCerf = cumulativeTitleCerf.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeTitleCerf")
			.attr("x", svgPaddingsCerf[3] + (svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]) / 2)
			.attr("y", yScaleCumulativeCerf(0) + cumulativeTitlePadding)
			.style("opacity", noCerfValues ? 0 : 1)
			.text("Cumulative total");

		cumulativeTitleCerf = cumulativeTitleEnterCerf.merge(cumulativeTitleCerf);

		cumulativeTitleCerf.transition()
			.duration(duration)
			.style("opacity", noCerfValues ? 0 : 1);

		let cumulativeLinesCerf = chartLayerCerf.selectAll("." + classPrefix + "cumulativeLinesCerf")
			.data(dataCumulative);

		const cumulativeLinesExitCerf = cumulativeLinesCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const cumulativeLinesEnterCerf = cumulativeLinesCerf.enter()
			.append("path")
			.attr("class", classPrefix + "cumulativeLinesCerf")
			.style("stroke", colors.cerf)
			.style("fill", "none")
			.style("stroke-width", cumulativeStrokeWidth)
			.attr("d", d => cumulativeLineGeneratorCerf(d.values));

		cumulativeLinesCerf = cumulativeLinesEnterCerf.merge(cumulativeLinesCerf);

		cumulativeLinesCerf.transition()
			.duration(duration)
			.style("stroke", (_, i) => colors.cerfAnalogous[i])
			.attr("d", d => cumulativeLineGeneratorCerf(d.values));

		let cumulativeLabelsCerf = chartLayerCerf.selectAll("." + classPrefix + "cumulativeLabelsCerf")
			.data(dataCumulative.length === 1 ? dataCumulative[0].values : []);

		const cumulativeLabelsExitCerf = cumulativeLabelsCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const cumulativeLabelsEnterCerf = cumulativeLabelsCerf.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeLabelsCerf")
			.attr("x", d => xScaleCerf(d[selectedYear[0] === allYears ? "year" : "month"]) + xScaleCerf.bandwidth() / 2)
			.attr("y", d => yScaleCumulativeCerf(d.total) - cumulativeLabelPadding)
			.text(d => "$" + formatSIFloat(d.total));

		cumulativeLabelsCerf = cumulativeLabelsEnterCerf.merge(cumulativeLabelsCerf);

		cumulativeLabelsCerf.transition()
			.duration(duration)
			.attr("x", d => xScaleCerf(d[selectedYear[0] === allYears ? "year" : "month"]) + xScaleCerf.bandwidth() / 2)
			.attr("y", d => yScaleCumulativeCerf(d.total) - cumulativeLabelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.total);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		//arrows and listeners CERF

		let leftArrowGroupCerf = svgCerf.selectAll("." + classPrefix + "leftArrowGroupCerf")
			.data(selectedYear[0] === allYears ? [true] : []);

		const leftArrowGroupCerfExit = leftArrowGroupCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const leftArrowGroupCerfEnter = leftArrowGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "leftArrowGroupCerf")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (svgPaddingsCerf[3] - arrowPaddingLeft) + "," + (svgHeightCerf * (1 - cumulativeChartHeightPercentage) - arrowCircleRadius / 2) + ")");

		const leftArrowCircleCerf = leftArrowGroupCerfEnter.append("circle")
			.style("fill", d3.color(colors.cerf).darker(0.6))
			.attr("r", arrowCircleRadius);

		const leftArrowChevronCerf = leftArrowGroupCerfEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u2039");

		leftArrowGroupCerf = leftArrowGroupCerfEnter.merge(leftArrowGroupCerf);

		leftArrowGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1);

		let rightArrowGroupCerf = svgCerf.selectAll("." + classPrefix + "rightArrowGroupCerf")
			.data(selectedYear[0] === allYears ? [true] : []);

		const rightArrowGroupCerfExit = rightArrowGroupCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const rightArrowGroupCerfEnter = rightArrowGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "rightArrowGroupCerf")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (svgWidthCerf - svgPaddingsCerf[1] + arrowPaddingLeft) + "," + (svgHeightCerf * (1 - cumulativeChartHeightPercentage) - arrowCircleRadius / 2) + ")");

		const rightArrowCircle = rightArrowGroupCerfEnter.append("circle")
			.style("fill", d3.color(colors.cerf).darker(0.6))
			.attr("r", arrowCircleRadius);

		const rightArrowChevron = rightArrowGroupCerfEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u203a");

		rightArrowGroupCerf = rightArrowGroupCerfEnter.merge(rightArrowGroupCerf);

		rightArrowGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1);

		if (selectedYear[0] === allYears) {
			chartAreaCerf.transition()
				.duration(duration)
				.attr("transform", "translate(" +
					(-(xScaleCerf.range()[1] - maxNumberOfBars * tickStepCerf)) +
					",0)")
				.on("end", checkCurrentTranslate);
		};

		leftArrowGroupCerf.on("click", () => {
			const currentTranslate = parseTransform(chartAreaCerf.attr("transform"))[0];
			chartAreaCerf.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.min(0, (currentTranslate + tickMove * tickStepCerf)) + ",0)")
				.on("end", checkArrows);
		});

		rightArrowGroupCerf.on("click", () => {
			const currentTranslate = parseTransform(chartAreaCerf.attr("transform"))[0];
			chartAreaCerf.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.max(-(xScaleCerf.range()[1] - maxNumberOfBars * tickStepCerf),
					(-(Math.abs(currentTranslate) + tickMove * tickStepCerf))) + ",0)")
				.on("end", checkArrows);
		});

		function checkArrows() {
			const currentTranslate = parseTransform(chartAreaCerf.attr("transform"))[0];

			if (currentTranslate === 0) {
				leftArrowGroupCerf.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupCerf.attr("pointer-events", "none");
			} else {
				leftArrowGroupCerf.select("circle").style("fill", d3.color(colors.cerf).darker(0.6));
				leftArrowGroupCerf.attr("pointer-events", "all");
			};

			if (~~Math.abs(currentTranslate) >= ~~(xScaleCerf.range()[1] - maxNumberOfBars * tickStepCerf)) {
				rightArrowGroupCerf.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupCerf.attr("pointer-events", "none");
			} else {
				rightArrowGroupCerf.select("circle").style("fill", d3.color(colors.cerf).darker(0.6));
				rightArrowGroupCerf.attr("pointer-events", "all");
			};
		};

		function checkCurrentTranslate() {
			const currentTranslate = parseTransform(chartAreaCerf.attr("transform"))[0];
			if (currentTranslate === 0) {
				leftArrowGroupCerf.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupCerf.attr("pointer-events", "none");
			};
			if (~~Math.abs(currentTranslate) >= ~~(xScaleCerf.range()[1] - maxNumberOfBars * tickStepCerf)) {
				rightArrowGroupCerf.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupCerf.attr("pointer-events", "none");
			};
		};

		//end of drawCerf
	};

	function drawCbpf(data) {

		if (selectedYear[0] !== allYears) {
			chartAreaCbpf.transition()
				.duration(duration)
				.attr("transform", "translate(0,0)");
		};

		const xValue = selectedYear[0] === allYears ? "year" : "month";

		const dataYear = selectedYear[0] === allYears ? data : [];

		const dataMonth = selectedYear[0] === allYears ? [] : data;

		if (dataMonth.length) {
			dataMonth.forEach(row => {
				const monthlyData = row.monthValues.reduce((acc, curr) => {
					if (curr.PooledFundId !== lists.cerfPooledFundId) {
						const foundYear = acc.find(e => e.year === +curr.PledgePaidDate.split("-")[1]);
						if (foundYear) {
							foundYear.total += curr.PaidAmt + curr.PledgeAmt;
							foundYear.paid += curr.PaidAmt;
							foundYear.pledged += curr.PledgeAmt;
						} else {
							acc.push({
								year: +curr.PledgePaidDate.split("-")[1],
								total: curr.PaidAmt + curr.PledgeAmt,
								paid: curr.PaidAmt,
								pledged: curr.PledgeAmt
							});
						};
					};
					return acc;
				}, []);
				monthlyData.sort((a, b) => b.year - a.year);
				row.cbpfMonthlyData = monthlyData;
			});
		};

		const dataMonthWithZeros = monthsArray.reduce((acc, curr) => {
			const foundMonth = dataMonth.find(e => e.month === curr);
			if (foundMonth) {
				if (foundMonth.cbpfMonthlyData.length !== selectedYear.length) {
					selectedYear.forEach(year => {
						const foundYear = foundMonth.cbpfMonthlyData.find(f => f.year === year);
						if (!foundYear) {
							foundMonth.cbpfMonthlyData.push({
								year: year,
								total: 0,
								paid: 0,
								pledged: 0
							});
						};
					});
				};
				acc.push(foundMonth);
			} else if (!(selectedYear.length === 1 && selectedYear[0] === currentYear)) {
				const obj = {
					month: curr,
					cbpfMonthlyData: []
				};
				selectedYear.forEach(year => {
					obj.cbpfMonthlyData.push({
						year: year,
						total: 0,
						paid: 0,
						pledged: 0
					});
				});
				acc.push(obj);
			};
			return acc;
		}, []);

		const dataCumulative = selectedYear[0] === allYears ?
			dataYear.reduce((acc, curr, index) => {
				acc[0].values.push({
					year: curr.year,
					total: curr[`${selectedValue}${separator}cbpf`] + (acc[0].values[index - 1] ? acc[0].values[index - 1].total : 0)
				});
				return acc;
			}, [{
				year: allYears,
				values: []
			}]) : dataMonthWithZeros.reduce((acc, curr, index) => {
				curr.cbpfMonthlyData.forEach(d => {
					const foundYear = acc.find(e => e.year === d.year);
					if (foundYear) {
						foundYear.values.push({
							month: curr.month,
							total: d[selectedValue] + (foundYear.values[index - 1] ? foundYear.values[index - 1].total : 0)
						});
					} else {
						acc.push({
							year: d.year,
							values: [{
								month: curr.month,
								total: d[selectedValue]
							}]
						});
					};
				});
				return acc;
			}, []);

		const minxScaleValue = d3.max(data, d => d[`total${separator}cbpf`]) || 1e3;

		const minxScaleInnerValue = d3.max(dataMonth, d => d3.max(d.cbpfMonthlyData, e => e.total)) || 1e3;

		xScaleCbpf.domain(selectedYear[0] === allYears ? yearsArrayCbpf : monthsArray)
			.range([0, (selectedYear[0] === allYears ? yearsArrayCbpf.length : monthsArray.length) * tickStepCbpf]);

		xScaleCbpf.paddingInner(selectedYear[0] === allYears ? 0.5 : 0.2);

		yScaleCbpf.domain([0, (selectedYear[0] === allYears ?
			d3.max(data, d => d[`${selectedValue}${separator}cbpf`]) || minxScaleValue :
			d3.max(dataMonth, d => d3.max(d.cbpfMonthlyData, e => e[selectedValue])) || minxScaleInnerValue)]);

		yScaleCumulativeCbpf.domain([0, (selectedYear[0] === allYears ?
			dataCumulative[0].values[dataCumulative[0].values.length - 1].total || minxScaleValue :
			d3.max(dataCumulative, d => d.values[d.values.length - 1].total) || minxScaleInnerValue)]);

		xScaleCbpfInner.domain(selectedYear[0] === allYears ? [] : selectedYear.slice().sort((a, b) => a - b))
			.range([0, xScaleCbpf.bandwidth()]);

		let chartTitleCbpf = svgCbpf.selectAll("." + classPrefix + "chartTitleCbpf")
			.data([true]);

		const chartTitleEnterCbpf = chartTitleCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitleCbpf")
			.attr("x", svgPaddingsCbpf[3] + (svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]) / 2)
			.attr("y", svgPaddingsCbpf[0] - titlePadding)
			.text("CBPF ")
			.append("tspan")
			.attr("class", classPrefix + "chartTitleSpanCbpf")
			.text("(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		chartTitleCbpf = chartTitleEnterCbpf.merge(chartTitleCbpf);

		chartTitleCbpf.select("tspan")
			.text("(" + selectedValue + " by " + (selectedYear[0] === allYears ? "year" : "month") + ")");

		let barsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "barsCbpf")
			.data(dataYear, d => d.year);

		const barsCbpfExit = barsCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsCbpfEnter = barsCbpf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsCbpf")
			.attr("x", d => xScaleCbpf(d.year))
			.attr("width", xScaleCbpf.bandwidth())
			.attr("y", d => yScaleCbpf(0))
			.attr("height", 0)
			.style("fill", d => selectedYear[0] === allYears && d.year === currentYear ? `url(#${classPrefix}patternCbpf)` : colors.cbpf)
			.attr("stroke", d => selectedYear[0] === allYears && d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => selectedYear[0] === allYears && d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsCbpf = barsCbpfEnter.merge(barsCbpf);

		barsCbpf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
			.attr("height", d => yScaleCbpf(0) - yScaleCbpf(d[`${selectedValue}${separator}cbpf`]));

		let labelsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "labelsCbpf")
			.data(dataYear.filter(e => e[`${selectedValue}${separator}cbpf`]), d => d.year);

		const labelsCbpfExit = labelsCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.style("opacity", 0)
			.remove();

		const labelsCbpfEnter = labelsCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsCbpf")
			.attr("x", d => xScaleCbpf(d.year) + xScaleCbpf.bandwidth() / 2)
			.attr("y", d => d[`pledged${separator}cbpf`] && selectedValue === "total" ? yScaleCbpf(0) - (2 * labelPadding) : yScaleCbpf(0) - labelPadding);

		labelsCbpf = labelsCbpfEnter.merge(labelsCbpf);

		labelsCbpf.transition()
			.duration(duration)
			.attr("y", d => d[`pledged${separator}cbpf`] && selectedValue === "total" ? yScaleCbpf(d[`total${separator}cbpf`]) - (2 * labelPadding) : yScaleCbpf(d[`${selectedValue}${separator}cbpf`]) - labelPadding)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}cbpf`]);
				return !d[`pledged${separator}cbpf`] || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCbpf(d.year) + xScaleCbpf.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d[`pledged${separator}cbpf`])(d[`pledged${separator}cbpf`]) + ")");
			});

		let groupCbpf = chartLayerCbpf.selectAll("." + classPrefix + "groupCbpf")
			.data(dataMonth, d => d.month);

		const groupExitCbpf = groupCbpf.exit()
			.remove();

		const groupEnterCbpf = groupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "groupCbpf")
			.attr("transform", d => "translate(" + xScaleCbpf(d.month) + ",0)");

		groupCbpf = groupEnterCbpf.merge(groupCbpf);

		groupCbpf.attr("transform", d => "translate(" + xScaleCbpf(d.month) + ",0)");

		let barsGroupCbpf = groupCbpf.selectAll("." + classPrefix + "barsGroupCbpf")
			.data(d => d.cbpfMonthlyData, d => d.year);

		const barsGroupExitCbpf = barsGroupCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.attr("height", 0)
			.style("opacity", 0)
			.remove();

		const barsGroupEnterCbpf = barsGroupCbpf.enter()
			.append("rect")
			.attr("class", classPrefix + "barsGroupCbpf")
			.attr("x", d => xScaleCbpfInner(d.year))
			.attr("width", xScaleCbpfInner.bandwidth())
			.attr("y", d => yScaleCbpf(0))
			.attr("height", 0)
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patternCbpf)` : colors.cbpf)
			.attr("stroke", d => d.year === currentYear ? "#aaa" : null)
			.attr("stroke-width", d => d.year === currentYear ? 0.5 : null)
			.style("opacity", 0);

		barsGroupCbpf = barsGroupEnterCbpf.merge(barsGroupCbpf);

		barsGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1)
			.style("fill", (d, i, n) => d.year === currentYear ? `url(#${classPrefix}patternCbpf)` :
				n.length > 1 ? colors.cbpfAnalogous[i] : colors.cbpf)
			.attr("x", d => xScaleCbpfInner(d.year))
			.attr("width", xScaleCbpfInner.bandwidth())
			.attr("y", d => yScaleCbpf(d[selectedValue]))
			.attr("height", d => yScaleCbpf(0) - yScaleCbpf(d[selectedValue]));

		let labelsGroupCbpf = groupCbpf.selectAll("." + classPrefix + "labelsGroupCbpf")
			.data(d => d.cbpfMonthlyData.filter((e, i) => e[selectedValue] && (!i || i === d.cbpfMonthlyData.length - 1)), d => d.year);

		const labelsGroupCbpfExit = labelsGroupCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.style("opacity", 0)
			.remove();

		const labelsGroupCbpfEnter = labelsGroupCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsGroupCbpf")
			.attr("x", d => xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCbpf(0) - (3 * labelPaddingInner) : yScaleCbpf(0) - labelPaddingInner);

		labelsGroupCbpf = labelsGroupCbpfEnter.merge(labelsGroupCbpf);

		labelsGroupCbpf.raise();

		labelsGroupCbpf.transition()
			.duration(duration)
			.attr("x", d => xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
			.attr("y", d => d.pledged && selectedValue === "total" ? yScaleCbpf(d[selectedValue]) - (3 * labelPaddingInner) : yScaleCbpf(d[selectedValue]) - labelPaddingInner)
			.tween("text", (d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedValue]);
				return !d.pledged || selectedValue !== "total" ?
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B")) :
					t => d3.select(n[i]).text(d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B"))
					.append("tspan")
					.attr("dy", "1.1em")
					.classed(classPrefix + "pledgedValue", true)
					.attr("x", xScaleCbpfInner(d.year) + xScaleCbpfInner.bandwidth() / 2)
					.text("(" + d3.formatPrefix(".0", d.pledged)(d.pledged) + ")");
			});

		let xAxisGroupedGroupCbpf = groupCbpf.selectAll("." + classPrefix + "xAxisGroupedGroupCbpf")
			.data([true]);

		xAxisGroupedGroupCbpf = xAxisGroupedGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupedGroupCbpf")
			.attr("transform", "translate(0," + (yScaleCbpf(0)) + ")")
			.merge(xAxisGroupedGroupCbpf)
			.style("opacity", selectedYear.length > 1 ? 1 : 0);

		xAxisGroupedGroupCbpf.transition()
			.duration(duration)
			.call(xAxisGroupedCbpf);

		let tooltipRectCbpf = tooltipRectLayerCbpf.selectAll("." + classPrefix + "tooltipRectCbpf")
			.data(dataYear, d => d.year);

		const tooltipRectCbpfExit = tooltipRectCbpf.exit()
			.remove();

		const tooltipRectCbpfEnter = tooltipRectCbpf.enter()
			.append("rect")
			.style("opacity", 0)
			.attr("pointer-events", "all")
			.attr("class", classPrefix + "tooltipRectCbpf")
			.attr("x", d => xScaleCbpf(d[xValue]))
			.attr("y", svgPaddingsCbpf[0])
			.attr("width", xScaleCbpf.bandwidth())
			.attr("height", (svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCbpf[0] - svgPaddingsCbpf[2]);

		tooltipRectCbpf = tooltipRectCbpfEnter.merge(tooltipRectCbpf);

		tooltipRectCbpf.attr("x", d => xScaleCbpf(d[xValue]))
			.attr("width", xScaleCbpf.bandwidth());

		let tooltipGroupCbpf = chartLayerCbpf.selectAll("." + classPrefix + "tooltipGroupCbpf")
			.data(dataMonth, d => d.month);

		const tooltipGroupExitCbpf = tooltipGroupCbpf.exit()
			.remove();

		const tooltipGroupEnterCbpf = tooltipGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "tooltipGroupCbpf")
			.attr("transform", d => "translate(" + xScaleCbpf(d.month) + ",0)");

		tooltipGroupCbpf = tooltipGroupEnterCbpf.merge(tooltipGroupCbpf);

		tooltipGroupCbpf.attr("transform", d => "translate(" + xScaleCbpf(d.month) + ",0)")
			.each(d => d.cbpfMonthlyData.forEach(e => e.parentData = d));

		let tooltipRectGroupCbpf = tooltipGroupCbpf.selectAll("." + classPrefix + "tooltipRectGroupCbpf")
			.data(d => d.cbpfMonthlyData, d => d.year);

		const tooltipRectGroupExitCbpf = tooltipRectGroupCbpf.exit()
			.remove();

		const tooltipRectGroupEnterCbpf = tooltipRectGroupCbpf.enter()
			.append("rect")
			.attr("class", classPrefix + "tooltipRectGroupCbpf")
			.attr("x", d => xScaleCbpfInner(d.year))
			.attr("width", xScaleCbpfInner.bandwidth())
			.attr("y", svgPaddingsCbpf[0])
			.attr("height", (svgHeightCbpf * (1 - cumulativeChartHeightPercentage)) - svgPaddingsCbpf[0] - svgPaddingsCbpf[2])
			.style("opacity", 0)
			.attr("pointer-events", "all");

		tooltipRectGroupCbpf = tooltipRectGroupEnterCbpf.merge(tooltipRectGroupCbpf);

		tooltipRectGroupCbpf.transition()
			.duration(duration)
			.attr("x", d => xScaleCbpfInner(d.year))
			.attr("width", xScaleCbpfInner.bandwidth());

		tooltipRectCbpf.on("mouseover", (event, d) => mouseoverTooltipCbpf(event, d, "yearTooltip"))
			.on("mouseout", mouseoutTooltipCbpf);

		tooltipRectGroupCbpf.on("mouseover", (event, d) => mouseoverTooltipCbpf(event, d, "monthTooltip"))
			.on("mouseout", mouseoutTooltipCbpf);

		function mouseoverTooltipCbpf(event, d, tooltipType) {

			chartState.currentHoveredElement = event.currentTarget;

			groupCbpf.call(highlightSelection);
			labelsCbpf.call(highlightSelection);
			barsCbpf.call(highlightSelection);

			function highlightSelection(selection) {
				selection.style("opacity", e => d.parentData ? (e.month === d.parentData.month ? 1 : fadeOpacity) :
					e.year === d.year ? 1 : fadeOpacity);
			};

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(tooltipType === "yearTooltip" ? d.year : monthFormatFull(monthAbbrvParse(d.parentData.month)) + " " + d.year);

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			const valuesArray = tooltipType === "yearTooltip" ? d.yearValues : d.parentData.monthValues.filter(e => e.FiscalYear === d.year);

			const totalValues = valuesArray.reduce((acc, curr) => {
				if (curr.PooledFundId !== lists.cerfPooledFundId) {
					acc.total += curr.PaidAmt + curr.PledgeAmt;
					acc.paid += curr.PaidAmt;
					acc.pledged += curr.PledgeAmt;
				};
				return acc;
			}, {
				total: 0,
				paid: 0,
				pledged: 0
			});

			let tooltipData = valuesArray.reduce((acc, curr) => {
				if (curr.PooledFundId !== lists.cerfPooledFundId) {
					const foundDonor = acc.find(e => e.donorId === curr.DonorId);
					if (foundDonor) {
						foundDonor.total += curr.PaidAmt + curr.PledgeAmt;
						foundDonor.paid += curr.PaidAmt;
						foundDonor.pledged += curr.PledgeAmt;
					} else {
						acc.push({
							donorId: curr.DonorId,
							total: curr.PaidAmt + curr.PledgeAmt,
							paid: curr.PaidAmt,
							pledged: curr.PledgeAmt
						});
					};
				};
				return acc;
			}, []);

			tooltipData.sort((a, b) => b[selectedValue] - a[selectedValue]);

			tooltipData = tooltipData.reduce((acc, curr, index) => {
				if (index < maxTooltipDonorNumber) {
					acc.push(curr)
				} else if (index === maxTooltipDonorNumber) {
					curr.donorId = null;
					acc.push(curr);
				} else {
					acc[maxTooltipDonorNumber].total += curr.total;
					acc[maxTooltipDonorNumber].paid += curr.paid;
					acc[maxTooltipDonorNumber].pledged += curr.pledged;
				};
				return acc;
			}, []);

			const rowDivTotal = tooltipContainer.append("div")
				.style("display", "flex")
				.style("align-items", "center")
				.style("margin-bottom", "12px")
				.style("width", "100%");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipYears")
				.html("Total");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipLeader");

			rowDivTotal.append("span")
				.attr("class", classPrefix + "tooltipValues")
				.html("$" + formatMoney0Decimals(totalValues[selectedValue]));

			tooltipData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("img")
					.attr("width", flagSizeTooltip)
					.attr("height", flagSizeTooltip)
					.style("margin-right", "4px")
					.attr("src", row.donorId ? (donorsFlagsData[lists.donorIsoCodesList[row.donorId].toLowerCase()] || blankImg) : blankImg);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(row.donorId ? lists.donorNamesList[row.donorId].substring(0, maxTooltipNameLength) : "Others");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row[selectedValue]));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = event.currentTarget.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisOffsetLeft = tooltipSize.width > containerSize.right - thisSize.right - tooltipPadding ?
				thisSize.left - containerSize.left - thisSize.width - tooltipSize.width - tooltipPadding :
				thisSize.left - containerSize.left + thisSize.width + tooltipPadding;

			tooltipDiv.style("left", thisOffsetLeft + "px")
				.style("top", Math.max((thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top, 0) + "px");

		};

		function mouseoutTooltipCbpf() {
			if (chartState.isSnapshotTooltipVisible) return;
			chartState.currentHoveredElement = null;

			groupCbpf.style("opacity", 1);
			labelsCbpf.style("opacity", 1);
			barsCbpf.style("opacity", 1);

			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisCbpf.tickSizeInner(selectedYear.length === 1 ? 6 : 0);

		xAxisGroupCbpf.transition()
			.duration(duration)
			.attr("transform", "translate(0," + (selectedYear.length === 1 ?
				yScaleCbpf(0) : yScaleCbpf(0) + xGroupExtraPadding) + ")")
			.call(xAxisCbpf);

		let secondTick = xAxisGroupCbpf.selectAll(".tick")
			.selectAll("." + classPrefix + "secondTick")
			.data([true]);

		secondTick = secondTick.enter()
			.append("line")
			.attr("class", classPrefix + "secondTick")
			.attr("stroke", "currentColor")
			.merge(secondTick)
			.attr("y1", secondTickPadding + xAxisCbpf.tickSizeInner())
			.attr("y2", secondTickPadding + xAxisCbpf.tickSizeInner() + secondTickSize);

		yAxisGroupCbpf.transition()
			.duration(duration)
			.call(yAxisCbpf);

		yAxisGroupCbpf.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		yAxisGroupCumulativeCbpf.transition()
			.duration(duration)
			.call(yAxisCumulativeCbpf)
			.selectAll("line")
			.style("stroke-dasharray", d => !d ? "none" : null)
			.style("stroke", d => !d ? "#bbb" : null);

		let legendGroupCbpf = svgCbpf.selectAll("." + classPrefix + "legendGroupCbpf")
			.data(selectedYear[0] === allYears || selectedYear.indexOf(currentYear) > -1 ? [true] : []);

		const legendGroupExitCbpf = legendGroupCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendGroupEnterCbpf = legendGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroupCbpf")
			.attr("transform", "translate(" + (svgPaddingsCbpf[3] + xScaleCbpf.paddingOuter() * xScaleCbpf.step()) + "," + (svgHeightCbpf - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnterCbpf.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", "url(#" + classPrefix + "patternCbpf)");

		legendGroupEnterCbpf.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendRectSize / 2)
			.text("Current year");

		legendGroupCbpf = legendGroupEnterCbpf.merge(legendGroupCbpf);

		legendGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1);

		let legendPledgedCbpf = svgCbpf.selectAll("." + classPrefix + "legendPledgedCbpf")
			.data(dataYear.some(e => e[`pledged${separator}cbpf`]) || dataMonth.some(e => e[`pledged${separator}cbpf`]) ? [true] : []);

		const legendPledgedExitCbpf = legendPledgedCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendPledgedEnterCbpf = legendPledgedCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "legendPledgedCbpf")
			.style("opacity", 0)
			.attr("x", legendGroupCbpf.size() ? legendPledgedPadding : svgPaddingsCbpf[3] + xScaleCbpf.paddingOuter() * xScaleCbpf.step())
			.attr("y", svgHeightCbpf - legendPadding + legendRectSize / 2)
			.classed(classPrefix + "pledgedValue", true)
			.text("(*)");

		legendPledgedEnterCbpf.append("tspan")
			.style("fill", "#777")
			.text(": Pledged values");

		legendPledgedCbpf = legendPledgedEnterCbpf.merge(legendPledgedCbpf);

		legendPledgedCbpf.transition()
			.duration(duration)
			.attr("x", legendGroupCbpf.size() ? legendPledgedPadding : svgPaddingsCbpf[3] + xScaleCbpf.paddingOuter() * xScaleCbpf.step())
			.style("opacity", 1);

		//cumulative chart CBPF

		const cumulativeTitleCbpf = svgCbpf.selectAll("." + classPrefix + "cumulativeTitleCbpf")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeTitleCbpf")
			.attr("x", svgPaddingsCbpf[3] + (svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]) / 2)
			.attr("y", yScaleCumulativeCbpf(0) + cumulativeTitlePadding)
			.text("Cumulative total");

		let cumulativeLinesCbpf = chartLayerCbpf.selectAll("." + classPrefix + "cumulativeLinesCbpf")
			.data(dataCumulative);

		const cumulativeLinesExitCbpf = cumulativeLinesCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const cumulativeLinesEnterCbpf = cumulativeLinesCbpf.enter()
			.append("path")
			.attr("class", classPrefix + "cumulativeLinesCbpf")
			.style("stroke", colors.cbpf)
			.style("fill", "none")
			.style("stroke-width", cumulativeStrokeWidth)
			.attr("d", d => cumulativeLineGeneratorCbpf(d.values));

		cumulativeLinesCbpf = cumulativeLinesEnterCbpf.merge(cumulativeLinesCbpf);

		cumulativeLinesCbpf.transition()
			.duration(duration)
			.style("stroke", (_, i) => colors.cbpfAnalogous[i])
			.attr("d", d => cumulativeLineGeneratorCbpf(d.values));

		let cumulativeLabelsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "cumulativeLabelsCbpf")
			.data(dataCumulative.length === 1 ? dataCumulative[0].values : []);

		const cumulativeLabelsExitCbpf = cumulativeLabelsCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const cumulativeLabelsEnterCbpf = cumulativeLabelsCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "cumulativeLabelsCbpf")
			.attr("x", d => xScaleCbpf(d[selectedYear[0] === allYears ? "year" : "month"]) + xScaleCbpf.bandwidth() / 2)
			.attr("y", d => yScaleCumulativeCbpf(d.total) - cumulativeLabelPadding)
			.text(d => "$" + formatSIFloat(d.total));

		cumulativeLabelsCbpf = cumulativeLabelsEnterCbpf.merge(cumulativeLabelsCbpf);

		cumulativeLabelsCbpf.transition()
			.duration(duration)
			.attr("x", d => xScaleCbpf(d[selectedYear[0] === allYears ? "year" : "month"]) + xScaleCbpf.bandwidth() / 2)
			.attr("y", d => yScaleCumulativeCbpf(d.total) - cumulativeLabelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.total);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		//arrows and listeners CBPF

		let leftArrowGroupCbpf = svgCbpf.selectAll("." + classPrefix + "leftArrowGroupCbpf")
			.data(selectedYear[0] === allYears ? [true] : []);

		const leftArrowGroupCbpfExit = leftArrowGroupCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const leftArrowGroupCbpfEnter = leftArrowGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "leftArrowGroupCbpf")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (svgPaddingsCbpf[3] - arrowPaddingLeft) + "," + (svgHeightCbpf * (1 - cumulativeChartHeightPercentage) - arrowCircleRadius / 2) + ")");

		const leftArrowCircle = leftArrowGroupCbpfEnter.append("circle")
			.style("fill", d3.color(colors.cbpf).darker(0.6))
			.attr("r", arrowCircleRadius);

		const leftArrowChevron = leftArrowGroupCbpfEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u2039");

		leftArrowGroupCbpf = leftArrowGroupCbpfEnter.merge(leftArrowGroupCbpf);

		leftArrowGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1);

		let rightArrowGroupCbpf = svgCbpf.selectAll("." + classPrefix + "rightArrowGroupCbpf")
			.data(selectedYear[0] === allYears ? [true] : []);

		const rightArrowGroupCbpfExit = rightArrowGroupCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const rightArrowGroupCbpfEnter = rightArrowGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "rightArrowGroupCbpf")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (svgWidthCbpf - svgPaddingsCbpf[1] + arrowPaddingLeft) + "," + (svgHeightCbpf * (1 - cumulativeChartHeightPercentage) - arrowCircleRadius / 2) + ")");

		const rightArrowCircle = rightArrowGroupCbpfEnter.append("circle")
			.style("fill", d3.color(colors.cbpf).darker(0.6))
			.attr("r", arrowCircleRadius);

		const rightArrowChevron = rightArrowGroupCbpfEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u203a");

		rightArrowGroupCbpf = rightArrowGroupCbpfEnter.merge(rightArrowGroupCbpf);

		rightArrowGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1);

		if (selectedYear[0] === allYears) {
			chartAreaCbpf.transition()
				.duration(duration)
				.attr("transform", "translate(" +
					(-(xScaleCbpf.range()[1] - maxNumberOfBars * tickStepCbpf)) +
					",0)")
				.on("end", checkCurrentTranslate);
		};

		leftArrowGroupCbpf.on("click", () => {
			const currentTranslate = parseTransform(chartAreaCbpf.attr("transform"))[0];
			chartAreaCbpf.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.min(0, (currentTranslate + tickMove * tickStepCbpf)) + ",0)")
				.on("end", checkArrows);
		});

		rightArrowGroupCbpf.on("click", () => {
			const currentTranslate = parseTransform(chartAreaCbpf.attr("transform"))[0];
			chartAreaCbpf.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.max(-(xScaleCbpf.range()[1] - maxNumberOfBars * tickStepCbpf),
					(-(Math.abs(currentTranslate) + tickMove * tickStepCbpf))) + ",0)")
				.on("end", checkArrows);
		});

		function checkArrows() {
			const currentTranslate = parseTransform(chartAreaCbpf.attr("transform"))[0];

			if (currentTranslate === 0) {
				leftArrowGroupCbpf.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupCbpf.attr("pointer-events", "none");
			} else {
				leftArrowGroupCbpf.select("circle").style("fill", d3.color(colors.cbpf).darker(0.6));
				leftArrowGroupCbpf.attr("pointer-events", "all");
			};

			if (~~Math.abs(currentTranslate) >= ~~(xScaleCbpf.range()[1] - maxNumberOfBars * tickStepCbpf)) {
				rightArrowGroupCbpf.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupCbpf.attr("pointer-events", "none");
			} else {
				rightArrowGroupCbpf.select("circle").style("fill", d3.color(colors.cbpf).darker(0.6));
				rightArrowGroupCbpf.attr("pointer-events", "all");
			};
		};

		function checkCurrentTranslate() {
			const currentTranslate = parseTransform(chartAreaCbpf.attr("transform"))[0];
			if (currentTranslate === 0) {
				leftArrowGroupCbpf.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupCbpf.attr("pointer-events", "none");
			};
			if (~~Math.abs(currentTranslate) >= ~~(xScaleCbpf.range()[1] - maxNumberOfBars * tickStepCbpf)) {
				rightArrowGroupCbpf.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupCbpf.attr("pointer-events", "none");
			};
		};

		//end of drawCbpf
	};

	function createColumnTopValues(originalData) {

		let totalContributions = 0,
			totalPaid = 0,
			totalPledged = 0;

		const numberOfDonors = originalData.length;

		originalData.forEach(row => {
			totalContributions += row[`total${separator}total`];
			totalPaid += row[`paid${separator}total`];
			totalPledged += row[`pledged${separator}total`];
		});

		const updateTransition = d3.transition()
			.duration(duration);

		selections.byCerfCbpfContributionsValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalContributions);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byCerfCbpfPaidValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalPaid);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byCerfCbpfPledgedValue.transition(updateTransition)
			.textTween((_, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalPledged);
				return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
			});

		selections.byCerfCbpfDonorsValue.transition(updateTransition)
			.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfDonors));

		selections.byCerfCbpfDonorsText.html(numberOfDonors > 1 ? "Donors" : "Donor");

		//end of createColumnTopValues
	};

	function createColumnChart(data) {

		data.sort((a, b) => b[`${selectedValue}${separator}total`] - a[`${selectedValue}${separator}total`]);

		const columnData = data.reduce((acc, curr, index) => {
			if (index < topDonors) {
				acc.push({
					donor: curr.donor,
					isoCode: curr.isoCode.toLowerCase(),
					cerf: curr[`${selectedValue}${separator}cerf`],
					cbpf: curr[`${selectedValue}${separator}cbpf`],
					totalValue: curr[`total${separator}cerf`] + curr[`total${separator}cbpf`]
				});
			} else if (index === topDonors) {
				acc.push({
					donor: "Others",
					cerf: curr[`${selectedValue}${separator}cerf`],
					cbpf: curr[`${selectedValue}${separator}cbpf`],
					totalValue: curr[`total${separator}cerf`] + curr[`total${separator}cbpf`]
				});
			} else {
				acc[topDonors].cerf += curr[`${selectedValue}${separator}cerf`];
				acc[topDonors].cbpf += curr[`${selectedValue}${separator}cbpf`];
				acc[topDonors].totalValue += curr[`total${separator}cerf`] + curr[`total${separator}cbpf`];
			};
			return acc;
		}, []);

		yScaleColumn.domain(columnData.map(e => e.donor))
			.range([svgColumnPadding[0],
				Math.min(svgColumnChartHeight - svgColumnPadding[2], maxColumnRectHeight * 2 * (columnData.length + 1))
			]);

		const minxScaleValue = d3.max(columnData, d => d.totalValue);

		xScaleColumn.domain([0, d3.max(columnData, e => e.cbpf + e.cerf) || minxScaleValue]);

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
			.attr("x", d => xScaleColumn(d.cerf + d.cbpf) + labelsColumnPadding)
			.attr("y", d => yScaleColumn(d.donor) + yScaleColumn.bandwidth() / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.cerf + d.cbpf);
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
			.attr("x", svgColumnPadding[3] - flagPadding - flagSize - yAxisColumn.tickSize())
			.attr("y", d => yScaleColumn(d.donor))
			.attr("width", flagSize)
			.attr("height", flagSize)
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
				.attr("dx", flagSize + flagPadding);
			if (sel !== group) group.selectAll(".tick text")
				.filter(d => d.indexOf(" ") > -1)
				.attrTween("x", null)
				.tween("text", null);
		};


		//end of createColumnChart
	};

	function filterData(originalData) {

		const data = [];

		originalData.forEach(row => {

			if (selectedYear.indexOf(allYears) > -1 && row.FiscalYear <= currentYear) {

				const foundYear = data.find(e => e.year === row.FiscalYear);

				if (foundYear) {
					pushCbpfOrCerfContribution(foundYear, row);
					foundYear.yearValues.push(row);
				} else {
					const yearObject = {
						year: row.FiscalYear,
						[`total${separator}total`]: 0,
						[`total${separator}cerf`]: 0,
						[`total${separator}cbpf`]: 0,
						[`paid${separator}total`]: 0,
						[`paid${separator}cerf`]: 0,
						[`paid${separator}cbpf`]: 0,
						[`pledged${separator}total`]: 0,
						[`pledged${separator}cerf`]: 0,
						[`pledged${separator}cbpf`]: 0,
						yearValues: [row]
					};
					pushCbpfOrCerfContribution(yearObject, row);
					data.push(yearObject);
				};

			} else {
				if (selectedYear.indexOf(+row.PledgePaidDate.split("-")[1]) > -1) {

					const foundMonth = data.find(e => e.month === monthFormat(pledgeDateParse(row.PledgePaidDate)));

					if (foundMonth) {
						pushCbpfOrCerfContribution(foundMonth, row);
						foundMonth.monthValues.push(row);
					} else {
						const monthObject = {
							month: monthFormat(pledgeDateParse(row.PledgePaidDate)),
							[`total${separator}total`]: 0,
							[`total${separator}cerf`]: 0,
							[`total${separator}cbpf`]: 0,
							[`paid${separator}total`]: 0,
							[`paid${separator}cerf`]: 0,
							[`paid${separator}cbpf`]: 0,
							[`pledged${separator}total`]: 0,
							[`pledged${separator}cerf`]: 0,
							[`pledged${separator}cbpf`]: 0,
							monthValues: []
						};
						pushCbpfOrCerfContribution(monthObject, row);
						monthObject.monthValues.push(row);
						data.push(monthObject);
					};
				};
			};

		});

		data.sort((a, b) => selectedYear.indexOf(allYears) > -1 ?
			a.year - b.year :
			monthAbbrvParse(a.month) - monthAbbrvParse(b.month));

		return data;

	};

	function filterDataColumn(originalData) {

		const data = [];

		originalData.forEach(row => {
			if (selectedYear.indexOf(allYears) > -1 && row.FiscalYear <= currentYear) {

				const foundDonor = data.find(e => e.donorId === row.DonorId);

				if (foundDonor) {
					pushCbpfOrCerfContribution(foundDonor, row);
				} else {
					const donorObject = {
						donor: lists.donorNamesList[row.DonorId],
						donorId: row.DonorId,
						isoCode: lists.donorIsoCodesList[row.DonorId],
						[`total${separator}total`]: 0,
						[`total${separator}cerf`]: 0,
						[`total${separator}cbpf`]: 0,
						[`paid${separator}total`]: 0,
						[`paid${separator}cerf`]: 0,
						[`paid${separator}cbpf`]: 0,
						[`pledged${separator}total`]: 0,
						[`pledged${separator}cerf`]: 0,
						[`pledged${separator}cbpf`]: 0
					};
					pushCbpfOrCerfContribution(donorObject, row);
					data.push(donorObject);
				};
			} else {
				if (selectedYear.indexOf(row.FiscalYear) > -1) {

					const foundDonor = data.find(e => e.donorId === row.DonorId);

					if (foundDonor) {
						pushCbpfOrCerfContribution(foundDonor, row);
					} else {
						const donorObject = {
							donor: lists.donorNamesList[row.DonorId],
							donorId: row.DonorId,
							isoCode: lists.donorIsoCodesList[row.DonorId],
							[`total${separator}total`]: 0,
							[`total${separator}cerf`]: 0,
							[`total${separator}cbpf`]: 0,
							[`paid${separator}total`]: 0,
							[`paid${separator}cerf`]: 0,
							[`paid${separator}cbpf`]: 0,
							[`pledged${separator}total`]: 0,
							[`pledged${separator}cerf`]: 0,
							[`pledged${separator}cbpf`]: 0
						};
						pushCbpfOrCerfContribution(donorObject, row);
						data.push(donorObject);
					};
				};

			};
		});

		return data;

	};

	function pushCbpfOrCerfContribution(obj, row) {
		if (row.PooledFundId === lists.cerfPooledFundId) {
			obj[`total${separator}cerf`] += row.PaidAmt + row.PledgeAmt;
			obj[`paid${separator}cerf`] += row.PaidAmt;
			obj[`pledged${separator}cerf`] += row.PledgeAmt;
		} else {
			obj[`total${separator}cbpf`] += row.PaidAmt + row.PledgeAmt;
			obj[`paid${separator}cbpf`] += row.PaidAmt;
			obj[`pledged${separator}cbpf`] += row.PledgeAmt;
		};
		obj[`total${separator}total`] += row.PaidAmt + row.PledgeAmt;
		obj[`paid${separator}total`] += row.PaidAmt;
		obj[`pledged${separator}total`] += row.PledgeAmt;
	};

	return draw;

	//end of createContributionsByCerfCbpf
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

function pathTween(newPath, precision, self) {
	return function() {
		var path0 = self,
			path1 = path0.cloneNode(),
			n0 = path0.getTotalLength(),
			n1 = (path1.setAttribute("d", newPath), path1).getTotalLength();

		var distances = [0],
			i = 0,
			dt = precision / Math.max(n0, n1);
		while ((i += dt) < 1) distances.push(i);
		distances.push(1);

		var points = distances.map(function(t) {
			var p0 = path0.getPointAtLength(t * n0),
				p1 = path1.getPointAtLength(t * n1);
			return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
		});

		return function(t) {
			return t < 1 ? "M" + points.map(function(p) {
				return p(t);
			}).join("L") : newPath;
		};
	};
};

function parseTransform(translate) {
	const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttributeNS(null, "transform", translate);
	const matrix = group.transform.baseVal.consolidate().matrix;
	return [matrix.e, matrix.f];
};

export {
	createContributionsByCerfCbpf
};