import { chartState } from "./chartstate.js";

//|constants
const padding = [4, 8, 4, 8],
	paddingCerf = [10, 52, 30, 118],
	paddingCbpf = [10, 52, 30, 118],
	paddingPartnersCerf = [30, 52, 10, 118],
	paddingPartnersCbpf = [30, 52, 10, 118],
	buttonsPanelHeight = 30,
	panelHorizontalPadding = 8,
	panelVerticalPadding = 8,
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	classPrefix = "pfbicpbypartner",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	currentDate = new Date(),
	localVariable = d3.local(),
	unBlue = "#1F69B3",
	currentYear = currentDate.getFullYear(),
	separator = "##",
	duration = 1000,
	darkerValue = 0.2,
	tickSize = 9,
	bandScalePadding = 0.5,
	labelsPadding = 4,
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	barHeight = 40;

let yearsArrayCerf,
	yearsArrayCbpf,
	totalWidth,
	svgWidth = {
		cerf: 0,
		cbpf: 0
	},
	activeTransition = false;

function createCountryProfileByPartner(container, lists, colors, tooltipDiv, cbpfPartnersData) {

	const outerDiv = container.append("div")
		.attr("class", classPrefix + "outerDiv");

	const topDiv = outerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const titleDiv = topDiv.append("div")
		.attr("class", classPrefix + "titleDiv");

	const buttonsOuterDiv = topDiv.append("div")
		.attr("class", classPrefix + "buttonsOuterDiv");

	const buttonsDiv = buttonsOuterDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const title = titleDiv.append("p");

	const chartsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "topRowDiv");

	const yearsButtonsDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "yearsButtonsDiv");

	const barChartsDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "barChartsDiv");

	const barChartsDivCerf = barChartsDiv.append("div")
		.attr("class", classPrefix + "barChartsDivCerf");

	const titleDivCerf = barChartsDivCerf.append("div")
		.attr("class", classPrefix + "titleDivCerf")
		.html("CERF");

	const aggregatedDivCerf = barChartsDivCerf.append("div")
		.attr("class", classPrefix + "aggregatedDivCerf");

	const partnersDivCerf = barChartsDivCerf.append("div")
		.attr("class", classPrefix + "partnersDivCerf");

	const barChartsDivCbpf = barChartsDiv.append("div")
		.attr("class", classPrefix + "barChartsDivCbpf");

	const titleDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "titleDivCbpf")
		.html("CBPF");

	const aggregatedDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "aggregatedDivCbpf");

	const partnersDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "partnersDivCbpf");

	createTopFiguresDiv(topRowDiv, colors, lists);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	createFundButtons(buttonsDiv, colors);

	const yearsButtonsDivSize = yearsButtonsDiv.node().getBoundingClientRect();
	const barChartsDivSize = barChartsDiv.node().getBoundingClientRect();

	totalWidth = barChartsDivSize.width;

	const buttonsSvg = yearsButtonsDiv.append("svg")
		.attr("viewBox", `0 0 ${yearsButtonsDivSize.width} ${buttonsPanelHeight}`)
		.style("background-color", "white");

	const svgAggregatedCerf = aggregatedDivCerf.append("svg")
		.attr("viewBox", `0 0 ${totalWidth/2} 1`)
		.style("background-color", "white");

	const svgAggregatedCbpf = aggregatedDivCbpf.append("svg")
		.attr("viewBox", `0 0 ${totalWidth/2} 1`)
		.style("background-color", "white");

	const buttonsPanel = {
		width: yearsButtonsDivSize.width,
		height: buttonsPanelHeight,
		padding: [0, 0, 0, 14],
		buttonWidth: 52,
		buttonPadding: 4,
		buttonVerticalPadding: 4,
		buttonsMargin: 4,
		arrowPadding: 18,
		get buttonsNumber() {
			return Math.floor((this.width - this.padding[1] - this.padding[3] - 2 * this.arrowPadding) / (this.buttonWidth + this.buttonPadding))
		}
	};

	const xScaleCerf = d3.scaleLinear();

	const xScaleCbpf = d3.scaleLinear();

	const yScaleCerf = d3.scaleBand()
		.padding(bandScalePadding);

	const yScaleCbpf = d3.scaleBand()
		.padding(bandScalePadding);

	const xAxisCerf = d3.axisBottom(xScaleCerf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeOuter(0);

	const xAxisCbpf = d3.axisBottom(xScaleCbpf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeOuter(0);

	const yAxisCerf = d3.axisLeft(yScaleCerf)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(tickSize)
		.tickFormat(d => lists.unAgenciesNamesList[d]);

	const yAxisCbpf = d3.axisLeft(yScaleCbpf)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(tickSize)
		.tickFormat(d => lists.partnersList[d]);

	function draw(originalData, resetYear, firstTime) {

		if (firstTime) {
			yearsArrayCerf = createYearsArray(originalData, "cerf");
			yearsArrayCbpf = createYearsArray(originalData, "cbpf");
		};

		if (resetYear) setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf);

		const data = processData(originalData, lists);

		//is the title necessary???
		// title.html(`${lists.fundNamesList[chartState.selectedCountryProfile]}, ${chartState.selectedYear}`);

		const syncedTransition = d3.transition()
			.duration(duration)
			.on("start", () => activeTransition = true)
			.on("end", () => activeTransition = false);

		if (firstTime) createButtonsPanel(originalData, yearsArrayCerf, yearsArrayCbpf, buttonsSvg, buttonsPanel, tooltipDiv, container, draw);
		drawTopFigures(data.topFigures, topRowDiv, colors, syncedTransition);
		recalculateDivWidth(data, barChartsDivCerf, barChartsDivCbpf, xScaleCerf, xScaleCbpf);
		drawBarChart(cbpfPartnersData, data.cerfData, svgAggregatedCerf, container, paddingCerf, xScaleCerf, yScaleCerf, xAxisCerf, yAxisCerf, lists, colors, "cerf", syncedTransition, tooltipDiv);
		drawBarChart(cbpfPartnersData, data.cbpfData, svgAggregatedCbpf, container, paddingCbpf, xScaleCbpf, yScaleCbpf, xAxisCbpf, yAxisCbpf, lists, colors, "cbpf", syncedTransition, tooltipDiv);

		const fundButtons = buttonsDiv.selectAll("button");

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			buttonsSvg.selectChildren().remove();
			draw(originalData, true, true);
		});

		//end of draw
	};

	return draw;

	//end of createCountryProfileOverview
};

