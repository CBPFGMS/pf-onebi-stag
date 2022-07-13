import { chartState } from "./chartstate.js";
import { donorsFlagsData } from "./donorsflagsdata.js";

//|constants
const padding = [40, 60, 20, 196],
	buttonsPanelHeight = 30,
	tooltipVerticalPadding = 6,
	tooltipHorizontalPadding = 6,
	classPrefix = "pfbicpcontr",
	formatPercent = d3.format(".0%"),
	formatSIaxes = d3.format("~s"),
	currentDate = new Date(),
	localVariable = d3.local(),
	unBlue = "#1F69B3",
	currentYear = currentDate.getFullYear(),
	separator = "##",
	darkerValue = 0.2,
	donorNameWidth = 0.25,
	flagWidth = 0.05,
	barWidth = 1 - donorNameWidth - flagWidth,
	donorDivHeight = 2, //value in "em"
	barHeightFactor = 0.7,
	maxRowWidth = 98,
	textMinPadding = 8,
	valueTypes = ["total", "paid", "pledge"],
	duration = 1000,
	cerfText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nunc tellus, volutpat a laoreet sit amet, rhoncus cursus leo. Fusce velit lorem, interdum eu dui in, luctus ultrices eros. Nullam eu odio in lectus ullamcorper vulputate et a mauris. Nullam nulla lectus, porttitor non interdum vitae, facilisis iaculis urna.";

let yearsArrayCbpf,
	sortedRow = "value",
	selectedType = valueTypes[0],
	activeTransition = false;

function createCountryProfileContributions(container, lists, colors, tooltipDiv) {

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

	const chartsContainerDiv = chartsDiv.append("div")
		.attr("class", classPrefix + "chartsContainerDiv");

	const chartDivCerf = chartsContainerDiv.append("div")
		.attr("class", classPrefix + "chartDivCerf");

	const chartTitleCerf = chartDivCerf.append("div")
		.attr("class", classPrefix + "chartTitleCerf")
		.html("CERF");

	const chartContentCerf = chartDivCerf.append("div")
		.attr("class", classPrefix + "chartContentCerf")
		.html(cerfText);

	const chartDivCbpf = chartsContainerDiv.append("div")
		.attr("class", classPrefix + "chartDivCbpf");

	const chartTitleCbpf = chartDivCbpf.append("div")
		.attr("class", classPrefix + "chartTitleCbpf")
		.html("CBPF");

	const headerRowDivCbpf = chartDivCbpf.append("div")
		.attr("class", classPrefix + "headerRowDivCbpf");

	const chartContentCbpf = chartDivCbpf.append("div")
		.attr("class", classPrefix + "chartContentCbpf");

	createTopFiguresDiv(topRowDiv, colors, lists);
	createHeaderRow(headerRowDivCbpf);

	const yearsButtonsDivSize = yearsButtonsDiv.node().getBoundingClientRect();

	const cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	const cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

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
		typePadding: 240,
		typeWidth: 76,
		get buttonsNumber() {
			return Math.floor((this.width - this.typePadding - this.padding[1] - this.padding[3] - 2 * this.arrowPadding) / (this.buttonWidth + this.buttonPadding))
		}
	};

	function draw(originalData, resetYear, firstTime) {

		if (firstTime) {
			yearsArrayCbpf = createYearsArray(originalData);
		};

		if (resetYear) setDefaultYear(originalData, yearsArrayCbpf);

		const data = processData(originalData, lists);

		//is the title necessary???
		// title.html(`${lists.fundNamesList[chartState.selectedCountryProfile]}, ${chartState.selectedYear}`);

		const syncedTransition = d3.transition()
			.duration(duration)
			.on("start", () => activeTransition = true)
			.on("end", () => activeTransition = false);

		if (firstTime) createButtonsPanel(originalData, yearsArrayCbpf, buttonsSvg, buttonsPanel, tooltipDiv, container, draw);
		drawTopFigures(data.topFigures, topRowDiv, colors, syncedTransition);

		drawTable(data.cbpfData, chartContentCbpf, lists, colors, syncedTransition, tooltipDiv, headerRowDivCbpf);

		//end of draw
	};

	return draw;

	//end of createCountryProfileContributions
};

