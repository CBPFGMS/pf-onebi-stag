import { chartState } from "./chartstate.js";

//|constants
const padding = [4, 8, 4, 8],
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
	chartTitlePadding = 12,
	labelsPadding = 4,
	axisLineHeight = 3,
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	maxBarHeight = 40;

let yearsArrayCerf,
	yearsArrayCbpf,
	chartWidth,
	chartHeight,
	activeTransition = false;

function createCountryProfileByPartner(container, lists, colors, tooltipDiv) {

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

	const barChartsDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "barChartsDiv");

	createTopFiguresDiv(topRowDiv, colors, lists);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	createFundButtons(buttonsDiv, colors);

	const barChartsDivSize = barChartsDiv.node().getBoundingClientRect();
	chartWidth = barChartsDivSize.width;
	chartHeight = barChartsDivSize.height;

	const svg = barChartsDiv.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.style("background-color", "white");

	const buttonsPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "buttonsPanel")
			.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
		width: chartWidth - padding[1] - padding[3],
		height: buttonsPanelHeight,
		padding: [0, 0, 0, 6],
		buttonWidth: 52,
		buttonPadding: 4,
		buttonVerticalPadding: 4,
		buttonsMargin: 4,
		arrowPadding: 18,
		get buttonsNumber() {
			return Math.floor((this.width - this.padding[1] - this.padding[3] - 2 * this.arrowPadding) / (this.buttonWidth + this.buttonPadding))
		}
	};

	const cerfPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "cerfPanel")
			.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
		width: (chartWidth - padding[1] - padding[3] - panelVerticalPadding) / 2,
		height: chartHeight - padding[0] - padding[2] - buttonsPanel.height - panelHorizontalPadding,
		padding: [36, 52, 30, 118]
	};

	const cbpfPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "cbpfPanel")
			.attr("transform", "translate(" + (padding[3] + cerfPanel.width + panelVerticalPadding) + "," +
				(padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
		width: (chartWidth - padding[1] - padding[3] - panelVerticalPadding) / 2,
		height: chartHeight - padding[0] - padding[2] - buttonsPanel.height - panelHorizontalPadding,
		padding: [36, 52, 30, 118]
	};

	const xScaleCerf = d3.scaleLinear()
		.range([cerfPanel.padding[3], cerfPanel.width - cerfPanel.padding[1]]);

	const xScaleCbpf = d3.scaleLinear()
		.range([cbpfPanel.padding[3], cbpfPanel.width - cbpfPanel.padding[1]]);

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

	// buttonsPanel.main.append("rect")
	// 	.attr("width", buttonsPanel.width)
	// 	.attr("height", buttonsPanel.height)
	// 	.style("fill", "gainsboro");

	// cerfPanel.main.append("rect")
	// 	.attr("width", cerfPanel.width)
	// 	.attr("height", cerfPanel.height)
	// 	.style("fill", "green");

	// cbpfPanel.main.append("rect")
	// 	.attr("width", cbpfPanel.width)
	// 	.attr("height", cbpfPanel.height)
	// 	.style("fill", "red");

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

		if (firstTime) createButtonsPanel(originalData, yearsArrayCerf, yearsArrayCbpf, buttonsPanel, tooltipDiv, container, draw);
		drawTopFigures(data.topFigures, topRowDiv, colors, syncedTransition);
		recalculateScales(data, xScaleCerf, xScaleCbpf, cerfPanel, cbpfPanel, buttonsPanel);
		drawBarChart(data.cerfData, cerfPanel, xScaleCerf, yScaleCerf, xAxisCerf, yAxisCerf, lists, colors, "cerf", syncedTransition);
		drawBarChart(data.cbpfData, cbpfPanel, xScaleCbpf, yScaleCbpf, xAxisCbpf, yAxisCbpf, lists, colors, "cbpf", syncedTransition);

		const fundButtons = buttonsDiv.selectAll("button");

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			buttonsPanel.main.selectChildren().remove();
			draw(originalData, true, true);
		});

		//end of draw
	};

	return draw;

	//end of createCountryProfileOverview
};