function createButtonsPanel(originalData, yearsArrayCerf, yearsArrayCbpf, svg, buttonsPanel, tooltip, container, draw) {

	const yearsArray = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? [...new Set(yearsArrayCerf.concat(yearsArrayCbpf))].sort((a, b) => a - b) :
		chartState.selectedFund === "cerf" ? yearsArrayCerf : yearsArrayCbpf;

	const clipPath = svg.append("clipPath")
		.attr("id", classPrefix + "clipButtons")
		.append("rect")
		.attr("width", buttonsPanel.buttonsNumber * buttonsPanel.buttonWidth)
		.attr("height", buttonsPanel.height);

	const extraPadding = yearsArray.length > buttonsPanel.buttonsNumber ? buttonsPanel.arrowPadding : -2;

	const clipPathGroup = svg.append("g")
		.attr("class", classPrefix + "ClipPathGroup")
		.attr("transform", "translate(" + (buttonsPanel.padding[3] + extraPadding) + ",0)")
		.attr("clip-path", `url(#${classPrefix}clipButtons)`);

	const buttonsGroup = clipPathGroup.append("g")
		.attr("class", classPrefix + "buttonsGroup")
		.attr("transform", "translate(0,0)")
		.style("cursor", "pointer");

	const buttonsRects = buttonsGroup.selectAll(null)
		.data(yearsArray)
		.enter()
		.append("rect")
		.attr("rx", "2px")
		.attr("ry", "2px")
		.attr("class", classPrefix + "buttonsRects")
		.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonsMargin)
		.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
		.attr("y", buttonsPanel.buttonVerticalPadding)
		.attr("x", (_, i) => i * buttonsPanel.buttonWidth + buttonsPanel.buttonsMargin / 2)
		.style("fill", d => chartState.selectedYear === d ? unBlue : "#eaeaea");

	const buttonsText = buttonsGroup.selectAll(null)
		.data(yearsArray)
		.enter()
		.append("text")
		.attr("text-anchor", "middle")
		.attr("class", classPrefix + "buttonsText")
		.attr("y", buttonsPanel.height / 1.6)
		.attr("x", (_, i) => i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2)
		.style("fill", d => chartState.selectedYear === d ? "white" : "#444")
		.text(d => d);

	const leftArrow = svg.append("g")
		.attr("class", classPrefix + "LeftArrowGroup")
		.style("opacity", 0)
		.attr("pointer-events", "none")
		.style("cursor", "pointer")
		.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

	const leftArrowRect = leftArrow.append("rect")
		.style("fill", "white")
		.attr("width", buttonsPanel.arrowPadding)
		.attr("height", buttonsPanel.height);

	const leftArrowText = leftArrow.append("text")
		.attr("class", classPrefix + "leftArrowText")
		.attr("x", 0)
		.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
		.style("fill", "#666")
		.text("\u25c4");

	const rightArrow = svg.append("g")
		.attr("class", classPrefix + "RightArrowGroup")
		.style("opacity", 0)
		.attr("pointer-events", "none")
		.style("cursor", "pointer")
		.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
			(buttonsPanel.buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

	const rightArrowRect = rightArrow.append("rect")
		.style("fill", "white")
		.attr("width", buttonsPanel.arrowPadding)
		.attr("height", buttonsPanel.height);

	const rightArrowText = rightArrow.append("text")
		.attr("class", classPrefix + "rightArrowText")
		.attr("x", -1)
		.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
		.style("fill", "#666")
		.text("\u25ba");

	buttonsRects.on("mouseover", mouseOverButtonsRects)
		.on("mouseout", mouseOutButtonsRects)
		.on("click", clickButtonsRects);

	if (yearsArray.length > buttonsPanel.buttonsNumber) {

		rightArrow.style("opacity", 1)
			.attr("pointer-events", "all");

		leftArrow.style("opacity", 1)
			.attr("pointer-events", "all");

		repositionButtonsGroup();

		checkCurrentTranslate();

		leftArrow.on("click", () => {
			leftArrow.attr("pointer-events", "none");
			const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
			rightArrow.select("text").style("fill", "#666");
			rightArrow.attr("pointer-events", "all");
			buttonsGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.min(0, (currentTranslate + buttonsPanel.buttonsNumber * buttonsPanel.buttonWidth)) + ",0)")
				.on("end", checkArrows);
		});

		rightArrow.on("click", () => {
			rightArrow.attr("pointer-events", "none");
			const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
			leftArrow.select("text").style("fill", "#666");
			leftArrow.attr("pointer-events", "all");
			buttonsGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.max(-((yearsArray.length - buttonsPanel.buttonsNumber) * buttonsPanel.buttonWidth),
					(-(Math.abs(currentTranslate) + buttonsPanel.buttonsNumber * buttonsPanel.buttonWidth))) + ",0)")
				.on("end", checkArrows);
		});

	};

	function checkArrows() {

		const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

		if (currentTranslate === 0) {
			leftArrow.select("text").style("fill", "#ccc");
			leftArrow.attr("pointer-events", "none");
		} else {
			leftArrow.select("text").style("fill", "#666");
			leftArrow.attr("pointer-events", "all");
		};

		if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsPanel.buttonsNumber) * buttonsPanel.buttonWidth)) {
			rightArrow.select("text").style("fill", "#ccc");
			rightArrow.attr("pointer-events", "none");
		} else {
			rightArrow.select("text").style("fill", "#666");
			rightArrow.attr("pointer-events", "all");
		}

	};

	function checkCurrentTranslate() {

		const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

		if (currentTranslate === 0) {
			leftArrow.select("text").style("fill", "#ccc")
			leftArrow.attr("pointer-events", "none");
		};

		if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsPanel.buttonsNumber) * buttonsPanel.buttonWidth)) {
			rightArrow.select("text").style("fill", "#ccc")
			rightArrow.attr("pointer-events", "none");
		};

	};

	function repositionButtonsGroup() {

		const firstYearIndex = yearsArray.indexOf(chartState.selectedYear) < buttonsPanel.buttonsNumber / 2 ? 0 :
			yearsArray.indexOf(chartState.selectedYear) > yearsArray.length - (buttonsPanel.buttonsNumber / 2) ?
			Math.max(yearsArray.length - buttonsPanel.buttonsNumber, 0) :
			yearsArray.indexOf(yearsArray.indexOf(chartState.selectedYear)) - (buttonsPanel.buttonsNumber / 2);

		buttonsGroup.attr("transform", "translate(" +
			(-(buttonsPanel.buttonWidth * firstYearIndex)) +
			",0)");

	};

	function mouseOverButtonsRects(event, d) {

		d3.select(this).style("fill", unBlue);
		buttonsText.filter(e => e === d)
			.style("fill", "white");

		tooltip.style("display", "block")
			.html(null)

		const innerTooltip = tooltip.append("div")
			.style("max-width", "200px")
			.attr("id", classPrefix + "innerTooltipDiv");

		innerTooltip.html("Click for selecting a year");

		positionTooltip(tooltip, container, event, "bottom")

	};

	function mouseOutButtonsRects(event, d) {
		tooltip.style("display", "none");
		if (chartState.selectedYear === d) return;
		d3.select(this).style("fill", "#eaeaea");
		buttonsText.filter(e => e === d)
			.style("fill", "#444");
	};

	function clickButtonsRects(event, d) {

		if (activeTransition) return;

		tooltip.style("display", "none");

		chartState.selectedYear = d;

		d3.selectAll(`.${classPrefix}buttonsRects`)
			.style("fill", e => chartState.selectedYear === e ? unBlue : "#eaeaea");

		d3.selectAll(`.${classPrefix}buttonsText`)
			.style("fill", e => chartState.selectedYear === e ? "white" : "#444");

		draw(originalData, false, false);

		//end of clickButtonsRects
	};

	//end of createButtonsPanel
};

