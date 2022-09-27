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
	polylinePadding = 4,
	fadeOpacity = 0.2,
	innerTooltipDivWidth = 290,
	classPrefix = "pfbicpbypartner",
	formatPercent = d3.format(".0%"),
	formatPercent1Decimal = d3.format(".1%"),
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
	sortedRow = "value",
	activeTransition = false;

function createCountryProfileByPartner(container, lists, colors, tooltipDiv, fundButtons) {

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

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

	const selectionChartDivTitle = selectionChartDivCbpf.append("div")
		.attr("class", classPrefix + "selectionChartDivTitle");

	const selectionChartDivContent = selectionChartDivCbpf.append("div")
		.attr("class", classPrefix + "selectionChartDivContent");

	const headerRowDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "headerRowDivCbpf");

	const partnersDivCbpf = barChartsDivCbpf.append("div")
		.attr("class", classPrefix + "partnersDivCbpf");

	createTopFiguresDiv(topRowDiv, colors, lists);
	createHeaderRow(headerRowDivCerf, headerRowDivCbpf);

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
			drawSelectionChart(data.cbpfDataAggregated, selectionChartDivCbpf, syncedTransition, colors, tooltipDiv, container, lists);
			reselectCards(selectionChartDivCbpf);
		};
		drawTable(data.cerfData, null, partnersDivCerf, container, lists, colors, "cerf", syncedTransition, tooltipDiv);
		drawTable(data.cbpfData, null, partnersDivCbpf, container, lists, colors, "cbpf", syncedTransition, tooltipDiv);

		fundButtons.on("click", (event, d) => {
			chartState.selectedFund = d;
			fundButtons.classed("active", e => e === chartState.selectedFund);
			buttonsSvg.selectChildren().remove();
			draw(originalData, true, true);
		});

		function reselectCards(container) {
			const cards = container.selectAll(`.${classPrefix}partnersCard`);
			const title = container.select(`.${classPrefix}selectionChartDivTitle`);

			cards.style("background-color", null)
				.each(d => d.click = false);

			cards.selectAll("div")
				.style("color", null);

			cards.on("click", redraw);

			function redraw(event, d) {
				d.clicked = !d.clicked;

				tooltipDiv.style("display", "none")
					.html(null);

				if (!d.clicked) {
					cards.style("background-color", null);
					cards.selectAll("div")
						.style("color", null);
					title.html("Click for filtering by partner type:");
					drawTable(data.cbpfData, null, partnersDivCbpf, container, lists, colors, "cbpf", null, tooltipDiv);
				} else {
					cards.style("background-color", e => e.partnerType === d.partnerType ? unBlue : null)
						.each((d, i, n) => d.clicked = n[i] === event.currentTarget);
					cards.selectAll("div")
						.style("color", e => e.partnerType === d.partnerType ? "white" : null);
					title.html("Click the selected partner for removing the filter:");
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
			.datum({ type: "name" })
			.html("Organization<br>Name")
			.append("div")
			.style("display", "none")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", "fas fa-sort-alpha-down");
		container.append("div")
			.attr("class", classPrefix + "headerType")
			.style("flex", `0 ${formatPercent(typeWidth)}`)
			.datum({ type: "type" })
			.html("Type")
			.append("div")
			.style("display", "none")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", "fas fa-sort-alpha-down");
		container.append("div")
			.attr("class", classPrefix + "headerValue")
			.style("flex", `0 ${formatPercent(barWidth)}`)
			.datum({ type: "value" })
			.html("Allocation Amount")
			.append("div")
			.style("display", "none")
			.attr("class", classPrefix + "iconDiv")
			.append("i")
			.attr("class", "fas fa-sort-amount-down")
	});
};

