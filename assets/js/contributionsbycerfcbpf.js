//|Contributions By Cerf/Cbpf module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbicc",
	currentDate = new Date(),
	svgHeightRatio = 0.6,
	currentYear = currentDate.getFullYear(),
	localVariable = d3.local(),
	allYears = "all",
	svgPaddingsCerf = [38, 24, 20, 68],
	svgPaddingsCbpf = [38, 24, 20, 68],
	duration = 1000,
	labelMargin = 22,
	labelPadding = 8,
	titlePadding = 6,
	precision = 6,
	monthFormat = d3.timeFormat("%b"),
	monthAbbrvParse = d3.timeParse("%b"),
	monthParse = d3.timeParse("%m"),
	pledgeDateParse = d3.timeParse("%m-%Y"),
	formatSIaxes = d3.format("~s"),
	monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
	separator = "##",
	valueTypes = ["total", "paid", "pledged"];

//|variables
let selectedYear = [allYears],
	selectedValue = "total",
	yearsArray;

function createContributionsByCerfCbpf(selections, colors, lists) {

	const containerDiv = selections.chartContainerDiv.append("div")
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

	yearsArray = d3.range(lists.yearsArrayContributions[0], currentYear, 1);

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

	const lineGeneratorCerf = d3.line()
		.y(d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCerf(d.year) : xScaleCerf(d.month)) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveCatmullRom);

	const lineGeneratorCbpf = d3.line()
		.y(d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCbpf(d.year) : xScaleCbpf(d.month)) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveCatmullRom);

	const lineGeneratorBaseCerf = d3.line()
		.y(() => yScaleCerf(0))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCerf(d.year) : xScaleCerf(d.month)) + xScaleCerf.bandwidth() / 2)
		.curve(d3.curveCatmullRom);

	const lineGeneratorBaseCbpf = d3.line()
		.y(() => yScaleCbpf(0))
		.x(d => (selectedYear.indexOf(allYears) > -1 ? xScaleCbpf(d.year) : xScaleCbpf(d.month)) + xScaleCbpf.bandwidth() / 2)
		.curve(d3.curveCatmullRom);

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

	createYearButtons(yearButtonsDiv);

	createPaidPledgedButtons(paidPledgedButtonsDiv);

	function draw(originalData) {

		let data = filterData(originalData);

		drawCerf(data);
		drawCbpf(data);

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

			tooltipDiv.style("left", thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		};

		function mouseoutyearButtons() {
			tooltipDiv.style("display", "none");
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

			drawCerf(data);
			drawCbpf(data);

			yearButtons.classed("active", d => selectedYear.indexOf(d) > -1);
		};

		valueButtons.on("click", (event, d) => {
			selectedValue = d;
			valueButtons.classed("active", e => e === selectedValue);
			drawCerf(data);
			drawCbpf(data);
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

		let barsCerf = svgCerf.selectAll("." + classPrefix + "barsCerf")
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
			.style("fill", colors.cerf)
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.style("opacity", 0);

		barsCerf = barsCerfEnter.merge(barsCerf);

		barsCerf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCerf(d[`${selectedValue}${separator}cerf`]))
			.attr("height", d => svgHeightCerf - svgPaddingsCerf[2] - yScaleCerf(d[`${selectedValue}${separator}cerf`]));

		let lineCerf = svgCerf.selectAll("." + classPrefix + "lineCerf")
			.data([data]);

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

		lineCerf.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => pathTween(lineGeneratorCerf(d), precision, n[i])());

		let labelsCerf = svgCerf.selectAll("." + classPrefix + "labelsCerf")
			.data(data, d => d[xValue]);

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

		xAxisGroupCerf.transition()
			.duration(duration)
			.call(xAxisCerf);

		yAxisGroupCerf.transition()
			.duration(duration)
			.call(yAxisCerf);

		//end of drawCerf
	};

	function drawCbpf(data) {

		const xValue = selectedYear.indexOf(allYears) > -1 ? "year" : "month";

		const minxScaleValue = d3.max(data, d => d[`total${separator}cbpf`]);

		xScaleCbpf.domain(selectedYear.indexOf(allYears) > -1 ? yearsArray : monthsArray);

		yScaleCbpf.domain([0, d3.max(data, d => d[`${selectedValue}${separator}cbpf`]) || minxScaleValue]);

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
			.text("(" + capitalize(selectedValue) + ")");

		chartTitleCbpf = chartTitleEnterCbpf.merge(chartTitleCbpf);

		chartTitleCbpf.select("tspan")
			.text("(" + capitalize(selectedValue) + ")");

		let barsCbpf = svgCbpf.selectAll("." + classPrefix + "barsCbpf")
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
			.style("fill", colors.cbpf)
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
			.style("opacity", 0);

		barsCbpf = barsCbpfEnter.merge(barsCbpf);

		barsCbpf.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => yScaleCbpf(d[`${selectedValue}${separator}cbpf`]))
			.attr("height", d => svgHeightCbpf - svgPaddingsCbpf[2] - yScaleCbpf(d[`${selectedValue}${separator}cbpf`]));

		let lineCbpf = svgCbpf.selectAll("." + classPrefix + "lineCbpf")
			.data([data]);

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

		lineCbpf.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => pathTween(lineGeneratorCerf(d), precision, n[i])());

		let labelsCbpf = svgCbpf.selectAll("." + classPrefix + "labelsCbpf")
			.data(data, d => d[xValue]);

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

		xAxisGroupCbpf.transition()
			.duration(duration)
			.call(xAxisCbpf);

		yAxisGroupCbpf.transition()
			.duration(duration)
			.call(yAxisCbpf);

		//end of drawCbpf
	}

	function filterData(originalData) {

		const data = [];

		originalData.forEach(row => {

			if (selectedYear.indexOf(allYears) > -1 && row.FiscalYear < currentYear) {

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
							[`pledged${separator}cbpf`]: 0
						};
						pushCbpfOrCerfContribution(monthObject, row);
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