function drawTopFigures(data, container, colors, syncedTransition) {

	container.select(`.${classPrefix}spanYearValue`)
		.html(`in ${chartState.selectedYear}`);

	container.select(`.${classPrefix}allocationsValue`)
		.transition(syncedTransition)
		.call(applyColors, colors)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.total);
			localVariable.set(n[i], data.total);
			const finalValue = formatSIFloat(data.total);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
			} else {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
			};
		});

	container.select(`.${classPrefix}allocationsUnit`)
		.html(() => {
			const unit = formatSIFloat(data.total).slice(-1);
			return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
		});

	//end of drawTopFigures
};

function createFundButtons(container, colors) {
	const buttons = container.selectAll(null)
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

function createTopFiguresDiv(container, colors, lists) {

	const allocationsDiv = container.append("div")
		.attr("class", classPrefix + "allocationsDiv");

	const descriptionDiv = allocationsDiv.append("div")
		.attr("class", classPrefix + "descriptionDiv");

	descriptionDiv.append("span")
		.html(`Allocated in ${lists.fundNamesList[chartState.selectedCountryProfile]}`)
	descriptionDiv.append("span")
		.attr("class", classPrefix + "spanYearValue")
		.html(`in ${chartState.selectedYear}`);

	const allocationsValuePlusUnit = allocationsDiv.append("div")
		.attr("class", classPrefix + "valuePlusUnit");

	const allocationsValue = allocationsValuePlusUnit.append("span")
		.attr("class", classPrefix + "allocationsValue")
		.html("$0")
		.call(applyColors, colors);

	const allocationsUnit = allocationsValuePlusUnit.append("span")
		.attr("class", classPrefix + "allocationsUnit");

};

function drawBarChart(cbpfPartnersData, data, svg, container, padding, xScale, yScale, xAxis, yAxis, lists, colors, fundType, syncedTransition, tooltip) {

	const trueData = data.length ? [true] : [];

	svg.attr("viewBox", `0 0 ${svgWidth[fundType]} ${padding[0] + padding[2] + (data.length * barHeight)}`)

	const maxValue = d3.max(data, d => d.value);

	xScale.domain([0, maxValue]);

	yScale.domain(data.map(d => d.partner))
		.range([padding[0], padding[0] + (data.length * barHeight)]);

	xAxis.tickSizeInner(-(yScale.range()[1] - yScale.range()[0]));

	let xAxisGroup = svg.selectAll(`.${classPrefix}xAxisGroup${fundType}`)
		.data(trueData);

	xAxisGroup = xAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}xAxisGroup${fundType}`)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.merge(xAxisGroup)
		.transition(syncedTransition)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.call(xAxis);

	let yAxisGroup = svg.selectAll(`.${classPrefix}yAxisGroup${fundType}`)
		.data(trueData);

	yAxisGroup = yAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}yAxisGroup${fundType}`)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.merge(yAxisGroup)
		.transition(syncedTransition)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.call(fundType === "cerf" ? customAxis : yAxis);

	function customAxis(group) {
		const sel = group.selection ? group.selection() : group;
		group.call(yAxis);
		sel.selectAll(".tick text")
			.filter(d => lists.unAgenciesNamesList[d].indexOf(" ") > -1)
			.text(d => lists.unAgenciesNamesList[d])
			.call(wrapTextTwoLines, padding[3] - yAxis.tickPadding())
		if (sel !== group) group.selectAll(".tick text")
			.filter(d => lists.unAgenciesNamesList[d].indexOf(" ") > -1)
			.attrTween("x", null)
			.tween("text", null);
	};

	let bars = svg.selectAll("." + classPrefix + "bars")
		.data(data, d => d.partner);

	const barsExit = bars.exit()
		.transition(syncedTransition)
		.attr("width", 0)
		.attr("x", padding[3])
		.style("opacity", 0)
		.remove();

	const barsEnter = bars.enter()
		.append("rect")
		.attr("class", classPrefix + "bars")
		.attr("height", yScale.bandwidth())
		.attr("width", 0)
		.style("fill", colors[fundType])
		.attr("x", padding[3])
		.attr("y", d => yScale(d.partner));

	bars = barsEnter.merge(bars);

	bars.transition(syncedTransition)
		.attr("height", yScale.bandwidth())
		.attr("y", d => yScale(d.partner))
		.attr("x", padding[3])
		.attr("width", d => xScale(d.value) - padding[3]);

	let labels = svg.selectAll("." + classPrefix + "labels")
		.data(data, d => d.partner);

	const labelsExit = labels.exit()
		.transition(syncedTransition)
		.style("opacity", 0)
		.remove();

	const labelsEnter = labels.enter()
		.append("text")
		.attr("class", classPrefix + "labels")
		.style("opacity", 0)
		.attr("x", padding[3] + labelsPadding)
		.attr("y", d => yScale(d.partner) + yScale.bandwidth() / 2);

	labels = labelsEnter.merge(labels);

	labels.transition(syncedTransition)
		.style("opacity", 1)
		.attr("x", d => xScale(d.value) + labelsPadding)
		.attr("y", d => yScale(d.partner) + yScale.bandwidth() / 2)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.value);
			return t => formatSIFloat(interpolator(t)).replace("G", "B");
		});

	let tooltipBars = svg.selectAll("." + classPrefix + "tooltipBars")
		.data(data, d => d.partner);

	tooltipBars.exit().remove();

	tooltipBars = tooltipBars.enter()
		.append("rect")
		.attr("class", classPrefix + "tooltipBars")
		.attr("height", yScale.bandwidth())
		.attr("x", padding[3])
		.style("cursor", "pointer")
		.style("opacity", 0)
		.merge(tooltipBars)
		.attr("width", xScale(maxValue) - padding[3])
		.attr("y", d => yScale(d.partner));

	if (fundType === "cbpf") {
		tooltipBars.on("mouseover", mouseoverTooltipBars)
			.on("mouseout", () => mouseOut(tooltip))
			.on("click", (_, d) => generatePartnersChart(d, fundType, cbpfPartnersData, lists, colors));
	};

	function mouseoverTooltipBars(event, datum) {

		tooltip.style("display", "block")
			.html(null)

		const innerTooltip = tooltip.append("div")
			.style("max-width", "200px")
			.attr("id", classPrefix + "innerTooltipDiv");

		//here, check for CERF or CBPF
		innerTooltip.html(`Click for generating a chart with all ${lists.partnersList[datum.partner]} partners`);

		positionTooltip(tooltip, container, event, "bottom");
	};

	//end of drawBarChart
};