function createHeaderRow(container) {
	container.append("div")
		.attr("class", classPrefix + "headerName")
		.style("flex", `0 ${formatPercent(donorNameWidth)}`)
		.datum({ type: "name" })
		.html("Donor")
		.append("div")
		.style("display", "none")
		.attr("class", classPrefix + "iconDiv")
		.append("i")
		.attr("class", "fas fa-sort-alpha-down");
	container.append("div")
		.attr("class", classPrefix + "headerFlag")
		.style("flex", `0 ${formatPercent(flagWidth)}`)
		.datum({ type: "type" })
		.html(null);
	container.append("div")
		.attr("class", classPrefix + "headerValue")
		.style("flex", `0 ${formatPercent(barWidth)}`)
		.datum({ type: "value" })
		.html("Contribution Amount")
		.append("div")
		.style("display", "none")
		.attr("class", classPrefix + "iconDiv")
		.append("i")
		.attr("class", "fas fa-sort-amount-down");
};

function createButtonsPanel(originalData, yearsArray, svg, buttonsPanel, tooltip, container, draw) {

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

	const buttonsContributionsGroup = svg.append("g")
		.attr("class", classPrefix + "buttonsContributionsGroup")
		.attr("transform", "translate(" + (buttonsPanel.width - buttonsPanel.padding[1] - buttonsPanel.typePadding) + ",0)")
		.style("cursor", "pointer");

	const buttonsContributionsRects = buttonsContributionsGroup.selectAll(null)
		.data(valueTypes)
		.enter()
		.append("rect")
		.attr("rx", "2px")
		.attr("ry", "2px")
		.attr("class", classPrefix + "buttonsContributionsRects")
		.attr("width", buttonsPanel.typeWidth - buttonsPanel.buttonPadding)
		.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
		.attr("y", buttonsPanel.buttonVerticalPadding)
		.attr("x", function(_, i) {
			return i * buttonsPanel.typeWidth + buttonsPanel.buttonPadding / 2;
		})
		.style("fill", function(d) {
			return d === selectedType ? unBlue : "#eaeaea";
		});

	const buttonsContributionsText = buttonsContributionsGroup.selectAll(null)
		.data(valueTypes)
		.enter()
		.append("text")
		.attr("text-anchor", "middle")
		.attr("class", classPrefix + "buttonsContributionsText")
		.attr("y", buttonsPanel.height / 1.6)
		.attr("x", function(_, i) {
			return i * buttonsPanel.typeWidth + buttonsPanel.typeWidth / 2;
		})
		.style("fill", function(d) {
			return d === selectedType ? "white" : "#444";
		})
		.text(function(d) {
			if (d === "pledge") {
				return "Pledged"
			} else {
				return capitalize(d);
			};
		});

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

	buttonsContributionsRects.on("mouseover", mouseOverButtonsContributionsRects)
		.on("mouseout", mouseOutButtonsContributionsRects)
		.on("click", clickButtonsContributionsRects);

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

	function mouseOverButtonsContributionsRects(event, d) {
		d3.select(this).style("fill", unBlue);
		buttonsContributionsText.filter(e => e === d)
			.style("fill", "white");
	};

	function mouseOutButtonsContributionsRects(event, d) {
		if (selectedType === d) return;
		d3.select(this).style("fill", "#eaeaea");
		buttonsContributionsText.filter(e => e === d)
			.style("fill", "#444");
	};

	function clickButtonsContributionsRects(event, d) {
		selectedType = d;

		d3.selectAll(`.${classPrefix}buttonsContributionsRects`)
			.style("fill", e => selectedType === e ? unBlue : "#eaeaea");

		d3.selectAll(`.${classPrefix}buttonsContributionsText`)
			.style("fill", e => selectedType === e ? "white" : "#444");

		draw(originalData, false, false);
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

	container.select(`.${classPrefix}contributionsValue`)
		.transition(syncedTransition)
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

	container.select(`.${classPrefix}contributionsUnit`)
		.html(() => {
			const unit = formatSIFloat(data.total).slice(-1);
			return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
		});

	container.select(`.${classPrefix}paidValueDiv`)
		.transition(syncedTransition)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.paid);
			localVariable.set(n[i], data.paid);
			const finalValue = formatSIFloat(data.paid);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
			} else {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
			};
		});

	container.select(`.${classPrefix}paidUnitDiv`)
		.html(() => {
			const unit = formatSIFloat(data.paid).slice(-1);
			return +unit === +unit ? null : unit;
		});

	container.select(`.${classPrefix}pledgeValueDiv`)
		.transition(syncedTransition)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolate(localVariable.get(n[i]) || 0, data.pledge);
			localVariable.set(n[i], data.pledge);
			const finalValue = formatSIFloat(data.pledge);
			if (+finalValue.slice(-1) === +finalValue.slice(-1)) {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t));
			} else {
				return t => n[i].textContent = "$" + formatSIFloat(interpolator(t)).slice(0, -1);
			};
		});

	container.select(`.${classPrefix}pledgeUnitDiv`)
		.html(() => {
			const unit = formatSIFloat(data.pledge).slice(-1);
			return +unit === +unit ? null : unit;
		});

	container.select(`.${classPrefix}donorsValueDiv`)
		.transition(syncedTransition)
		.tween("html", (_, i, n) => {
			const interpolator = d3.interpolateRound(localVariable.get(n[i]) || 0, data.donors.size);
			localVariable.set(n[i], data.donors.size);
			return t => n[i].textContent = interpolator(t);
		});

	container.select(`.${classPrefix}donorsTextDiv`)
		.html(data.donors.size > 1 ? "donors" : "donor");

	//end of drawTopFigures
};

