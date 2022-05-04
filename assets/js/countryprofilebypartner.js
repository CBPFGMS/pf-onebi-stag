import { chartState } from "./chartstate.js";

//|constants
const padding = [4, 8, 4, 8],
	paddingCerf = [10, 52, 30, 118],
	paddingCbpf = [10, 52, 30, 118],
	paddingPartnersCerf = [30, 52, 10, 118],
	paddingPartnersCbpf = [30, 52, 10, 118],
	selectionSvgHeight = 80,
	selectionSvgPadding = [20, 10, 14, 10],
	selectionBarHeight = 14,
	selectionBarPadding = 6,
	selectionBarSpace = 2,
	buttonsPanelHeight = 30,
	panelHorizontalPadding = 8,
	panelVerticalPadding = 8,
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	polylinePadding = 4,
	fadeOpacity = 0.2,
	innerTooltipDivWidth = 290,
	classPrefix = "pfbicpbypartner",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	formatMoney0Decimals = d3.format(",.0f"),
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
	partnerNameWidth = 0.4,
	typeWidth = 0.1,
	barWidth = 1 - partnerNameWidth - typeWidth,
	maxRowWidth = 98,
	partnerRowHeight = 3.2,
	partnerRowMinHeight = 2.4,
	namePadding = 1,
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	partnersShortNames = {
		1: "INGO",
		2: "NNGO",
		3: "UN",
		4: "Other"
	},
	barHeight = 40;

let yearsArrayCerf,
	yearsArrayCbpf,
	totalWidth,
	selectionSvgWidth,
	activeTransition = false;

function createCountryProfileByPartner(container, lists, colors, tooltipDiv) {

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

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

	const headerRowDivCerf = barChartsDivCerf.append("div")
		.attr("class", classPrefix + "headerRowDivCerf");

	const partnersDivCerf = barChartsDivCerf.append("div")
		.attr("class", classPrefix + "partnersDivCerf");

	const barChartsDivCbpf = barChartsDiv.append("div")
		.attr("class", classPrefix + "barChartsDivCbpf");

	const titleDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "titleDivCbpf")
		.html("CBPF");

	const selectionChartDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "selectionChartDivCbpf");

	const headerRowDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "headerRowDivCbpf");

	const partnersDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "partnersDivCbpf");

	createTopFiguresDiv(topRowDiv, colors, lists);
	createHeaderRow(headerRowDivCerf, headerRowDivCbpf);
	createFundButtons(buttonsDiv, colors);

	const yearsButtonsDivSize = yearsButtonsDiv.node().getBoundingClientRect();
	const barChartsDivSize = barChartsDiv.node().getBoundingClientRect();

	totalWidth = barChartsDivSize.width;

	const buttonsSvg = yearsButtonsDiv.append("svg")
		.attr("viewBox", `0 0 ${yearsButtonsDivSize.width} ${buttonsPanelHeight}`)
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

	const xScaleCbpf = d3.scaleLinear();

	const xScaleCbpfLabels = d3.scalePoint()
		.padding(0.5);

	const xAxisCbpf = d3.axisTop(xScaleCbpf)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeOuter(0)
		.tickSizeInner(-(selectionBarHeight + 2 * (selectionBarPadding)));

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
		recalculateDivWidth(data, barChartsDivCerf, barChartsDivCbpf);
		if (chartState.selectedFund !== "cerf") {
			drawSelectionChart(data.cbpfDataAggregated, selectionChartDivCbpf, xScaleCbpf, xScaleCbpfLabels, xAxisCbpf, syncedTransition, colors, tooltipDiv, container, lists);
			reselectLabels(selectionChartDivCbpf);
		};
		drawTable(data.cerfData, null, partnersDivCerf, container, lists, colors, "cerf", syncedTransition, tooltipDiv);
		drawTable(data.cbpfData, null, partnersDivCbpf, container, lists, colors, "cbpf", syncedTransition, tooltipDiv);

		const fundButtons = buttonsDiv.selectAll("button");

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			buttonsSvg.selectChildren().remove();
			draw(originalData, true, true);
		});

		function reselectLabels(container) {
			const labels = container.selectAll(`.${classPrefix}labels`);
			const bars = container.selectAll(`.${classPrefix}bars`);
			const polylines = container.selectAll(`.${classPrefix}polylines`);

			labels.on("click", redraw);
			bars.on("click", redraw);
			polylines.on("click", redraw);

			function redraw(event, d) {
				d.clicked = !d.clicked;
				if (!d.clicked) {
					bars.style("opacity", 1);
					labels.style("opacity", 1);
					polylines.style("opacity", 1);
					drawTable(data.cbpfData, null, partnersDivCbpf, container, lists, colors, "cbpf", null, tooltipDiv);
				} else {
					bars.style("opacity", e => e.partnerType === d.partnerType ? 1 : fadeOpacity);
					labels.style("opacity", e => e.partnerType === d.partnerType ? 1 : fadeOpacity);
					polylines.style("opacity", e => e.partnerType === d.partnerType ? 1 : fadeOpacity);
					drawTable(data.cbpfData, d.partnerType, partnersDivCbpf, container, lists, colors, "cbpf", null, tooltipDiv);
				};
			};
		};

		//end of draw
	};

	return draw;

	//end of createCountryProfileByPartner
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
			.attr("id", classPrefix + "innerTooltipDiv")
			.style("padding", "8px");

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