function generatePartnersChart(datum, fundType, cbpfPartnersData, lists, colors) {

	const padding = fundType === "cerf" ? paddingPartnersCerf : paddingPartnersCbpf;

	const xScale = d3.scaleLinear();
	const yScale = d3.scaleBand()
		.padding(bandScalePadding);

	const xAxis = d3.axisTop(xScale)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeOuter(0);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(tickSize)
		.tickFormat(d => lists.partnersNamesList[d]);

	const data = [];

	cbpfPartnersData.forEach(row => {
		if (chartState.selectedYear === row.AllocationYear &&
			row.PooledFundId === chartState.selectedCountryProfile &&
			lists.fundTypesList[row.FundId] === fundType &&
			row.OrganizatinonId === datum.partner) {
			const foundPartner = data.find(e => e.partner === row.PartnerCode);
			if (foundPartner) {
				foundPartner.value += row.ClusterBudget;
			} else {
				data.push({ partner: row.PartnerCode, value: row.ClusterBudget });
			};
		};
	});

	data.sort((a, b) => b.value - a.value);

	const containerDiv = d3.select(`.${classPrefix}partnersDiv${capitalize(fundType)}`);

	containerDiv.selectChildren().remove();

	containerDiv.append("div")
		.attr("class", classPrefix + "partnersTitleDiv" + capitalize(fundType))
		.html(lists.partnersList[datum.partner] + " Partners");

	//ADD CLOSE BUTTON

	const syncedTransition = d3.transition()
		.duration(duration)
		.on("start", () => activeTransition = true)
		.on("end", () => activeTransition = false);

	const svg = containerDiv.append("svg")
		.attr("width", svgWidth[fundType])
		.attr("height", padding[0] + padding[2] + (data.length * barHeight));

	const maxValue = d3.max(data, d => d.value);

	xScale.domain([0, maxValue])
		.range([padding[3], svgWidth[fundType] - padding[1]]);

	yScale.domain(data.map(d => d.partner))
		.range([padding[0], padding[0] + (data.length * barHeight)]);

	xAxis.tickSizeInner(-(yScale.range()[1] - yScale.range()[0]));

	const xAxisGroup = svg.append("g")
		.attr("class", `${classPrefix}xAxisGroupPartners${fundType}`)
		.attr("transform", "translate(0," + padding[0] + ")")
		.call(xAxis);

	const yAxisGroup = svg.append("g")
		.attr("class", `${classPrefix}yAxisGroupPartners${fundType}`)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.call(yAxis)
		.selectAll(".tick text")
		.call(wrapTextTwoLines, padding[3] - yAxis.tickPadding());

	const bars = svg.selectAll(null)
		.data(data, d => d.partner)
		.enter()
		.append("rect")
		.attr("height", yScale.bandwidth())
		.attr("width", 0)
		.style("fill", d3.color(colors[fundType]).brighter(0.6))
		.attr("x", padding[3])
		.attr("y", d => yScale(d.partner))
		.transition(syncedTransition)
		.attr("height", yScale.bandwidth())
		.attr("y", d => yScale(d.partner))
		.attr("x", padding[3])
		.attr("width", d => xScale(d.value) - padding[3]);

	const labels = svg.selectAll(null)
		.data(data, d => d.partner)
		.enter()
		.append("text")
		.attr("class", classPrefix + "labelsPartners")
		.style("opacity", 0)
		.attr("x", padding[3] + labelsPadding)
		.attr("y", d => yScale(d.partner) + yScale.bandwidth() / 2)
		.transition(syncedTransition)
		.style("opacity", 1)
		.attr("x", d => xScale(d.value) + labelsPadding)
		.attr("y", d => yScale(d.partner) + yScale.bandwidth() / 2)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.value);
			return t => formatSIFloat(interpolator(t)).replace("G", "B");
		});

	//end of generatePartnersChart
};