function createTopFiguresDiv(container, colors, lists) {

	const contributionsDiv = container.append("div")
		.attr("class", classPrefix + "contributionsDiv");

	const descriptionDiv = contributionsDiv.append("div")
		.attr("class", classPrefix + "descriptionDiv");

	descriptionDiv.append("span")
		.html(`Contributions for ${lists.fundNamesList[chartState.selectedCountryProfile]}`)
	descriptionDiv.append("span")
		.attr("class", classPrefix + "spanYearValue")
		.html(`in ${chartState.selectedYear}`);

	const contributionsValuePlusUnit = contributionsDiv.append("div")
		.attr("class", classPrefix + "valuePlusUnit");

	const contributionsValue = contributionsValuePlusUnit.append("span")
		.attr("class", classPrefix + "contributionsValue")
		.html("$0")
		.call(applyColors, colors);

	const contributionsUnit = contributionsValuePlusUnit.append("span")
		.attr("class", classPrefix + "contributionsUnit");

	const paidAndPledgeDiv = container.append("div")
		.attr("class", classPrefix + "paidAndPledgeDiv");

	const paidDiv = paidAndPledgeDiv.append("div")
		.attr("class", classPrefix + "paidDiv");

	const pledgeDiv = paidAndPledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeDiv");

	const paidValueDiv = paidDiv.append("div")
		.attr("class", classPrefix + "paidValueDiv")
		.html("$0")
		.call(applyColors, colors);

	const paidUnitDiv = paidDiv.append("div")
		.attr("class", classPrefix + "paidUnitDiv");

	const paidTextDiv = paidDiv.append("div")
		.attr("class", classPrefix + "paidTextDiv")
		.html("paid contributions");

	const pledgeValueDiv = pledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeValueDiv")
		.html("$0")
		.call(applyColors, colors);

	const pledgeUnitDiv = pledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeUnitDiv");

	const pledgeTextDiv = pledgeDiv.append("div")
		.attr("class", classPrefix + "pledgeTextDiv")
		.html("pledged contributions");

	const donorsDiv = container.append("div")
		.attr("class", classPrefix + "donorsDiv");

	const donorsValueDiv = donorsDiv.append("div")
		.attr("class", classPrefix + "donorsValueDiv")
		.html("0")
		.call(applyColors, colors);

	const donorsTextDiv = donorsDiv.append("div")
		.attr("class", classPrefix + "donorsTextDiv")
		.html("donors");

};