function createHeaderRow(...containers) {
	containers.forEach(container => {
		container.append("div")
			.attr("class", classPrefix + "headerName")
			.style("flex", `0 ${formatPercent(partnerNameWidth)}`)
			.html("Organization<br>Name");
		container.append("div")
			.attr("class", classPrefix + "headerType")
			.style("flex", `0 ${formatPercent(typeWidth)}`)
			.html("Type");
		container.append("div")
			.attr("class", classPrefix + "headerValue")
			.style("flex", `0 ${formatPercent(barWidth)}`)
			.html("Allocation Amount");
	});
};

function drawSelectionChart(data, container, xScaleCbpf, xScaleCbpfLabels, xAxisCbpf, syncedTransition, colors, tooltip, containerDiv, lists) {

	const selectionChartDivCbpfSize = container.node().getBoundingClientRect();
	selectionSvgWidth = selectionChartDivCbpfSize.width;

	let selectionSvg = container.selectAll(`.${classPrefix}selectionSvg`)
		.data([true]);

	selectionSvg = selectionSvg.enter()
		.append("svg")
		.attr("class", classPrefix + "selectionSvg")
		.merge(selectionSvg)
		.attr("width", selectionSvgWidth)
		.attr("height", selectionSvgHeight)
		.style("background-color", "white");

	const total = d3.sum(data, d => d.value);

	xScaleCbpf.domain([0, total])
		.range([selectionSvgPadding[3], selectionSvgWidth - selectionSvgPadding[1] - (data.length - 1) * selectionBarSpace]);

	xScaleCbpfLabels.domain(data.map(e => e.partnerType))
		.range([selectionSvgPadding[3], selectionSvgWidth - selectionSvgPadding[1] - (data.length - 1) * selectionBarSpace])

	let xAxisCbpfGroup = selectionSvg.selectAll(`.${classPrefix}xAxisGroupcbpf`)
		.data([true]);

	xAxisCbpfGroup = xAxisCbpfGroup.enter()
		.append("g")
		.attr("class", classPrefix + "xAxisGroupcbpf")
		.merge(xAxisCbpfGroup)
		.attr("transform", `translate(0,${selectionSvgPadding[0]})`);

	xAxisCbpfGroup.transition(syncedTransition)
		.call(xAxisCbpf)
		.on("start", (_, i, n) => {
			d3.select(n[i]).selectAll(".tick")
				.filter(e => e === 0)
				.remove();
		});

	let bars = selectionSvg.selectAll(`.${classPrefix}bars`)
		.data(data, d => d.partnerType);

	const barsExit = bars.exit()
		.transition(syncedTransition)
		.style("width", 0)
		.remove();

	const barsEnter = bars.enter()
		.append("rect")
		.attr("class", classPrefix + "bars")
		.style("fill", (_, i, n) => colors.cbpfAnalogous[n.length - (i + 1)])
		.attr("height", selectionBarHeight)
		.attr("width", 0)
		.attr("y", selectionSvgPadding[0] + selectionBarPadding)
		.attr("x", selectionSvgPadding[3])
		.style("cursor", "pointer");

	bars = barsEnter.merge(bars);

	bars.order();

	bars.transition(syncedTransition)
		.style("fill", (_, i, n) => colors.cbpfAnalogous[n.length - (i + 1)])
		.attr("width", d => xScaleCbpf(d.value) - selectionSvgPadding[3])
		.attr("x", (d, i, n) => {
			if (!i) {
				localVariable.set(n[i], d.value);
				return selectionSvgPadding[3];
			} else {
				const previous = localVariable.get(n[i].previousSibling);
				localVariable.set(n[i], previous + d.value);
				return xScaleCbpf(previous) + i * selectionBarSpace;
			};
		});

	let labels = selectionSvg.selectAll(`.${classPrefix}labels`)
		.data(data, d => d.partnerType);

	const labelsExit = labels.exit()
		.transition(syncedTransition)
		.style("opacity", 0)
		.remove();

	const labelsEnter = labels.enter()
		.append("text")
		.attr("class", classPrefix + "labels")
		.attr("y", selectionSvgHeight - selectionSvgPadding[2])
		.attr("x", selectionSvgPadding[3])
		.style("opacity", 0)
		.text(d => partnersShortNames[d.partnerType]);

	labels = labelsEnter.merge(labels);

	labels.transition(syncedTransition)
		.style("opacity", 1)
		.attr("x", d => xScaleCbpfLabels(d.partnerType));

	let polylines = selectionSvg.selectAll(`.${classPrefix}polylines`)
		.data(data, d => d.partnerType);

	const polylinesExit = polylines.exit()
		.transition(syncedTransition)
		.style("opacity", 0)
		.remove();

	const polylinesEnter = polylines.enter()
		.append("polyline")
		.attr("class", classPrefix + "polylines")
		.style("opacity", 0)
		.attr("points", (d, i, n) => {
			let previous = 0;
			if (!i) {
				localVariable.set(n[i], d.value);
			} else {
				previous = localVariable.get(n[i].previousSibling);
				localVariable.set(n[i], previous + d.value);
			};
			return `${xScaleCbpf(previous + d.value/2)},${selectionSvgPadding[0] + polylinePadding + selectionBarPadding + selectionBarHeight} 
			${xScaleCbpf(previous + d.value/2)},${(selectionSvgPadding[0] + polylinePadding + selectionBarPadding + selectionBarHeight)/2 + n.length - i * 3 +(selectionSvgHeight - selectionSvgPadding[2] - polylinePadding)/2} 
			${xScaleCbpfLabels(d.partnerType)},${(selectionSvgPadding[0] + polylinePadding + selectionBarPadding + selectionBarHeight)/2 + n.length - i * 3 +(selectionSvgHeight - selectionSvgPadding[2] - polylinePadding)/2} 
			${xScaleCbpfLabels(d.partnerType)},${selectionSvgHeight - selectionSvgPadding[2] - polylinePadding}`;
		});

	polylines = polylinesEnter.merge(polylines);

	polylines.order();

	polylines.transition(syncedTransition)
		.style("opacity", 1)
		.attr("points", (d, i, n) => {
			let previous = 0;
			if (!i) {
				localVariable.set(n[i], d.value);
			} else {
				previous = localVariable.get(n[i].previousSibling);
				localVariable.set(n[i], previous + d.value);
			};
			return `${xScaleCbpf(previous + d.value/2)},${selectionSvgPadding[0] + polylinePadding + selectionBarPadding + selectionBarHeight} 
			${xScaleCbpf(previous + d.value/2)},${(selectionSvgPadding[0] + polylinePadding + selectionBarPadding + selectionBarHeight)/2 + n.length - i * 3 +(selectionSvgHeight - selectionSvgPadding[2] - polylinePadding)/2} 
			${xScaleCbpfLabels(d.partnerType)},${(selectionSvgPadding[0] + polylinePadding + selectionBarPadding + selectionBarHeight)/2 + n.length - i * 3 +(selectionSvgHeight - selectionSvgPadding[2] - polylinePadding)/2} 
			${xScaleCbpfLabels(d.partnerType)},${selectionSvgHeight - selectionSvgPadding[2] - polylinePadding}`;
		});

	bars.on("mouseover", mouseOverSelection)
		.on("mouseout", () => mouseOut(tooltip));

	labels.on("mouseover", mouseOverSelection)
		.on("mouseout", () => mouseOut(tooltip));

	polylines.on("mouseover", mouseOverSelection)
		.on("mouseout", () => mouseOut(tooltip));

	function mouseOverSelection(event, datum) {
		tooltip.style("display", "block")
			.html(null);

		const innerTooltipDiv = tooltip.append("div")
			.style("max-width", innerTooltipDivWidth + "px")
			.attr("id", classPrefix + "innerTooltipDiv");

		const titleDiv = innerTooltipDiv.append("div")
			.attr("class", classPrefix + "tooltipTitleDiv")
			.style("margin-bottom", "18px");

		titleDiv.append("strong")
			.style("font-size", "16px")
			.html(lists.partnersList[datum.partnerType]);

		const innerDiv = innerTooltipDiv.append("div")
			.style("display", "flex")
			.style("flex-wrap", "wrap")
			.style("white-space", "pre")
			.style("width", "100%");

		const valueDiv = innerDiv.append("div")
			.attr("class", classPrefix + "tooltipValue")
			.style("display", "flex")
			.style("align-items", "center")
			.style("width", "100%")
			.style("margin-bottom", "0.4em");

		valueDiv.append("span")
			.style("font-weight", 500)
			.attr("class", classPrefix + "tooltipKeys")
			.html("Total:");

		valueDiv.append("span")
			.attr("class", classPrefix + "tooltipLeader");

		valueDiv.append("span")
			.attr("class", classPrefix + "tooltipValues")
			.html(formatMoney0Decimals(datum.value));

		innerTooltipDiv.append("div")
			.attr("class", classPrefix + "clickText")
			.html(datum.clicked ? "Click for removing the filter" : "Click for filtering the partners list, showing only " + lists.partnersList[datum.partnerType] + " partners. Click again for removing the filter");


		positionTooltip(tooltip, containerDiv, event, "top");
	};

};