function mouseOut(tooltip) {
	tooltip.html(null)
		.style("display", "none");
};

function positionTooltip(tooltip, container, event, position) {
	let top, left;

	const containerSize = container.node().getBoundingClientRect(),
		tooltipSize = tooltip.node().getBoundingClientRect(),
		elementSize = event.currentTarget.getBoundingClientRect();

	if (position === "right") {
		top = elementSize.top - containerSize.top + (elementSize.height / 2) - (tooltipSize.height / 2) + "px";
		left = elementSize.right + tooltipHorizontalPadding + tooltipSize.width - containerSize.left > containerSize.width ?
			elementSize.left - tooltipSize.width - containerSize.left - tooltipHorizontalPadding + "px" :
			elementSize.right - containerSize.left + tooltipHorizontalPadding + "px";
	} else if (position === "top") {
		top = Math.max(0, elementSize.top - containerSize.top - tooltipSize.height - tooltipVerticalPadding) + "px";
		left = Math.max(0, Math.min(containerSize.width - tooltipSize.width - tooltipHorizontalPadding,
			elementSize.left - containerSize.left + (elementSize.width / 2) - (tooltipSize.width / 2))) + "px";
	} else if (position === "left") {
		top = elementSize.top - containerSize.top + (elementSize.height / 2) - (tooltipSize.height / 2) + "px";
		left = Math.max(0, elementSize.left - tooltipSize.width - containerSize.left - tooltipHorizontalPadding) + "px";
	} else if (position === "bottom") {
		top = Math.min(containerSize.height - tooltipSize.height - tooltipVerticalPadding, elementSize.top - containerSize.top + elementSize.height + tooltipVerticalPadding) + "px";
		left = Math.max(0, Math.min(containerSize.width - tooltipSize.width - tooltipHorizontalPadding,
			elementSize.left - containerSize.left + (elementSize.width / 2) - (tooltipSize.width / 2))) + "px";
	};

	tooltip.style("top", top)
		.style("left", left);
};

