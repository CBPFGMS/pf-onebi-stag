//|Contributions By Cerf/Cbpf module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicc",
	currentDate = new Date(),
	svgHeightRatio = 0.75,
	currentYear = currentDate.getFullYear(),
	localVariable = d3.local(),
	allYears = "all",
	svgPaddingsCerf = [38, 24, 80, 68],
	svgPaddingsCbpf = [38, 24, 80, 68],
	svgColumnPadding = [16, 26, 8, 80],
	svgColumnChartWidth = 195,
	maxColumnRectHeight = 16,
	labelsColumnPadding = 2,
	flagSize = 16,
	flagPadding = 2,
	flagUrl = "./assets/img/flags16/",
	duration = 1000,
	labelMargin = 22,
	labelPadding = 8,
	titlePadding = 6,
	precision = 6,
	topDonors = 10,
	tooltipPadding = 12,
	legendPadding = 20,
	legendRectSize = 16,
	legendTextPadding = 4,
	formatMoney0Decimals = d3.format(",.0f"),
	monthFormat = d3.timeFormat("%b"),
	monthFormatFull = d3.timeFormat("%B"),
	monthAbbrvParse = d3.timeParse("%b"),
	monthParse = d3.timeParse("%m"),
	pledgeDateParse = d3.timeParse("%m-%Y"),
	formatSIaxes = d3.format("~s"),
	monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
	separator = "##",
	stackKeys = ["cerf", "cbpf"],
	valueTypes = ["total", "paid", "pledged"];

//|variables
let selectedYear,
	selectedValue,
	yearsArray;