function drawTable(data, partnerType, containerDiv, container, lists, colors, fundType, syncedTransitionOriginal, tooltip) {

	containerDiv.selectChildren().remove();

	const syncedTransition = syncedTransitionOriginal || d3.transition()
		.duration(duration)
		.on("start", () => activeTransition = true)
		.on("end", () => activeTransition = false);

	const namesList = fundType === "cerf" ? lists.unAgenciesNamesList : lists.partnersNamesList;

	const filteredData = !partnerType ? data :
		data.filter(partner => partner.partnerType === partnerType);

	const maxValue = d3.max(filteredData, d => d.value);

	const rowDiv = containerDiv.selectAll(null)
		.data(filteredData, d => d.partner)
		.enter()
		.append("div")
		.attr("class", classPrefix + "rowDiv" + capitalize(fundType))
		.style("background-color", (_, i) => !(i % 2) ? "#fff" : "#eee")
		.style("max-height", partnerRowHeight + "em")
		.style("min-height", partnerRowMinHeight + "em")
		.style("line-height", (partnerRowHeight / 2) + "em");

	const partnerNameDiv = rowDiv.append("div")
		.attr("class", classPrefix + "partnerNameDiv")
		.style("flex", `0 ${formatPercent(partnerNameWidth)}`)
		.html(d => namesList[d.partner]);

	const partnerTypeDiv = rowDiv.append("div")
		.style("flex", `0 ${formatPercent(typeWidth)}`)
		.html(d => partnersShortNames[d.partnerType]);

	const barDivContainer = rowDiv.append("div")
		.attr("class", classPrefix + "barDivContainer")
		.style("flex", `0 ${formatPercent(barWidth)}`);

	const barDiv = barDivContainer.append("div")
		.attr("class", classPrefix + "barDiv")
		.style("width", "0%")
		.style("background-color", colors[fundType]);

	const barLabel = barDivContainer.append("span")
		.attr("class", classPrefix + "barLabel")
		.style("right", "95%");

	rowDiv.select(`.${classPrefix}barDiv`)
		.transition(syncedTransition)
		.style("width", d => (maxRowWidth * d.value / maxValue) + "%");

	rowDiv.select(`.${classPrefix}barLabel`)
		.transition(syncedTransition)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.value);
			return t => d.value ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
		})
		.styleTween("right", (d, i, n) => {
			const containerWidth = n[i].parentNode.getBoundingClientRect().width;
			return () => {
				const textWidth = n[i].getBoundingClientRect().width;
				const barWidth = n[i].previousSibling.getBoundingClientRect().width;
				return textWidth > barWidth ?
					0.99 * containerWidth - barWidth - textWidth + "px" :
					containerWidth - barWidth + "px";
			};
		});

	const thisHeader = d3.select(`.${classPrefix}headerRowDiv${capitalize(fundType)}`);
	const headerName = thisHeader.select(`.${classPrefix}headerName`);
	const headerType = thisHeader.select(`.${classPrefix}headerType`);
	const headerValue = thisHeader.select(`.${classPrefix}headerValue`);

	headerName.on("mouseover", event => mouseOverHeader(event, "name"))
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("name"));

	headerType.on("mouseover", event => mouseOverHeader(event, "type"))
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("type"));

	headerValue.on("mouseover", event => mouseOverHeader(event, "value"))
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("value"));

	function sortRows(sortType) {
		filteredData.sort((a, b) => sortType === "name" ? namesList[a.partner].localeCompare(namesList[b.partner]) :
			sortType === "type" ? partnersShortNames[a.partnerType].localeCompare(partnersShortNames[b.partnerType]) :
			b.value - a.value);
		rowDiv.data(filteredData, d => d.partner)
			.order()
			.each((_, i, n) => d3.select(n[i]).style("background-color", !(i % 2) ? "#fff" : "#eee"));
	};

	function mouseOverHeader(event, iconType) {
		const iconDiv = d3.select(event.currentTarget).append("div")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", iconType !== "value" ? "fas fa-sort-alpha-down" : "fas fa-sort-amount-down");
	};

	function mouseOutHeader(event) {
		d3.select(event.currentTarget)
			.select(`.${classPrefix}iconDiv`)
			.remove();
	};


	//end of drawTable
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
		cbpfDataAggregated: [],
		cerfData: []
	};

	if (chartState.selectedFund !== "cbpf") originalData.cerf.forEach(row => processRow(row, data.cerfData, true));
	if (chartState.selectedFund !== "cerf") {
		originalData.cbpfAggregated.forEach(row => processRow(row, data.cbpfDataAggregated, true));
		originalData.cbpf.forEach(row => processRow(row, data.cbpfData, false))
	};

	function processRow(row, target, addTotal) {
		if (chartState.selectedYear === row.year) {
			row.values.forEach(innerRow => {
				const foundPartner = target.find(e => e.partner === innerRow.partner);
				if (foundPartner) {
					foundPartner.value += innerRow.value;
				} else {
					target.push({
						partner: innerRow.partner,
						partnerType: innerRow.partnerType,
						value: innerRow.value
					});
				};
				if (addTotal) data.topFigures.total += innerRow.value;
			});
		};
	};

	data.cerfData.sort((a, b) => b.value - a.value);
	data.cbpfData.sort((a, b) => b.value - a.value);
	data.cbpfDataAggregated.sort((a, b) => a.value - b.value);

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

function recalculateDivWidth(data, barChartsDivCerf, barChartsDivCbpf) {
	if (data.cerfData.length && data.cbpfData.length) {
		barChartsDivCerf.style("width", "50%").style("display", null);
		barChartsDivCbpf.style("width", "50%").style("display", null);
	} else if (!data.cbpfData.length && data.cerfData.length) {
		barChartsDivCerf.style("width", "100%").style("display", null);
		barChartsDivCbpf.style("width", "0%").style("display", "none");
	} else if (!data.cerfData.length && data.cbpfData.length) {
		barChartsDivCerf.style("width", "0%").style("display", "none");
		barChartsDivCbpf.style("width", "100%").style("display", null);
	} else if (!data.cerfData.length && !data.cbpfData.length) {
		barChartsDivCerf.style("width", "0%").style("display", "none");
		barChartsDivCbpf.style("width", "0%").style("display", "none");
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