function drawSelectionChart(data, container, syncedTransition, colors, tooltip, containerDiv, lists) {

	const total = d3.sum(data, d => d.value);
	const maxValue = d3.max(data, d => d.value);

	const titleDiv = container.select(`.${classPrefix}selectionChartDivTitle`);

	titleDiv.html("Click for filtering by partner type:");

	const cardContainer = container.select(`.${classPrefix}selectionChartDivContent`);

	let partnersCard = cardContainer.selectAll(`.${classPrefix}partnersCard`)
		.data(data, d => d.partnerType);

	const partnersCardExit = partnersCard.exit()
		.remove();

	const partnersCardEnter = partnersCard.enter()
		.append("div")
		.attr("class", classPrefix + "partnersCard");

	const partnersCardNameDiv = partnersCardEnter.append("div")
		.attr("class", classPrefix + "partnersCardNameDiv");

	const partnersCardValueDiv = partnersCardEnter.append("div")
		.attr("class", classPrefix + "partnersCardValueDiv");

	const partnersCardBarDiv = partnersCardEnter.append("div")
		.attr("class", classPrefix + "partnersCardBarDiv");

	partnersCardNameDiv.html(d => lists.partnersList[d.partnerType]);

	partnersCardValueDiv.html(d => `${formatSIFloat(d.value)} (${formatPercent1Decimal(d.value/total)})`);

	const partnersCardBar = partnersCardBarDiv.append("div")
		.attr("class", classPrefix + "partnersCardBar")
		.style("background-color", colors.cbpf)
		.style("width", "0%");

	partnersCard = partnersCardEnter.merge(partnersCard);

	partnersCard.order();

	partnersCard.select(`.${classPrefix}partnersCardValueDiv`)
		.html(d => `${formatSIFloat(d.value)} (${formatPercent1Decimal(d.value/total)})`);

	partnersCard.select(`.${classPrefix}partnersCardBar`)
		.transition(syncedTransition)
		.style("width", d => formatPercent1Decimal(d.value / maxValue));

	partnersCard.on("mouseover", mouseOverSelection)
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

	//end of drawSelectionChart
};

function drawTable(data, partnerType, containerDiv, container, lists, colors, fundType, syncedTransitionOriginal, tooltip) {

	containerDiv.selectChildren().remove();

	const syncedTransition = syncedTransitionOriginal || d3.transition()
		.duration(duration)
		.on("start", () => activeTransition = true)
		.on("end", () => activeTransition = false);

	const namesList = fundType === "cerf" ? lists.unAgenciesNamesList : lists.partnersNamesList;

	const filteredData = JSON.parse(JSON.stringify(!partnerType ? data : data.filter(partner => partner.partnerType === partnerType)));

	const maxValue = d3.max(filteredData, d => d.value);

	const rowDiv = containerDiv.selectAll(null)
		.data(filteredData, d => d.partner)
		.enter()
		.append("div")
		.attr("class", classPrefix + "rowDiv" + capitalize(fundType))
		.style("background-color", (_, i) => !(i % 2) ? "#fff" : "#eee")
		.style("max-height", partnerRowHeight + "em")
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

	headerName.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("name"));

	headerType.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("type"));

	headerValue.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("value"));

	headerValue.dispatch("mouseover");

	function sortRows(sortType) {
		sortedRow = sortType;
		filteredData.sort((a, b) => sortType === "name" ? namesList[a.partner].localeCompare(namesList[b.partner]) :
			sortType === "type" ? partnersShortNames[a.partnerType].localeCompare(partnersShortNames[b.partnerType]) :
			b.value - a.value);
		rowDiv.data(filteredData, d => d.partner)
			.order()
			.each((_, i, n) => d3.select(n[i]).style("background-color", !(i % 2) ? "#fff" : "#eee"));
	};

	function mouseOverHeader(event) {
		d3.select(event.currentTarget.parentNode)
			.selectAll("div")
			.select(`.${classPrefix}iconDiv`)
			.style("display", (_, i, n) => n[i].parentNode === event.currentTarget ? "block" : "none");
	};

	function mouseOutHeader(event) {
		d3.select(event.currentTarget.parentNode)
			.selectAll("div")
			.select(`.${classPrefix}iconDiv`)
			.style("display", d => d.type === sortedRow ? "block" : "none");
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
				target.push(innerRow);
				if (addTotal) data.topFigures.total += innerRow.value;
			});
		};
	};

	data.cerfData.sort((a, b) => b.value - a.value);
	data.cbpfData.sort((a, b) => b.value - a.value);
	data.cbpfDataAggregated.sort((a, b) => b.value - a.value);

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