function processData(originalData, lists) {

	const data = {
		topFigures: {
			total: 0
		},
		cbpfData: [],
		cerfData: []
	};

	if (chartState.selectedFund !== "cbpf") originalData.cerf.forEach(row => processRow(row, data.cerfData));
	if (chartState.selectedFund !== "cerf") originalData.cbpf.forEach(row => processRow(row, data.cbpfData));

	function processRow(row, target) {
		if (chartState.selectedYear === row.year) {
			row.values.forEach(innerRow => {
				const foundPartner = target.find(e => e.partner === innerRow.partner);
				if (foundPartner) {
					foundPartner.value += innerRow.value;
				} else {
					target.push({
						partner: innerRow.partner,
						value: innerRow.value
					});
				};
				data.topFigures.total += innerRow.value;
			});
		};
	};

	data.cerfData.sort((a, b) => b.value - a.value);
	data.cbpfData.sort((a, b) => b.value - a.value);

	return data;

	//end of processData
};

function setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf) {
	const years = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? [...new Set(yearsArrayCerf.concat(yearsArrayCbpf))] :
		chartState.selectedFund === "cerf" ? yearsArrayCerf : yearsArrayCbpf;
	let index = years.length;
	while (--index >= 0) {
		const cerfValue = originalData.cerf.find(e => e.year === years[index]);
		const cbpfValue = originalData.cbpf.find(e => e.year === years[index]);
		if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
			if (cerfValue || cbpfValue) {
				chartState.selectedYear = years[index];
				break;
			};
		} else {
			const thisFundValue = chartState.selectedFund === "cerf" ? cerfValue : cbpfValue;
			if (thisFundValue) {
				chartState.selectedYear = years[index];
				break;
			};
		};
	};
};

