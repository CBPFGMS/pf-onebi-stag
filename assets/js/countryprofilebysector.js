import { chartState } from "./chartstate.js";
import { clustersIconsData } from "./clustersiconsdata.js";

//|constants
const padding = [40, 60, 20, 196],
	axisPadding = 16,
	buttonsPanelHeight = 30,
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	classPrefix = "pfbicpbysector",
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
	clusterIconSize = 24,
	clusterIconPadding = 4,
	labelsPadding = 2,
	titlePadding = 10,
	stackKeys = ["total", "cerf", "cbpf"],
	allocationTypes = {
		cbpf: ["1", "2"],
		cerf: ["3", "4"]
	}, //THIS SHOULD NOT BE HARDCODED
	barHeight = 40;

let yearsArrayCerf,
	yearsArrayCbpf,
	svgWidth,
	svgHeight,
	activeTransition = false;

function createCountryProfileBySector(container, lists, colors, tooltipDiv, fundButtons) {

	const outerDiv = container.append("div")
		.attr("class", classPrefix + "outerDiv");

	const topDiv = outerDiv.append("div")
		.attr("class", classPrefix + "topDiv");

	const titleDiv = topDiv.append("div")
		.attr("class", classPrefix + "titleDiv");

	const title = titleDiv.append("p");

	const chartsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

	const topRowDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "topRowDiv");

	const yearsButtonsDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "yearsButtonsDiv");

	const chartDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "chartDiv");

	createTopFiguresDiv(topRowDiv, colors, lists);

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	const yearsButtonsDivSize = yearsButtonsDiv.node().getBoundingClientRect();
	const chartsDivSize = chartsDiv.node().getBoundingClientRect();
	svgWidth = chartsDivSize.width;
	svgHeight = chartsDivSize.height;

	const buttonsSvg = yearsButtonsDiv.append("svg")
		.attr("viewBox", `0 0 ${yearsButtonsDivSize.width} ${buttonsPanelHeight}`)
		.style("background-color", "white");

	const svg = chartsDiv.append("svg")
		.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
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

	const xScale = d3.scaleLinear()
		.range([padding[3], chartsDivSize.width - padding[1]]);

	const yScale = d3.scaleBand()
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.ticks(4)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"))
		.tickSizeOuter(0);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(clusterIconSize + 2 * clusterIconPadding)
		.tickFormat(d => lists.clustersList[d]);

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

		const argumentsObject = {
			data: data.stack,
			svg,
			colors,
			stack,
			xScale,
			yScale,
			xAxis,
			yAxis,
			lists,
			syncedTransition,
			container,
			tooltipDiv
		};

		drawStackedChart(argumentsObject);

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			buttonsSvg.selectChildren().remove();
			draw(originalData, true, true);
		});

		//end of draw
	};

	return draw;

	//end of createCountryProfileBySector
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