function createContributionsByCerfCbpf(selections, colors, lists) {

	selectedYear = [allYears];
	selectedValue = "total";

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const breadcrumbDiv = outerDiv.append("div")
		.attr("class", classPrefix + "breadcrumbDiv");

	const firstBreadcrumb = breadcrumbDiv.append("div")
		.attr("class", classPrefix + "firstBreadcrumb");

	firstBreadcrumb.append("span")
		.html("contributions");

	const middleBreadcrumb = breadcrumbDiv.append("div")
		.attr("class", classPrefix + "middleBreadcrumb");

	const secondBreadcrumb = breadcrumbDiv.append("div")
		.attr("class", classPrefix + "secondBreadcrumb");

	secondBreadcrumb.append("span")
		.html("by CERF/CBPF");

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

	const svgWidthCerf = cerfContainerDiv.node().getBoundingClientRect().width;
	const svgWidthCbpf = cbpfContainerDiv.node().getBoundingClientRect().width;
	const svgHeightCerf = svgWidthCerf * svgHeightRatio;
	const svgHeightCbpf = svgWidthCbpf * svgHeightRatio;

	const svgCerf = cerfContainerDiv.append("svg")
		.attr("width", svgWidthCerf)
		.attr("height", svgHeightCerf);

	const svgCbpf = cbpfContainerDiv.append("svg")
		.attr("width", svgWidthCbpf)
		.attr("height", svgHeightCbpf);

	const columnChartContainer = selections.byCerfCbpfChartContainer;

	columnChartContainer.html(null);

	const svgColumnChartHeight = columnChartContainer.node().getBoundingClientRect().height;

	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	yearsArray = d3.range(lists.yearsArrayContributions[0], currentYear + 1, 1);

	const xScaleCerf = d3.scaleBand()
		.range([svgPaddingsCerf[3], svgWidthCerf - svgPaddingsCerf[1]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleCbpf = d3.scaleBand()
		.range([svgPaddingsCbpf[3], svgWidthCbpf - svgPaddingsCbpf[1]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScaleCerf = d3.scaleLinear()
		.range([svgHeightCerf - svgPaddingsCerf[2], svgPaddingsCerf[0] + labelMargin]);

	const yScaleCbpf = d3.scaleLinear()
		.range([svgHeightCbpf - svgPaddingsCbpf[2], svgPaddingsCbpf[0] + labelMargin]);

	const xScaleColumn = d3.scaleLinear()
		.range([svgColumnPadding[3], svgColumnChartWidth - svgColumnPadding[1]]);

	const yScaleColumn = d3.scaleBand()
		.range([svgColumnPadding[0], svgColumnChartHeight - svgColumnPadding[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const lineGeneratorCerf = d3.line()
		.y(d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCerf(d.year) : xScaleCerf(d.month)) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGeneratorCbpf = d3.line()
		.y(d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCbpf(d.year) : xScaleCbpf(d.month)) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGeneratorBaseCerf = d3.line()
		.y(() => yScaleCerf(0))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCerf(d.year) : xScaleCerf(d.month)) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const lineGeneratorBaseCbpf = d3.line()
		.y(() => yScaleCbpf(0))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCbpf(d.year) : xScaleCbpf(d.month)) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveMonotoneX);

	const xAxisCerf = d3.axisBottom(xScaleCerf)
		.tickSizeOuter(0);

	const xAxisCbpf = d3.axisBottom(xScaleCbpf)
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

	const xAxisGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "xAxisGroupCerf")
		.attr("transform", "translate(0," + (svgHeightCerf - svgPaddingsCerf[2]) + ")");

	const xAxisGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "xAxisGroupCbpf")
		.attr("transform", "translate(0," + (svgHeightCbpf - svgPaddingsCbpf[2]) + ")");

	const yAxisGroupCerf = svgCerf.append("g")
		.attr("class", classPrefix + "yAxisGroupCerf")
		.attr("transform", "translate(" + svgPaddingsCerf[3] + ",0)");

	const yAxisGroupCbpf = svgCbpf.append("g")
		.attr("class", classPrefix + "yAxisGroupCbpf")
		.attr("transform", "translate(" + svgPaddingsCbpf[3] + ",0)");

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

	const chartLayerCerf = svgCerf.append("g");
	const chartLayerCbpf = svgCbpf.append("g");
	const tooltipRectLayerCerf = svgCerf.append("g");
	const tooltipRectLayerCbpf = svgCbpf.append("g");

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
				if (event.altKey) clickyearButtons(d, true);
				if (localVariable.get(self) !== "clicked") {
					localVariable.set(self, "clicked");
					setTimeout(() => {
						if (localVariable.get(self) === "clicked") {
							clickyearButtons(d, false);
						};
						localVariable.set(self, null);
					}, 250);
				} else {
					clickyearButtons(d, true);
					localVariable.set(self, null);
				};
			});

		function mouseoveryearButtons(_, d) {
			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltip = tooltipDiv.append("div")
				.style("max-width", "180px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html(d === allYears ? "Click to show all years" : "Click for selecting a year. Double-click or ALT + click for selecting a single year.");

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
			if (singleSelection || d === allYears) {
				selectedYear = [d];
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
				};
			};

			if (selectedYear.indexOf(allYears) > -1 && selectedYear.length > 1) {
				selectedYear = selectedYear.filter(d => d !== allYears);
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
		};

		valueButtons.on("click", (event, d) => {
			selectedValue = d;
			valueButtons.classed("active", e => e === selectedValue);
			drawCerf(data);
			drawCbpf(data);
			createColumnTopValues(columnData);
			createColumnChart(columnData);
		});

		//end of draw
	};

	function createYearButtons(container) {

		const yearsData = yearsArray.concat([allYears]);

		const yearsButtons = container.selectAll(null)
			.data(yearsData)
			.enter()
			.append("button")
			.classed("active", d => selectedYear.indexOf(d) > -1)
			.html(d => d === allYears ? capitalize(allYears) : d);

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

		const xValue = selectedYear.indexOf(allYears) > -1 ? "year" : "month";

		const minxScaleValue = d3.max(data, d => d[`total${separator}cerf`]);

		xScaleCerf.domain(selectedYear.indexOf(allYears) > -1 ? yearsArray : monthsArray);

		yScaleCerf.domain([0, d3.max(data, d => d[`${selectedValue}${separator}cerf`]) || minxScaleValue]);

		let chartTitleCerf = svgCerf.selectAll("." + classPrefix + "chartTitleCerf")
			.data([true]);

		const chartTitleEnterCerf = chartTitleCerf.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitleCerf")
			.attr("x", svgPaddingsCerf[3] + (svgWidthCerf - svgPaddingsCerf[1] - svgPaddingsCerf[3]) / 2)
			.attr("y", svgPaddingsCerf[0] - titlePadding)
			.text("CERF ")
			.append("tspan")
			.attr("class", classPrefix + "chartTitleSpanCerf")
			.text("(" + capitalize(selectedValue) + ")");

		chartTitleCerf = chartTitleEnterCerf.merge(chartTitleCerf);

		chartTitleCerf.select("tspan")
			.text("(" + capitalize(selectedValue) + ")");

		let barsCerf = chartLayerCerf.selectAll("." + classPrefix + "barsCerf")
			.data(data, d => d[xValue]);

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
			.attr("x", d => xScaleCerf(d[xValue]))
			.attr("width", xScaleCerf.bandwidth())
			.attr("y", d => yScaleCerf(0))
			.attr("height", 0)
			.style("fill", d => selectedYear.indexOf(allYears) > -1 && d.year === currentYear ? `url(#${classPrefix}patternCerf)` : colors.cerf)
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.style("opacity", 0);

		barsCerf = barsCerfEnter.merge(barsCerf);

		barsCerf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
			.attr("height", d => svgHeightCerf - svgPaddingsCerf[2] - yScaleCerf(d[`${selectedValue}${separator}cerf`]));

		let lineCerf = chartLayerCerf.selectAll("." + classPrefix + "lineCerf")
			.data([data.filter(e => selectedYear.indexOf(allYears) > -1 ? e.year < currentYear : true)]);

		const lineCerfExit = lineCerf.exit()
			.remove();

		const lineCerfEnter = lineCerf.enter()
			.append("path")
			.attr("class", classPrefix + "lineCerf")
			.style("fill", "none")
			.style("stroke-width", "2px")
			.style("opacity", 0.5)
			.style("stroke", "#aaa")
			.attr("d", lineGeneratorBaseCerf);

		lineCerf = lineCerfEnter.merge(lineCerf);

		lineCerf.raise();

		lineCerf.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => pathTween(lineGeneratorCerf(d), precision, n[i])());

		let labelsCerf = chartLayerCerf.selectAll("." + classPrefix + "labelsCerf")
			.data(data.filter(e => e[`${selectedValue}${separator}cerf`]), d => d[xValue]);

		const labelsCerfExit = labelsCerf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCerf(0))
			.style("opacity", 0)
			.remove();

		const labelsCerfEnter = labelsCerf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsCerf")
			.attr("x", d => xScaleCerf(d[xValue]) + xScaleCerf.bandwidth() / 2)
			.attr("y", d => yScaleCerf(0) - labelPadding);

		labelsCerf = labelsCerfEnter.merge(labelsCerf);

		labelsCerf.transition()
			.duration(duration)
			.attr("y", d => yScaleCerf(d[`${selectedValue}${separator}cerf`]) - labelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}cerf`]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let tooltipRectCerf = tooltipRectLayerCerf.selectAll("." + classPrefix + "tooltipRectCerf")
			.data(data, d => d[xValue]);

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
			.attr("height", svgHeightCerf - svgPaddingsCerf[0] - svgPaddingsCerf[2]);

		tooltipRectCerf = tooltipRectCerfEnter.merge(tooltipRectCerf);

		tooltipRectCerf.attr("x", d => xScaleCerf(d[xValue]));

		tooltipRectCerf.on("mouseover", mouseoverTooltipCerf)
			.on("mouseout", mouseoutTooltipCerf);

		function mouseoverTooltipCerf(event, d) {

			if (selectedYear.indexOf(allYears) > -1) return;

			const monthlyData = d.monthValues.reduce((acc, curr) => {
				if (curr.PooledFundId === lists.cerfPooledFundId) {
					const foundYear = acc.find(e => e.year === curr.FiscalYear);
					if (foundYear) {
						foundYear.total += curr.PaidAmt + curr.PledgeAmt;
					} else {
						acc.push({
							year: curr.FiscalYear,
							total: curr.PaidAmt + curr.PledgeAmt
						});
					};
				};
				return acc;
			}, []);

			if (!monthlyData.length) return;

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", "210px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(monthFormatFull(monthAbbrvParse(d.month)));

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			monthlyData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(row.year);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row.total));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisoffsetLeft = (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
				tooltipPadding : (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) > containerSize.width ?
				containerSize.width - tooltipSize.width - tooltipPadding : (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) - containerSize.left;

			tooltipDiv.style("left", thisoffsetLeft + "px")
				.style("top", (thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top + "px");

		};

		function mouseoutTooltipCerf(event, d) {
			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisGroupCerf.transition()
			.duration(duration)
			.call(xAxisCerf);

		yAxisGroupCerf.transition()
			.duration(duration)
			.call(yAxisCerf);

		let legendGroupCerf = svgCerf.selectAll("." + classPrefix + "legendGroupCerf")
			.data(selectedYear.indexOf(allYears) > -1 ? [true] : []);

		const legendGroupExitCerf = legendGroupCerf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendGroupEnterCerf = legendGroupCerf.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroupCerf")
			.attr("transform", "translate(" + svgPaddingsCerf[3] + "," + (svgHeightCerf - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnterCerf.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", "url(#" + classPrefix + "patternCerf)");

		legendGroupEnterCerf.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendPadding / 2)
			.text("Current year");

		legendGroupCerf = legendGroupEnterCerf.merge(legendGroupCerf);

		legendGroupCerf.transition()
			.duration(duration)
			.style("opacity", 1);

		//end of drawCerf
	};

	function drawCbpf(data) {

		const xValue = selectedYear.indexOf(allYears) > -1 ? "year" : "month";

		const minxScaleValue = d3.max(data, d => d[`total${separator}cbpf`]);

		xScaleCbpf.domain(selectedYear.indexOf(allYears) > -1 ? yearsArray : monthsArray);

		yScaleCbpf.domain([0, d3.max(data, d => d[`${selectedValue}${separator}cbpf`]) || minxScaleValue]);

		let chartTitleCbpf = svgCbpf.selectAll("." + classPrefix + "chartTitleCbpf")
			.data([data.filter(e => selectedYear.indexOf(allYears) > -1 ? e.year < currentYear : true)])

		const chartTitleEnterCbpf = chartTitleCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "chartTitleCbpf")
			.attr("x", svgPaddingsCbpf[3] + (svgWidthCbpf - svgPaddingsCbpf[1] - svgPaddingsCbpf[3]) / 2)
			.attr("y", svgPaddingsCbpf[0] - titlePadding)
			.text("CBPF ")
			.append("tspan")
			.attr("class", classPrefix + "chartTitleSpanCbpf")
			.text("(" + capitalize(selectedValue) + ")");

		chartTitleCbpf = chartTitleEnterCbpf.merge(chartTitleCbpf);

		chartTitleCbpf.select("tspan")
			.text("(" + capitalize(selectedValue) + ")");

		let barsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "barsCbpf")
			.data(data, d => d[xValue]);

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
			.attr("x", d => xScaleCbpf(d[xValue]))
			.attr("width", xScaleCbpf.bandwidth())
			.attr("y", d => yScaleCbpf(0))
			.attr("height", 0)
			.style("fill", d => selectedYear.indexOf(allYears) > -1 && d.year === currentYear ? `url(#${classPrefix}patternCbpf)` : colors.cbpf)
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.style("opacity", 0);

		barsCbpf = barsCbpfEnter.merge(barsCbpf);

		barsCbpf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
			.attr("height", d => svgHeightCbpf - svgPaddingsCbpf[2] - yScaleCbpf(d[`${selectedValue}${separator}cbpf`]));

		let lineCbpf = chartLayerCbpf.selectAll("." + classPrefix + "lineCbpf")
			.data([data.filter(e => selectedYear.indexOf(allYears) > -1 ? e.year < currentYear : true)]);

		const lineCbpfExit = lineCbpf.exit()
			.remove();

		const lineCbpfEnter = lineCbpf.enter()
			.append("path")
			.attr("class", classPrefix + "lineCbpf")
			.style("fill", "none")
			.style("stroke-width", "2px")
			.style("opacity", 0.5)
			.style("stroke", "#aaa")
			.attr("d", lineGeneratorBaseCbpf);

		lineCbpf = lineCbpfEnter.merge(lineCbpf);

		lineCbpf.raise();

		lineCbpf.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => pathTween(lineGeneratorCbpf(d), precision, n[i])());

		let labelsCbpf = chartLayerCbpf.selectAll("." + classPrefix + "labelsCbpf")
			.data(data.filter(e => e[`${selectedValue}${separator}cbpf`]), d => d[xValue]);

		const labelsCbpfExit = labelsCbpf.exit()
			.transition()
			.duration(duration)
			.attr("y", yScaleCbpf(0))
			.style("opacity", 0)
			.remove();

		const labelsCbpfEnter = labelsCbpf.enter()
			.append("text")
			.attr("class", classPrefix + "labelsCbpf")
			.attr("x", d => xScaleCbpf(d[xValue]) + xScaleCbpf.bandwidth() / 2)
			.attr("y", d => yScaleCbpf(0) - labelPadding);

		labelsCbpf = labelsCbpfEnter.merge(labelsCbpf);

		labelsCbpf.transition()
			.duration(duration)
			.attr("y", d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]) - labelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[`${selectedValue}${separator}cbpf`]);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let tooltipRectCbpf = tooltipRectLayerCbpf.selectAll("." + classPrefix + "tooltipRectCbpf")
			.data(data, d => d[xValue]);

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
			.attr("height", svgHeightCbpf - svgPaddingsCbpf[0] - svgPaddingsCbpf[2]);

		tooltipRectCbpf = tooltipRectCbpfEnter.merge(tooltipRectCbpf);

		tooltipRectCbpf.attr("x", d => xScaleCbpf(d[xValue]));

		tooltipRectCbpf.on("mouseover", mouseoverTooltipCbpf)
			.on("mouseout", mouseoutTooltipCbpf);

		function mouseoverTooltipCbpf(event, d) {

			if (selectedYear.indexOf(allYears) > -1) return;

			const monthlyData = d.monthValues.reduce((acc, curr) => {
				if (curr.PooledFundId !== lists.cerfPooledFundId) {
					const foundYear = acc.find(e => e.year === curr.FiscalYear);
					if (foundYear) {
						foundYear.total += curr.PaidAmt + curr.PledgeAmt;
					} else {
						acc.push({
							year: curr.FiscalYear,
							total: curr.PaidAmt + curr.PledgeAmt
						});
					};
				};
				return acc;
			}, []);

			if (!monthlyData.length) return;

			tooltipDiv.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDiv.append("div")
				.style("max-width", "210px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "8px")
				.append("strong")
				.html(monthFormatFull(monthAbbrvParse(d.month)));

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("white-space", "pre")
				.style("line-height", 1.4)
				.style("width", "100%");

			monthlyData.forEach(row => {
				const rowDiv = tooltipContainer.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("width", "100%");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipYears")
					.html(row.year);

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipLeader");

				rowDiv.append("span")
					.attr("class", classPrefix + "tooltipValues")
					.html("$" + formatMoney0Decimals(row.total));
			});

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltipDiv.node().getBoundingClientRect();

			const thisoffsetLeft = (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
				tooltipPadding : (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) > containerSize.width ?
				containerSize.width - tooltipSize.width - tooltipPadding : (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) - containerSize.left;

			tooltipDiv.style("left", thisoffsetLeft + "px")
				.style("top", (thisSize.top + thisSize.height / 2 - tooltipSize.height / 2) - containerSize.top + "px");

		};

		function mouseoutTooltipCbpf(event, d) {
			tooltipDiv.html(null)
				.style("display", "none");
		};

		xAxisGroupCbpf.transition()
			.duration(duration)
			.call(xAxisCbpf);

		yAxisGroupCbpf.transition()
			.duration(duration)
			.call(yAxisCbpf);

		let legendGroupCbpf = svgCbpf.selectAll("." + classPrefix + "legendGroupCbpf")
			.data(selectedYear.indexOf(allYears) > -1 ? [true] : []);

		const legendGroupExitCbpf = legendGroupCbpf.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendGroupEnterCbpf = legendGroupCbpf.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroupCbpf")
			.attr("transform", "translate(" + svgPaddingsCbpf[3] + "," + (svgHeightCbpf - legendPadding) + ")")
			.style("opacity", 0);

		legendGroupEnterCbpf.append("rect")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", "url(#" + classPrefix + "patternCbpf)");

		legendGroupEnterCbpf.append("text")
			.attr("x", legendRectSize + legendTextPadding)
			.attr("y", legendPadding / 2)
			.text("Current year");

		legendGroupCbpf = legendGroupEnterCbpf.merge(legendGroupCbpf);

		legendGroupCbpf.transition()
			.duration(duration)
			.style("opacity", 1);

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
			.attr("href", d => flagUrl + d.isoCode + ".png");

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
						[`pledged${separator}cbpf`]: 0
					};
					pushCbpfOrCerfContribution(yearObject, row);
					data.push(yearObject);
				};

			} else {
				if (selectedYear.indexOf(row.FiscalYear) > -1) {

					const foundMonth = data.find(e => e.month === monthFormat(pledgeDateParse(row.PledgeDate)));

					if (foundMonth) {
						pushCbpfOrCerfContribution(foundMonth, row);
						foundMonth.monthValues.push(row);
					} else {
						const monthObject = {
							month: monthFormat(pledgeDateParse(row.PledgeDate)),
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
			if (selectedYear.indexOf(allYears) > -1 && row.FiscalYear < currentYear) {

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
}

export {
	createContributionsByCerfCbpf
};