function recalculateDivWidth(data, barChartsDivCerf, barChartsDivCbpf, xScaleCerf, xScaleCbpf) {
	if (data.cerfData.length && data.cbpfData.length) {
		barChartsDivCerf.style("width", "50%");
		barChartsDivCbpf.style("width", "50%");
		svgWidth.cerf = totalWidth / 2;
		svgWidth.cbpf = totalWidth / 2;
		xScaleCerf.range([paddingCerf[3], (totalWidth / 2) - paddingCerf[1]]);
		xScaleCbpf.range([paddingCbpf[3], (totalWidth / 2) - paddingCbpf[1]]);
	} else if (!data.cbpfData.length) {
		barChartsDivCerf.style("width", "100%");
		barChartsDivCbpf.style("width", "0%");
		svgWidth.cerf = totalWidth;
		svgWidth.cbpf = 0;
		xScaleCerf.range([paddingCerf[3], totalWidth - paddingCerf[1]]);
		xScaleCbpf.range([0, 0]);
	} else if (!data.cerfData.length) {
		barChartsDivCerf.style("width", "0%");
		barChartsDivCbpf.style("width", "100%");
		svgWidth.cerf = 0;
		svgWidth.cbpf = totalWidth;
		xScaleCerf.range([0, 0]);
		xScaleCbpf.range([paddingCbpf[3], totalWidth - paddingCbpf[1]]);
	};
};