function drawStackedChart({
	data,
	svg,
	colors,
	stack,
	yScale,
	xAxis,
	yAxis,
	xScale,
	syncedTransition,
	container,
	lists,
	tooltipDiv
}) {

	const filteredData = data.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

	const maxHeight = Math.min(svgHeight, padding[0] + padding[2] + (data.length * barHeight));

	//TRANSITION HERE???
	svg.attr("viewBox", `0 0 ${svgWidth} ${maxHeight}`);

	const maxValue = d3.max(data, d => chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf);

	xScale.domain([0, maxValue]);

	yScale.domain(filteredData.map(d => d.sector))
		.range([padding[0], maxHeight - padding[2]]);

	xAxis.tickSizeInner(-(yScale.range()[1] - yScale.range()[0]));

	let title = svg.selectAll(`.${classPrefix}title`)
		.data([true]);

	title = title.enter()
		.append("text")
		.attr("class", classPrefix + "title")
		.attr("x", svgWidth / 2)
		.attr("y", padding[0] - titlePadding)
		.text("Allocations by Sector")
		.merge(title);

	let xAxisGroup = svg.selectAll(`.${classPrefix}xAxisGroup`)
		.data([true]);

	xAxisGroup = xAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}xAxisGroup`)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.merge(xAxisGroup)
		.transition(syncedTransition)
		.attr("transform", "translate(0," + yScale.range()[1] + ")")
		.call(xAxis)
		.on("start", (_, i, n) => {
			d3.select(n[i]).selectAll(".tick")
				.filter(e => e === 0)
				.remove();
		});

	let yAxisGroup = svg.selectAll(`.${classPrefix}yAxisGroup`)
		.data([true]);

	yAxisGroup = yAxisGroup.enter()
		.append("g")
		.attr("class", `${classPrefix}yAxisGroup`)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.merge(yAxisGroup)
		.transition(syncedTransition)
		.attr("transform", "translate(" + padding[3] + ",0)")
		.call(customAxis);

	const stackedData = stack(filteredData);

	let barsGroups = svg.selectAll("." + classPrefix + "barsGroups")
		.data(stackedData, d => d.key);

	const barsGroupsExit = barsGroups.exit().remove();

	const barsGroupsEnter = barsGroups.enter()
		.append("g")
		.attr("class", classPrefix + "barsGroups")
		.attr("pointer-events", "none");

	barsGroups = barsGroupsEnter.merge(barsGroups);

	let bars = barsGroups.selectAll("." + classPrefix + "bars")
		.data(d => d, d => d.data.sector);

	const barsExit = bars.exit()
		.transition()
		.duration(duration)
		.attr("width", 0)
		.attr("x", padding[3])
		.style("opacity", 0)
		.remove();

	const barsEnter = bars.enter()
		.append("rect")
		.attr("class", classPrefix + "bars")
		.attr("height", yScale.bandwidth())
		.attr("width", 0)
		.style("fill", (d, i, n) => {
			const thisKey = d3.select(n[i].parentNode).datum().key;
			return colors[thisKey]
		})
		.attr("x", xScale(0))
		.attr("y", d => yScale(d.data.sector))

	bars = barsEnter.merge(bars);

	bars.transition()
		.duration(duration)
		.attr("height", yScale.bandwidth())
		.attr("y", d => yScale(d.data.sector))
		.attr("x", d => d[0] === d[1] ? xScale(0) : xScale(d[0]))
		.attr("width", d => xScale(d[1]) - xScale(d[0]));

	let labels = svg.selectAll("." + classPrefix + "labelsBySector")
		.data(filteredData, d => d.sector);

	const labelsExit = labels.exit()
		.transition()
		.duration(duration)
		.style("opacity", 0)
		.attr("x", padding[3] + labelsPadding)
		.remove();

	const labelsEnter = labels.enter()
		.append("text")
		.attr("class", classPrefix + "labelsBySector")
		.style("opacity", 0)
		.attr("x", padding[3] + labelsPadding)
		.attr("y", d => yScale(d.sector) + yScale.bandwidth() / 2);

	labels = labelsEnter.merge(labels);

	labels.transition()
		.duration(duration)
		.style("opacity", 1)
		.attr("x", d => xScale(chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]) + labelsPadding)
		.attr("y", d => yScale(d.sector) + yScale.bandwidth() / 2)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);
			return t => formatSIFloat(interpolator(t)).replace("G", "B");
		});

	let clusterIcons = svg.selectAll("." + classPrefix + "clusterIcons")
		.data(filteredData, d => d.sector);

	const clusterIconsExit = clusterIcons.exit()
		.transition()
		.duration(duration)
		.style("opacity", 0)
		.remove();

	const clusterIconsEnter = clusterIcons.enter()
		.append("image")
		.attr("class", classPrefix + "clusterIcons")
		.style("opacity", 0)
		.attr("x", padding[3] - clusterIconPadding - clusterIconSize - yAxis.tickSize())
		.attr("y", d => yScale(d.sector) - (clusterIconSize - yScale.bandwidth()) / 2)
		.attr("width", clusterIconSize)
		.attr("height", clusterIconSize)
		.attr("href", d => clustersIconsData[d.sector]);

	clusterIcons = clusterIconsEnter.merge(clusterIcons);

	clusterIcons.transition()
		.duration(duration)
		.style("opacity", 1)
		.attr("y", d => yScale(d.sector) - (clusterIconSize - yScale.bandwidth()) / 2);

	let barsTooltipRectangles = svg.selectAll("." + classPrefix + "barsTooltipRectangles")
		.data(filteredData, d => d.sector);

	const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

	const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
		.append("rect")
		.attr("class", classPrefix + "barsTooltipRectangles")
		.attr("pointer-events", "all")
		.style("cursor", "pointer")
		.style("opacity", 0)
		.attr("x", 0)
		.attr("width", svgWidth)
		.attr("height", yScale.step())
		.attr("y", d => yScale(d.sector) - yScale.bandwidth() / 2);

	barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

	barsTooltipRectangles.transition()
		.duration(duration)
		.attr("y", d => yScale(d.sector) - yScale.bandwidth() / 2);

	function customAxis(group) {
		const sel = group.selection ? group.selection() : group;
		group.call(yAxis);
		sel.selectAll(".tick text")
			.filter(d => lists.clustersList[d].indexOf(" ") > -1)
			.text(d => lists.clustersList[d])
			.call(wrapTextTwoLines, padding[3] - yAxis.tickPadding() - axisPadding)
		if (sel !== group) group.selectAll(".tick text")
			.filter(d => lists.clustersList[d].indexOf(" ") > -1)
			.attrTween("x", null)
			.tween("text", null);
	};

	//end of drawStackedChart
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
		stack: []
	};

	originalData.forEach(row => {
		if (chartState.selectedYear === row.year) {
			if (chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf") {
				data.topFigures.total += row.total;
			} else {
				data.topFigures.total += row[chartState.selectedFund];
			};
			const copiedRow = Object.assign({}, row);
			copiedRow.total = chartState.selectedFund === "total" ? copiedRow.total : 0;
			copiedRow.cerf = chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? copiedRow.cerf : 0;
			copiedRow.cbpf = chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? copiedRow.cbpf : 0;
			data.stack.push(copiedRow);
		};
	});

	data.stack.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ?
		(b.cerf + b.cbpf) - (a.cerf + a.cbpf) :
		b[chartState.selectedFund] - a[chartState.selectedFund]);

	return data;

	//end of processData
};

function setDefaultYear(originalData, yearsArrayCerf, yearsArrayCbpf) {
	const years = chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? [...new Set(yearsArrayCerf.concat(yearsArrayCbpf))] :
		chartState.selectedFund === "cerf" ? yearsArrayCerf : yearsArrayCbpf;
	let index = years.length;
	const dataCerf = originalData.filter(e => e.cerf);
	const dataCbpf = originalData.filter(e => e.cbpf);
	while (--index >= 0) {
		const cerfValue = dataCerf.find(e => e.year === years[index]);
		const cbpfValue = dataCbpf.find(e => e.year === years[index]);
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

function createYearsArray(originalData, fund) {
	const years = originalData.reduce((acc, curr) => {
		if (curr[fund] && !acc.includes(curr.year)) acc.push(curr.year);
		return acc;
	}, []);
	years.sort((a, b) => a - b);
	return years;
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
	if (parseInt(result) === 1000) {
		const lastDigit = result[result.length - 1];
		const units = { k: "M", M: "B" };
		return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
	};
	return result;
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

export { createCountryProfileBySector };