function createButtonsPanel(originalData, yearsArrayCerf, yearsArrayCbpf, buttonsPanel, tooltip, container, draw) {

	const yearsArray = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
		[...new Set(yearsArrayCerf.concat(yearsArrayCbpf))].sort((a, b) => a - b) :
		chartState.selectedFund === "cerf" ? yearsArrayCerf : yearsArrayCbpf;

	const clipPath = buttonsPanel.main.append("clipPath")
		.attr("id", classPrefix + "clipButtons")
		.append("rect")
		.attr("width", buttonsPanel.buttonsNumber * buttonsPanel.buttonWidth)
		.attr("height", buttonsPanel.height);

	const extraPadding = yearsArray.length > buttonsPanel.buttonsNumber ? buttonsPanel.arrowPadding : -2;

	const clipPathGroup = buttonsPanel.main.append("g")
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

	const leftArrow = buttonsPanel.main.append("g")
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

	const rightArrow = buttonsPanel.main.append("g")
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

function drawBarChart(data, panel, xScale, yScale, xAxis, yAxis, lists, colors, fundType, syncedTransition) {

	const trueData = data.length ? [true] : [];

	const maxValue = d3.max(data, d => d.value);

	xScale.domain([0, maxValue]);

	yScale.domain(data.map(d => d.partner))
		.range([panel.padding[0], Math.min(panel.padding[0] + (data.length * maxBarHeight)), panel.height - panel.padding[2]]);

	xAxis.tickSizeInner(-(yScale.range()[1] - yScale.range()[0]));

	let chartTitle = panel.main.selectAll(`.${classPrefix}chartTitle`)
		.data(trueData);

	chartTitle = chartTitle.enter()
		.append("text")
		.attr("class", classPrefix + "chartTitle")
		.text(fundType.toUpperCase())
		.merge(chartTitle)
		.attr("y", panel.padding[0] - chartTitlePadding)
		.attr("x", panel.width / 2);

	let xAxisGroup = panel.main.selectAll(`.${classPrefix}xAxisGroup${fundType}`)
		.data(trueData);

	xAxisGroup = xAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}xAxisGroup${fundType}`)
		.merge(xAxisGroup)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.call(xAxis);

	let yAxisGroup = panel.main.selectAll(`.${classPrefix}yAxisGroup${fundType}`)
		.data(trueData);

	yAxisGroup = yAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}yAxisGroup${fundType}`)
		.merge(yAxisGroup)
		.attr("transform", "translate(" + panel.padding[3] + ",0)")
		.call(yAxis);

	yAxisGroup.selectAll(".tick text")
		.call(wrapText, panel.padding[3] - yAxis.tickPadding())
		.each((_, i, n) => {
			const numberOfLines = d3.select(n[i]).selectAll("tspan").size();
			const currentValue = +d3.select(n[i]).attr("y");
			d3.select(n[i])
				.selectAll("tspan")
				.attr("y", numberOfLines - 1 ?
					currentValue - (axisLineHeight * (numberOfLines - 1)) : currentValue + axisLineHeight);
		});

	let bars = panel.main.selectAll("." + classPrefix + "bars")
		.data(data, d => d.partner);

	const barsExit = bars.exit()
		.transition(syncedTransition)
		.attr("width", 0)
		.attr("x", panel.padding[3])
		.style("opacity", 0)
		.remove();

	const barsEnter = bars.enter()
		.append("rect")
		.attr("class", classPrefix + "bars")
		.attr("height", yScale.bandwidth())
		.attr("width", 0)
		.style("fill", colors[fundType])
		.attr("x", panel.padding[3])
		.attr("y", d => yScale(d.partner));

	bars = barsEnter.merge(bars);

	bars.transition(syncedTransition)
		.attr("height", yScale.bandwidth())
		.attr("y", d => yScale(d.partner))
		.attr("x", panel.padding[3])
		.attr("width", d => xScale(d.value) - panel.padding[3]);

	let labels = panel.main.selectAll("." + classPrefix + "labels")
		.data(data, d => d.partner);

	const labelsExit = labels.exit()
		.transition(syncedTransition)
		.style("opacity", 0)
		.remove();

	const labelsEnter = labels.enter()
		.append("text")
		.attr("class", classPrefix + "labels")
		.style("opacity", 0)
		.attr("x", panel.padding[3] + labelsPadding)
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

	//end of drawBarChart
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
		top = Math.min(containerSize.height - tooltipSize.height - tooltipVerticalPadding, elementSize.top - containerSize.top + tooltipSize.height + tooltipVerticalPadding) + "px";
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
	const years = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ?
		[...new Set(yearsArrayCerf.concat(yearsArrayCbpf))] :
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

function recalculateScales(data, xScaleCerf, xScaleCbpf, cerfPanel, cbpfPanel, buttonsPanel) {
	if (data.cerfData.length && data.cbpfData.length) {
		cerfPanel.main.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")");
		cerfPanel.width = (chartWidth - padding[1] - padding[3] - panelVerticalPadding) / 2;
		cbpfPanel.main.attr("transform", "translate(" + (padding[3] + cerfPanel.width + panelVerticalPadding) + "," +
			(padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")");
		cbpfPanel.width = (chartWidth - padding[1] - padding[3] - panelVerticalPadding) / 2;
	} else if (!data.cbpfData.length) {
		cerfPanel.main.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")");
		cerfPanel.width = chartWidth - padding[1] - padding[3];
		cbpfPanel.main.attr("transform", "translate(" + (padding[3] + cerfPanel.width + panelVerticalPadding) + "," +
			(padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")");
		cbpfPanel.width = 0;
		cbpfPanel.main.selectChildren().remove();
	} else if (!data.cerfData.length) {
		cerfPanel.main.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")");
		cerfPanel.width = 0;
		cbpfPanel.main.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")");
		cbpfPanel.width = chartWidth - padding[1] - padding[3];
		cerfPanel.main.selectChildren().remove();
	};
	xScaleCerf.range([cerfPanel.padding[3], cerfPanel.width - cerfPanel.padding[1]]);
	xScaleCbpf.range([cbpfPanel.padding[3], cbpfPanel.width - cbpfPanel.padding[1]]);
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

function wrapText(text, width) {
	text.each(function() {
		let text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = 0,
			tspan = text.text(null)
			.append("tspan")
			.attr("x", x)
			.attr("y", y)
			.attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node()
				.getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", ++lineNumber * lineHeight + dy + "em")
					.text(word);
			}
		}
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