function createYearsArray(originalData, fund) {
	return originalData[fund].map(d => d.year);
};

function applyColors(selection, colors) {
	selection.style("color", chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
		colors.total : d3.color(colors[chartState.selectedFund]).darker(darkerValue));
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	const result = d3.formatPrefix("." + digits + "~", value)(value);
	return parseInt(result) === 1000 ? formatSIFloat(--value) : result;
};

function formatSIFloatNoZeroes(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits + "~", value)(value);
};

function parseTransform(translate) {
	const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttributeNS(null, "transform", translate);
	const matrix = group.transform.baseVal.consolidate().matrix;
	return [matrix.e, matrix.f];
};

function wrapTextTwoLines(text, width) {
	text.each(function() {
		let text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = 0.32,
			counter = 0,
			tspan = text.text(null)
			.append("tspan")
			.attr("x", x)
			.attr("y", y)
			.attr("dy", dy + "em");
		while ((word = words.pop()) && counter < 2) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node()
				.getComputedTextLength() > width) {
				counter++;
				line.pop();
				tspan.text(line.join(" ") + (counter < 2 ? "" : "..."));
				line = [word];
				if (counter < 2) {
					tspan = text.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", ++lineNumber * lineHeight + dy + "em")
						.text(word);
					if (counter > 0) d3.select(tspan.node().previousSibling).attr("dy", "-0.3em");
				};
			};
		};
	});
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

export { createCountryProfileByPartner };