function drawTable(data, containerDiv, lists, colors, syncedTransitionOriginal, tooltipDiv, header) {

	const maxValue = d3.max(data, d => d[selectedType]);

	const syncedTransition = syncedTransitionOriginal || d3.transition()
		.duration(duration)
		.on("start", () => activeTransition = true)
		.on("end", () => activeTransition = false);

	let rowDiv = containerDiv.selectAll(`.${classPrefix}rowDiv`)
		.data(data, d => d.donor);

	rowDiv.exit()
		.remove();

	const rowDivEnter = rowDiv.enter()
		.append("div")
		.attr("class", classPrefix + "rowDiv")
		.style("height", donorDivHeight + "em", "important")
		.style("top", (_, i) => (donorDivHeight * i) + "em");

	const rowDivName = rowDivEnter.append("div")
		.attr("class", classPrefix + "rowDivName")
		.style("flex", `0 ${formatPercent(donorNameWidth)}`)
		.html(d => lists.donorNamesList[d.donor])

	const rowDivFlag = rowDivEnter.append("div")
		.attr("class", classPrefix + "rowDivFlag")
		.style("flex", `0 ${formatPercent(flagWidth)}`)
		.append("img")
		.attr("height", "24px")
		.attr("width", "24px")
		.attr("src", d => donorsFlagsData[lists.donorIsoCodesList[d.donor].toLowerCase()]);

	const barDivContainer = rowDivEnter.append("div")
		.attr("class", classPrefix + "barDivContainer")
		.style("flex", `0 ${formatPercent(barWidth)}`);

	const barDiv = barDivContainer.append("div")
		.attr("class", classPrefix + "barDiv")
		.style("width", "0%")
		.style("height", (donorDivHeight * barHeightFactor) + "em")
		.style("background-color", colors.cbpf);

	const barLabel = barDivContainer.append("span")
		.attr("class", classPrefix + "barLabel")
		.style("right", "95%");

	rowDiv = rowDivEnter.merge(rowDiv);

	rowDiv.order();

	rowDiv.transition(syncedTransition)
		.style("top", (_, i) => (donorDivHeight * i) + "em");

	rowDiv.select(`.${classPrefix}barDiv`)
		.transition(syncedTransition)
		.style("width", d => maxValue === 0 ? "0%" : (maxRowWidth * d[selectedType] / maxValue) + "%");

	rowDiv.select(`.${classPrefix}barLabel`)
		.transition(syncedTransition)
		.textTween((d, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d[selectedType]);
			return t => d[selectedType] ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
		})
		.styleTween("right", (d, i, n) => {
			const containerWidth = n[i].parentNode.getBoundingClientRect().width;
			return () => {
				const textWidth = n[i].getBoundingClientRect().width;
				const barWidth = n[i].previousSibling.getBoundingClientRect().width;
				return textWidth + textMinPadding > barWidth ?
					0.99 * containerWidth - barWidth - textWidth + "px" :
					containerWidth - barWidth + "px";
			};
		});

	const headerName = header.select(`.${classPrefix}headerName`);
	const headerValue = header.select(`.${classPrefix}headerValue`);

	headerName.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("name"));

	headerValue.on("mouseover", mouseOverHeader)
		.on("mouseout", mouseOutHeader)
		.on("click", () => sortRows("value"));

	headerValue.dispatch("mouseover");

	function sortRows(sortType) {
		sortedRow = sortType;
		data.sort((a, b) => sortType === "name" ? lists.donorNamesList[a.donor].localeCompare(lists.donorNamesList[b.donor]) :
			b[selectedType] - a[selectedType]);
		rowDiv.data(data, d => d.donor)
			.order()
			.transition()
			.duration(duration)
			.style("top", (_, i) => (donorDivHeight * i) + "em");
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
			total: 0,
			paid: 0,
			pledge: 0,
			donors: new Set()
		},
		cbpfData: []
	};

	originalData.forEach(row => {
		if (chartState.selectedYear === row.year) {
			row.values.forEach(innerRow => {
				data.cbpfData.push(innerRow);
				data.topFigures.total += innerRow.total;
				data.topFigures.paid += innerRow.paid;
				data.topFigures.pledge += innerRow.pledge;
				data.topFigures.donors.add(innerRow.donor);
			});
		};
	});

	data.cbpfData.sort((a, b) => b[selectedType] - a[selectedType]);

	return data;

	//end of processData
};

function setDefaultYear(originalData, years) {
	let index = years.length;
	const dataCbpf = originalData.filter(e => e.cbpf);
	while (--index >= 0) {
		const cbpfValue = dataCbpf.find(e => e.year === years[index]);
		if (cbpfValue) {
			chartState.selectedYear = years[index];
			break;
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

function createYearsArray(originalData) {
	return originalData.map(d => d.year);
};

function applyColors(selection, colors) {
	selection.style("color", d3.color(colors.cbpf).darker(darkerValue));
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

export { createCountryProfileContributions };