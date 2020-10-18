//|Allocations module

import {
	chartState
} from "./chartstate.js";

//|constants
const classPrefix = "pfbial",
	mapPercentage = 0.75,
	barChartPercentage = 1 - mapPercentage,
	mapAspectRatio = 2.225,
	legendPanelHeight = 132,
	legendPanelWidth = 110,
	legendPanelHorPadding = 44,
	legendPanelVertPadding = 32,
	legendTextPadding = 18,
	mapZoomButtonHorPadding = 48,
	mapZoomButtonVertPadding = 10,
	mapZoomButtonSize = 26,
	maxPieSize = 26,
	minPieSize = 1,
	tooltipMargin = 4,
	legendLineSize = 38,
	showNamesMargin = 12,
	duration = 1000,
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	groupNamePadding = 2,
	barWidth = 20,
	fadeOpacity = 0.1,
	localVariable = d3.local(),
	formatPercent = d3.format("%"),
	formatSIaxes = d3.format("~s"),
	svgColumnChartWidth = 195,
	svgMapPadding = [0, 10, 0, 10],
	svgBarChartPadding = [4, 4, 4, 4],
	svgColumnChartPaddingByCountry = [16, 4, 4, 56],
	svgColumnChartPaddingBySector = [4, 4, 4, 4],
	svgColumnChartPaddingByType = [4, 4, 4, 4],
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	stackKeys = ["total", "cerf", "cbpf"],
	centroids = {};

//|variables
let svgMapWidth,
	svgMapHeight,
	allocationsProperty,
	clickableButtons = true;

//|hardcoded locations
const hardcodedAllocations = [{
	isoCode: "0E",
	long: 36.84,
	lat: -1.28
}, {
	isoCode: "0G",
	long: -73.96,
	lat: 40.75
}, {
	isoCode: "0V",
	long: -66.85,
	lat: 1.23
}];

function createAllocations(selections, colors, mapData, lists) {

	const containerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "containerDiv");

	const mapDiv = containerDiv.append("div")
		.attr("class", classPrefix + "mapDiv")
		.style("height", formatPercent(mapPercentage));

	const tooltipDivMap = mapDiv.append("div")
		.attr("id", classPrefix + "tooltipDivMap")
		.style("display", "none");

	const barChartDiv = containerDiv.append("div")
		.attr("class", classPrefix + "barChartDiv")
		.style("height", formatPercent(barChartPercentage));

	const tooltipDivBarChart = barChartDiv.append("div")
		.attr("id", classPrefix + "tooltipDivBarChart")
		.style("display", "none");

	const buttonsDiv = mapDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

	const columnChartContainer = chartState.selectedChart === "allocationsByCountry" ? selections.byCountryChartContainer :
		chartState.selectedChart === "allocationsBySector" ? selections.bySectorChartContainer : null;

	columnChartContainer.html(null);

	const columnChartContainerSize = columnChartContainer.node().getBoundingClientRect();

	const svgColumnChartHeight = columnChartContainerSize.height;

	//FIX: WHY ISN'T VIEWBOX WORKING?
	const svgColumnChart = columnChartContainer.append("svg")
		.attr("width", svgColumnChartWidth)
		.attr("height", svgColumnChartHeight);

	const mapDivSize = mapDiv.node().getBoundingClientRect();
	const barChartDivSize = barChartDiv.node().getBoundingClientRect();
	const svgMapHeight = mapDivSize.height;
	const svgMapWidth = mapDivSize.width;
	const svgBarChartWidth = barChartDivSize.width;
	const svgBarChartHeight = barChartDivSize.height;
	const svgMapPanelWidth = svgMapWidth / svgMapHeight < mapAspectRatio ? svgMapWidth - svgMapPadding[1] - svgMapPadding[3] :
		(svgMapHeight * mapAspectRatio) - svgMapPadding[1] - svgMapPadding[3];

	const mapInnerDiv = mapDiv.append("div")
		.attr("class", classPrefix + "mapInnerDiv");

	const svgMap = mapInnerDiv.append("svg")
		.attr("viewBox", "0 0 " + svgMapWidth + " " + svgMapHeight)
		.style("background-color", "white");

	//FIX THE ASPECT RATIO! The width should be CONSTANT

	const svgBarChart = barChartDiv.append("svg")
		.attr("viewBox", "0 0 " + svgBarChartWidth + " " + svgBarChartHeight)
		.style("background-color", "white");

	const zoomLayer = svgMap.append("g")
		.attr("class", classPrefix + "zoomLayer")
		.style("opacity", 0)
		.attr("cursor", "move")
		.attr("pointer-events", "all");

	const mapPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + (svgMapWidth - svgMapPadding[1] - svgMapPadding[3] - svgMapPanelWidth) / 2) + "," + svgMapPadding[0] + ")"),
		width: svgMapPanelWidth,
		height: svgMapHeight - svgMapPadding[0] - svgMapPadding[2],
		padding: [0, 0, 0, 0]
	};

	const legendPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "legendPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + legendPanelHorPadding) + "," + (svgMapPadding[0] + mapPanel.height - legendPanelHeight - legendPanelVertPadding) + ")"),
		width: legendPanelWidth,
		height: legendPanelHeight,
		padding: [30, 0, 20, 4]
	};

	const mapZoomButtonPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "mapZoomButtonPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + mapZoomButtonHorPadding) + "," + (svgMapPadding[0] + mapZoomButtonVertPadding) + ")"),
		width: mapZoomButtonSize,
		height: mapZoomButtonSize * 2,
		padding: [4, 4, 4, 4]
	};

	const checkboxesPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "checkboxesPanel")
			.attr("transform", "translate(" + (svgMapPadding[3] + mapZoomButtonHorPadding + 1) + "," + (svgMapPadding[0] + mapZoomButtonVertPadding + mapZoomButtonPanel.height + showNamesMargin) + ")"),
		padding: [0, 0, 0, 0]
	};

	const barChartPanel = {
		main: svgBarChart.append("g")
			.attr("class", classPrefix + "barChartPanel")
			.attr("transform", "translate(" + svgBarChartPadding[3] + "," + svgBarChartPadding[0] + ")"),
		width: svgBarChartWidth - svgBarChartPadding[3] - svgBarChartPadding[1],
		height: svgBarChartHeight - svgBarChartPadding[2] - svgBarChartPadding[0],
		padding: [28, 0, 18, 46],
		titlePadding: 10,
		titleHorPadding: 8
	};

	//test
	// barChartPanel.main.append("rect")
	// 	.attr("width", barChartPanel.width)
	// 	.attr("height", barChartPanel.height)
	// 	.style("fill", "wheat");
	//test

	const svgMapClip = svgMap.append("clipPath")
		.attr("id", classPrefix + "svgMapClip")
		.append("rect")
		.attr("width", svgMapWidth)
		.attr("height", svgMapHeight);

	svgMap.attr("clip-path", `url(#${classPrefix}svgMapClip)`);

	const mapContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "mapContainer");

	const zoomRectangle = zoomLayer.append("rect")
		.attr("width", svgMapWidth)
		.attr("height", svgMapHeight);

	const piesContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "piesContainer");

	const mapProjection = d3.geoEqualEarth();

	const mapPath = d3.geoPath()
		.projection(mapProjection);

	const radiusScale = d3.scaleSqrt()
		.range([minPieSize, maxPieSize]);

	const xScale = d3.scaleBand()
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const yScale = d3.scaleLinear()
		.range([barChartPanel.height - barChartPanel.padding[2], barChartPanel.padding[0]]);

	const xScaleColumnByCountry = d3.scaleLinear()
		.range([svgColumnChartPaddingByCountry[3], svgColumnChartWidth - svgColumnChartPaddingByCountry[1]]);

	const yScaleColumnByCountry = d3.scaleBand()
		.range([svgColumnChartPaddingByCountry[0], svgColumnChartHeight - svgColumnChartPaddingByCountry[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleColumnBySector = d3.scaleLinear()
		.range([svgColumnChartPaddingBySector[3], svgColumnChartWidth - svgColumnChartPaddingBySector[1]]);

	const yScaleColumnBySector = d3.scaleBand()
		.range([svgColumnChartPaddingBySector[0], svgColumnChartHeight - svgColumnChartPaddingBySector[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const xScaleColumnByType = d3.scaleLinear()
		.range([svgColumnChartPaddingByType[3], svgColumnChartWidth - svgColumnChartPaddingByType[1]]);

	const yScaleColumnByType = d3.scaleBand()
		.range([svgColumnChartPaddingByType[0], svgColumnChartHeight - svgColumnChartPaddingByType[2]])
		.paddingInner(0.5)
		.paddingOuter(0.5);

	const arcGenerator = d3.arc()
		.innerRadius(0);

	const arcGeneratorEnter = d3.arc()
		.innerRadius(0)
		.outerRadius(0);

	const pieGenerator = d3.pie()
		.value(function(d) {
			return d.value;
		})
		.sort(null);

	const stack = d3.stack()
		.keys(stackKeys)
		.order(d3.stackOrderDescending);

	const xAxis = d3.axisBottom(xScale)
		.tickSize(4)
		.tickFormat(d => lists.fundIsoCodes3List[d]);

	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const xAxisColumnByCountry = d3.axisTop(xScaleColumnByCountry)
		.tickSizeOuter(0)
		.tickSizeInner(-(svgColumnChartHeight - svgColumnChartPaddingByCountry[2] - svgColumnChartPaddingByCountry[0]))
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumnByCountry = d3.axisLeft(yScaleColumnByCountry)
		.tickSize(4);

	const xAxisColumnBySector = d3.axisTop(xScaleColumnBySector)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumnBySector = d3.axisLeft(yScaleColumnBySector)
		.tickSize(4);

	const xAxisColumnByType = d3.axisTop(xScaleColumnByType)
		.tickSizeOuter(0)
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	const yAxisColumnByType = d3.axisLeft(yScaleColumnByType)
		.tickSize(4);

	const xAxisGroup = barChartPanel.main.append("g")
		.attr("class", classPrefix + "xAxisGroup")
		.attr("transform", "translate(0," + (barChartPanel.height - barChartPanel.padding[2]) + ")");

	const yAxisGroup = barChartPanel.main.append("g")
		.attr("class", classPrefix + "yAxisGroup")
		.attr("transform", "translate(" + barChartPanel.padding[3] + ",0)");

	const xAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "xAxisGroupColumn")
		.attr("transform", "translate(0," + (chartState.selectedChart === "allocationsByCountry" ? svgColumnChartPaddingByCountry[0] :
			chartState.selectedChart === "allocationsBySector" ? svgColumnChartPaddingBySector[0] : svgColumnChartPaddingByType[0]
		) + ")");

	const yAxisGroupColumn = svgColumnChart.append("g")
		.attr("class", classPrefix + "yAxisGroupColumn")
		.attr("transform", "translate(" + (chartState.selectedChart === "allocationsByCountry" ? svgColumnChartPaddingByCountry[3] :
			chartState.selectedChart === "allocationsBySector" ? svgColumnChartPaddingBySector[3] : svgColumnChartPaddingByType[3]
		) + ",0)");

	const zoom = d3.zoom()
		.scaleExtent([1, 20])
		.extent([
			[0, 0],
			[mapPanel.width, mapPanel.height]
		])
		.translateExtent([
			[0, 0],
			[mapPanel.width, mapPanel.height]
		]);

	svgMap.call(zoom);

	const defs = svgMap.append("defs");

	const filter = defs.append("filter")
		.attr("id", classPrefix + "dropshadow")
		.attr('filterUnits', 'userSpaceOnUse');

	filter.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", 3);

	filter.append("feOffset")
		.attr("dx", 0)
		.attr("dy", 0);

	const feComponent = filter.append("feComponentTransfer");

	feComponent.append("feFuncA")
		.attr("type", "linear")
		.attr("slope", 0.7);

	const feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode");
	feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");

	mapZoomButtonPanel.main.style("filter", `url(#${classPrefix}dropshadow)`);

	createMap(mapData);

	createZoomButtons();

	createCheckbox();

	createMapButtons();

	function draw(originalData) {

		verifyCentroids(originalData);

		createColumnTopValues(originalData);

		createColumnChart(originalData);

		const data = filterData(originalData);

		drawMap(data);
		drawLegend(data);
		drawBarChart(data);

		const mapButtons = buttonsDiv.selectAll("button");

		mapButtons.on("click", (event, d) => {
			chartState.selectedFund = d;

			mapButtons.classed("active", d => chartState.selectedFund === d);

			const data = filterData(originalData);

			createColumnTopValues(originalData);

			createColumnChart(originalData);

			drawMap(data);
			drawLegend(data);
			drawBarChart(data);
		});

	};

	function createMap(mapData) {

		const countryFeatures = topojson.feature(mapData, mapData.objects.wrl_polbnda_int_simple_uncs);

		countryFeatures.features = countryFeatures.features.filter(d => d.properties.ISO_2 !== "AQ");

		mapProjection.fitExtent([
			[mapPanel.padding[3], mapPanel.padding[0]],
			[(mapPanel.width - mapPanel.padding[1] - mapPanel.padding[3]), (mapPanel.height - mapPanel.padding[0] - mapPanel.padding[2])]
		], countryFeatures);

		const land = mapContainer.append("path")
			.attr("d", mapPath(topojson.merge(mapData, mapData.objects.wrl_polbnda_int_simple_uncs.geometries)))
			.style("fill", "#F1F1F1");

		const borders = mapContainer.append("path")
			.attr("d", mapPath(topojson.mesh(mapData, mapData.objects.wrl_polbnda_int_simple_uncs, (a, b) => a !== b)))
			.style("fill", "none")
			.style("stroke", "#E5E5E5")
			.style("stroke-width", "1px");

		countryFeatures.features.forEach(d => {
			centroids[d.properties.ISO_2] = {
				x: mapPath.centroid(d.geometry)[0],
				y: mapPath.centroid(d.geometry)[1]
			}
		});

		//Countries with problems:
		//And the fake codes: 0E (Eastern Africa), 0G (Global) and 0V (Venezuela Regional Refugee and Migration Crisis)
		hardcodedAllocations.forEach(d => {
			const projected = mapProjection([d.long, d.lat]);
			centroids[d.isoCode] = {
				x: projected[0],
				y: projected[1]
			};
		});

		//end of createMap
	};

	function createZoomButtons() {

		const zoomInGroup = mapZoomButtonPanel.main.append("g")
			.attr("class", classPrefix + "zoomInGroupMap")
			.attr("cursor", "pointer");

		const zoomInPath = zoomInGroup.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", function() {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.padding[0]);
				drawPath.quadraticCurveTo(0, 0, mapZoomButtonPanel.padding[0], 0);
				drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[1], 0);
				drawPath.quadraticCurveTo(mapZoomButtonPanel.width, 0, mapZoomButtonPanel.width, mapZoomButtonPanel.padding[1]);
				drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomInText = zoomInGroup.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (mapZoomButtonPanel.height / 4) + 7)
			.text("+");

		const zoomOutGroup = mapZoomButtonPanel.main.append("g")
			.attr("class", classPrefix + "zoomOutGroupMap")
			.attr("cursor", "pointer");

		const zoomOutPath = zoomOutGroup.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", function() {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[3]);
				drawPath.quadraticCurveTo(0, mapZoomButtonPanel.height, mapZoomButtonPanel.padding[3], mapZoomButtonPanel.height);
				drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[2], mapZoomButtonPanel.height);
				drawPath.quadraticCurveTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height, mapZoomButtonPanel.width, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[2]);
				drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomOutText = zoomOutGroup.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (3 * mapZoomButtonPanel.height / 4) + 7)
			.text("−");

		const zoomLine = mapZoomButtonPanel.main.append("line")
			.attr("x1", 0)
			.attr("x2", mapZoomButtonPanel.width)
			.attr("y1", mapZoomButtonPanel.height / 2)
			.attr("y2", mapZoomButtonPanel.height / 2)
			.style("stroke", "#ccc")
			.style("stroke-width", "1px");

		//end of createZoomButtons
	};

	function createCheckbox() {

		const showNamesGroup = checkboxesPanel.main.append("g")
			.attr("class", classPrefix + "showNamesGroup")
			.attr("cursor", "pointer");

		const outerRectangle = showNamesGroup.append("rect")
			.attr("width", 14)
			.attr("height", 14)
			.attr("rx", 2)
			.attr("ry", 2)
			.attr("fill", "white")
			.attr("stroke", "darkslategray");

		const innerCheck = showNamesGroup.append("polyline")
			.style("stroke-width", "2px")
			.attr("points", "3,7 6,10 11,3")
			.style("fill", "none")
			.style("stroke", chartState.showNames ? "darkslategray" : "white");

		const showNamesText = showNamesGroup.append("text")
			.attr("class", classPrefix + "showNamesText")
			.attr("x", 18)
			.attr("y", 11)
			.text("Show All");

		showNamesGroup.on("click", function() {

			chartState.showNames = !chartState.showNames;

			innerCheck.style("stroke", chartState.showNames ? "darkslategray" : "white");

			piesContainer.selectAll("text")
				.style("display", null);

			if (!chartState.showNames) displayLabels(piesContainer.selectAll("." + classPrefix + "groupName"));

		});

		//end of createCheckbox
	};

	function createMapButtons() {
		const buttons = buttonsDiv.selectAll(null)
			.data(buttonsList)
			.enter()
			.append("button")
			.classed("active", d => chartState.selectedFund === d)
			.attr("id", d => classPrefix + "button" + d);

		const bullet = buttons.append("span")
			.attr("class", "icon-circle")
			.append("i")
			.attr("class", (_, i) => i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
			.style("color", (d, i) => i !== 1 ? colors[d] : null);

		const title = buttons.append("span")
			.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));
	};

	function drawMap(unfilteredData) {

		clickableButtons = false;

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		data.sort((a, b) => b.total - a.total || (b.cbpf + b.cerf) - (a.cbpf + a.cerf));

		const maxValue = d3.max(data, d => chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf);

		radiusScale.domain([0, maxValue || 0]);

		const currentTransform = d3.zoomTransform(svgMap.node());

		zoom.on("zoom", zoomed);

		if (data.length) {
			zoomToBoundingBox(data);
		} else {
			zoom.transform(svgMap.transition().duration(duration), d3.zoomIdentity)
		};

		let piesNoData = piesContainer.selectAll("." + classPrefix + "piesNoData")
			.data(data.length ? [] : [true]);

		const piesNoDataExit = piesNoData.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		piesNoData = piesNoData.enter()
			.append("text")
			.attr("class", classPrefix + "piesNoData")
			.attr("x", mapPanel.width / 2)
			.attr("y", mapPanel.height / 2)
			.style("opacity", 0)
			.text("No country in the selection".toUpperCase())
			.merge(piesNoData)
			.transition()
			.duration(duration)
			.style("opacity", 1);

		let pieGroup = piesContainer.selectAll("." + classPrefix + "pieGroup")
			.data(data, d => d.country);

		const pieGroupExit = pieGroup.exit();

		pieGroupExit.selectAll("text, tspan")
			.transition()
			.duration(duration * 0.9)
			.style("opacity", 0);

		pieGroupExit.each((_, i, n) => {
			const thisGroup = d3.select(n[i]);
			thisGroup.selectAll("." + classPrefix + "slice")
				.transition()
				.duration(duration)
				.attrTween("d", (d, j, m) => {
					const finalObject = d.data.type === "cerf" ? {
						startAngle: 0,
						endAngle: 0,
						outerRadius: 0
					} : {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: 0
					};
					const interpolator = d3.interpolateObject(localVariable.get(m[j]), finalObject);
					return t => arcGenerator(interpolator(t));
				})
				.on("end", () => thisGroup.remove())
		});

		const pieGroupEnter = pieGroup.enter()
			.append("g")
			.attr("class", classPrefix + "pieGroup")
			.style("opacity", 1)
			.attr("transform", d => "translate(" + (centroids[d.isoCode].x * currentTransform.k + currentTransform.x) +
				"," + (centroids[d.isoCode].y * currentTransform.k + currentTransform.y) + ")");

		const groupName = pieGroupEnter.append("text")
			.attr("class", classPrefix + "groupName")
			.attr("x", d => radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
			.attr("y", d => d.labelText.length > 1 ? groupNamePadding * 2 - 5 : groupNamePadding * 2)
			.style("opacity", 0)
			.text(d => d.labelText.length > 2 ? d.labelText[0] + " " + d.labelText[1] : d.labelText[0])
			.each((d, i, n) => {
				if (d.labelText.length > 1) {
					d3.select(n[i]).append("tspan")
						.attr("x", radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
						.attr("dy", 12)
						.text(d.labelText.length > 2 ? d.labelText.filter((_, i) => i > 1).join(" ") : d.labelText[1]);
				};
			});

		if (!chartState.showNames) {
			groupName.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
		};

		pieGroup = pieGroupEnter.merge(pieGroup);

		pieGroup.order();

		const allTexts = pieGroup.selectAll("text");

		pieGroup.select("text." + classPrefix + "groupName tspan")
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding);

		pieGroup.select("text." + classPrefix + "groupName")
			.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => radiusScale(chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf) + groupNamePadding)
			.end()
			.then(() => {
				clickableButtons = true;
				if (chartState.showNames) return;
				allTexts.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
			});

		let slices = pieGroup.selectAll("." + classPrefix + "slice")
			.data(d => pieGenerator([{
				value: d.cerf,
				total: chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf,
				type: "cerf"
			}, {
				value: d.cbpf,
				total: chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf,
				type: "cbpf"
			}, {
				value: d.total,
				total: chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf,
				type: "total"
			}].filter(function(e) {
				return e.value !== 0;
			})), d => d.data.type);

		const slicesRemove = slices.exit()
			.transition()
			.duration(duration)
			.attrTween("d", (d, i, n) => {
				const parentDatum = d3.select(n[i].parentNode).datum();
				const thisTotal = radiusScale(chartState.selectedFund === "total" ? parentDatum.total : parentDatum.cbpf + parentDatum.cerf);
				const finalObject = d.data.type === "cerf" ? {
					startAngle: 0,
					endAngle: 0,
					outerRadius: thisTotal
				} : {
					startAngle: Math.PI * 2,
					endAngle: Math.PI * 2,
					outerRadius: thisTotal
				};
				const interpolator = d3.interpolateObject(localVariable.get(n[i]), finalObject);
				return t => arcGenerator(interpolator(t));
			})
			.on("end", (_, i, n) => d3.select(n[i]).remove())

		const slicesEnter = slices.enter()
			.append("path")
			.attr("class", classPrefix + "slice")
			.style("fill", d => colors[d.data.type])
			.style("stroke", "#666")
			.style("stroke-width", "1px")
			.style("stroke-opacity", strokeOpacityValue)
			.style("fill-opacity", fillOpacityValue)
			.each((d, i, n) => {
				let siblingRadius = 0;
				const siblings = d3.select(n[i].parentNode).selectAll("path")
					.each((_, j, m) => {
						const thisLocal = localVariable.get(m[j])
						if (thisLocal) siblingRadius = thisLocal.outerRadius;
					});
				if (d.data.type === "cerf") {
					localVariable.set(n[i], {
						startAngle: 0,
						endAngle: 0,
						outerRadius: siblingRadius
					});
				} else {
					localVariable.set(n[i], {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: siblingRadius
					});
				};
			})

		slices = slicesEnter.merge(slices);

		slices.transition()
			.duration(duration)
			.attrTween("d", pieTween);

		function pieTween(d) {
			const i = d3.interpolateObject(localVariable.get(this), {
				startAngle: d.startAngle,
				endAngle: d.endAngle,
				outerRadius: radiusScale(d.data.total)
			});
			localVariable.set(this, i(1));
			return t => arcGenerator(i(t));
		};

		pieGroup.on("mouseover", pieGroupMouseover)
			.on("mouseout", pieGroupMouseout);

		function zoomed(event) {

			mapContainer.attr("transform", event.transform);

			mapContainer.select("path:nth-child(2)")
				.style("stroke-width", 1 / event.transform.k + "px");

			pieGroup.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			pieGroupExit.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			if (!chartState.showNames) {
				allTexts.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
			};

			//end of zoomed
		};

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomInGroupMap")
			.on("click", function() {
				zoom.scaleBy(svgMap.transition().duration(duration), 2);
			});

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomOutGroupMap")
			.on("click", function() {
				zoom.scaleBy(svgMap.transition().duration(duration), 0.5);
			});

		function pieGroupMouseover(event, datum) {

			pieGroup.style("opacity", d => d.country === datum.country ? 1 : fadeOpacity);

			barChartPanel.main.selectAll("." + classPrefix + "bars")
				.style("opacity", d => d.data.country === datum.country ? 1 : fadeOpacity);

			xAxisGroup.selectAll(".tick")
				.style("opacity", d => d === datum.country ? 1 : fadeOpacity);

			// currentHoveredElem = this;

			tooltipDivMap.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDivMap.append("div")
				.style("max-width", "300px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.html("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");

			// createCountryTooltip(datum, false);

			const thisBox = event.currentTarget.getBoundingClientRect();

			const containerBox = mapDiv.node().getBoundingClientRect();

			const tooltipBox = tooltipDivMap.node().getBoundingClientRect();

			const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
				(thisBox.left + 2 * (radiusScale(chartState.selectedFund === "total" ? datum.total : datum.cbpf + datum.cerf) * (containerBox.width / svgMapWidth))) - containerBox.left + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltipDivMap.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

		};

		function pieGroupMouseout(event) {

			pieGroup.style("opacity", 1);

			barChartPanel.main.selectAll("." + classPrefix + "bars")
				.style("opacity", 1);

			xAxisGroup.selectAll(".tick")
				.style("opacity", 1);

			// if (isSnapshotTooltipVisible) return;

			// currentHoveredElem = null;

			// pieGroup.style("opacity", 1);

			tooltipDivMap.html(null)
				.style("display", "none");

		};

		function zoomToBoundingBox(data) {

			const boundingBox = data.reduce((acc, curr) => {
				acc.n = Math.min(acc.n, centroids[curr.isoCode].y - radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				acc.s = Math.max(acc.s, centroids[curr.isoCode].y + radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				acc.e = Math.max(acc.e, centroids[curr.isoCode].x + radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				acc.w = Math.min(acc.w, centroids[curr.isoCode].x - radiusScale(chartState.selectedFund === "total" ? curr.total : curr.cbpf + curr.cerf));
				return acc;
			}, {
				n: Infinity,
				s: -Infinity,
				e: -Infinity,
				w: Infinity
			});

			const midPointX = (boundingBox.w + boundingBox.e) / 2;
			const midPointY = (boundingBox.n + boundingBox.s) / 2;
			const scale = Math.min(mapPanel.width / (boundingBox.e - boundingBox.w), mapPanel.height / (boundingBox.s - boundingBox.n));
			const translate = [mapPanel.width / 2 - scale * midPointX, mapPanel.height / 2 - scale * midPointY];

			zoom.transform(svgMap.transition().duration(duration),
				d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

		};


		//end of drawMap
	};

	function drawLegend(data) {

		const maxDataValue = radiusScale.domain()[1];

		const sizeCirclesData = maxDataValue ? [0, maxDataValue / 4, maxDataValue / 2, maxDataValue] : [];

		const legendTitle = legendPanel.main.selectAll("." + classPrefix + "legendTitle")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "legendTitle")
			.attr("x", legendPanel.padding[3])
			.attr("y", legendPanel.padding[0] - 10)
			.text("LEGEND");

		let legendSizeGroups = legendPanel.main.selectAll("." + classPrefix + "legendSizeGroups")
			.data([true]);

		legendSizeGroups = legendSizeGroups.enter()
			.append("g")
			.attr("class", classPrefix + "legendSizeGroups")
			.merge(legendSizeGroups);

		let legendSizeGroup = legendSizeGroups.selectAll("." + classPrefix + "legendSizeGroup")
			.data(sizeCirclesData);

		const legendSizeGroupExit = legendSizeGroup.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const legendSizeGroupEnter = legendSizeGroup.enter()
			.append("g")
			.style("opacity", 0)
			.attr("class", classPrefix + "legendSizeGroup");

		const legendSizeLines = legendSizeGroupEnter.append("line")
			.attr("x1", legendPanel.padding[3] + radiusScale.range()[1])
			.attr("x2", legendPanel.padding[3] + radiusScale.range()[1] + legendLineSize)
			.attr("y1", d => d ? legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPanel.padding[0] + (radiusScale.range()[1] * 2))
			.attr("y2", d => d ? legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPanel.padding[0] + (radiusScale.range()[1] * 2))
			.style("stroke", "#666")
			.style("stroke-dasharray", "2,2")
			.style("stroke-width", "1px");

		const legendSizeCircles = legendSizeGroupEnter.append("circle")
			.attr("cx", legendPanel.padding[3] + radiusScale.range()[1])
			.attr("cy", d => legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d))
			.attr("r", d => !d ? 0 : radiusScale(d))
			.style("fill", "none")
			.style("stroke", "darkslategray");

		const legendSizeCirclesText = legendSizeGroupEnter.append("text")
			.attr("class", classPrefix + "legendCirclesText")
			.attr("x", legendPanel.padding[3] + radiusScale.range()[1] + legendLineSize + 4)
			.attr("y", (d, i) => i === 1 ? legendPanel.padding[0] + 5 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				i ? legendPanel.padding[0] + 3 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
				legendPanel.padding[0] + 3 + (radiusScale.range()[1] * 2) - 2)
			.text(d => d ? d3.formatPrefix(".0", d)(d) : "0");

		legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

		legendSizeGroup.transition("groupTransition")
			.duration(duration)
			.style("opacity", 1);

		legendSizeGroup.select("." + classPrefix + "legendCirclesText")
			.transition("textTransition")
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		const legendData = chartState.selectedFund.split("/");

		let legendColors = legendPanel.main.selectAll("." + classPrefix + "legendColors")
			.data(legendData);

		const legendColorsExit = legendColors.exit().remove();

		const legendColorsEnter = legendColors.enter()
			.append("g")
			.attr("class", classPrefix + "legendColors");

		const legendRects = legendColorsEnter.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("rx", 1)
			.attr("ry", 1)
			.style("stroke-width", "0.5px")
			.style("stroke", "#666");

		const legendText = legendColorsEnter.append("text")
			.attr("x", 14)
			.attr("y", 9);

		legendColors = legendColorsEnter.merge(legendColors);

		legendColors.attr("transform", (_, i) => "translate(" + legendPanel.padding[3] + "," + (legendPanel.height - legendPanel.padding[2] - legendTextPadding + (+i * legendTextPadding)) + ")");

		legendColors.select("rect")
			.style("fill", d => colors[d]);

		legendColors.select("text")
			.text(d => capitalize(d) + " allocations");

		//end of drawLegend
	};

	function drawBarChart(unfilteredData) {

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		data.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? ((b.cerf + b.cbpf) - (a.cerf + a.cbpf)) :
			b[chartState.selectedFund] - a[chartState.selectedFund]);

		xScale.range([barChartPanel.padding[3], barChartPanel.padding[3] + data.length * barWidth])
			.domain(data.map(d => d.country));

		yScale.domain([0, d3.max(data, d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund])]);

		let barTitleSpanText;

		if (chartState.selectedChart === "allocationsByCountry") {
			barTitleSpanText = chartState.selectedRegion.length === 0 ? "all regions" : textWithCommas(chartState.selectedRegion);
		};

		let barTitle = barChartPanel.main.selectAll("." + classPrefix + "barTitle")
			.data([true]);

		barTitle = barTitle.enter()
			.append("text")
			.attr("class", classPrefix + "barTitle")
			.attr("x", barChartPanel.padding[3] + barChartPanel.titleHorPadding)
			.attr("y", barChartPanel.padding[0] - barChartPanel.titlePadding)
			.merge(barTitle)
			.text((chartState.selectedFund === "total" ? capitalize(chartState.selectedFund) : chartState.selectedFund.toUpperCase()) + " allocations ")
			.append("tspan")
			.attr("class", classPrefix + "barTitleSpan")
			.text("(" + barTitleSpanText + ")");

		const stackedData = stack(data);

		let barsGroups = barChartPanel.main.selectAll("." + classPrefix + "barsGroups")
			.data(stackedData, d => d.key);

		const barGroupsExit = barsGroups.exit().remove();

		const barGroupsEnter = barsGroups.enter()
			.append("g")
			.attr("class", classPrefix + "barsGroups")
			.attr("pointer-events", "none")
			.style("fill", d => colors[d.key]);

		barsGroups = barGroupsEnter.merge(barsGroups);

		let bars = barsGroups.selectAll("." + classPrefix + "bars")
			.data(d => d, d => d.data.country);

		const barsExit = bars.exit()
			.transition()
			.duration(duration)
			.attr("height", 0)
			.attr("y", barChartPanel.height - barChartPanel.padding[2])
			.style("opacity", 0)
			.remove();

		const barsEnter = bars.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.attr("width", xScale.bandwidth())
			.attr("height", 0)
			.attr("y", yScale(0))
			.attr("x", d => xScale(d.data.country))

		bars = barsEnter.merge(bars);

		bars.transition()
			.duration(duration)
			.attr("x", d => xScale(d.data.country))
			.attr("y", d => d[0] === d[1] ? yScale(0) : yScale(d[1]))
			.attr("height", d => yScale(d[0]) - yScale(d[1]));

		let barsTooltipRectangles = barChartPanel.main.selectAll("." + classPrefix + "barsTooltipRectangles")
			.data(data, d => d.country);

		const barsTooltipRectanglesExit = barsTooltipRectangles.exit().remove();

		const barsTooltipRectanglesEnter = barsTooltipRectangles.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTooltipRectangles")
			.attr("pointer-events", "all")
			.style("opacity", 0)
			.attr("y", barChartPanel.padding[0])
			.attr("height", barChartPanel.height - barChartPanel.padding[0] - barChartPanel.padding[2])
			.attr("width", xScale.step())
			.attr("x", d => xScale(d.country) - xScale.bandwidth() / 2);

		barsTooltipRectangles = barsTooltipRectanglesEnter.merge(barsTooltipRectangles);

		barsTooltipRectangles.transition()
			.duration(duration)
			.attr("x", d => xScale(d.country) - xScale.bandwidth() / 2);

		xAxisGroup.transition()
			.duration(duration)
			.call(xAxis);

		yAxis.tickSizeInner(-(xScale.range()[1] - barChartPanel.padding[3]));

		yAxisGroup.transition()
			.duration(duration)
			.call(yAxis);

		yAxisGroup.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		barsTooltipRectangles.on("mouseover", mouseoverBarsTooltipRectangles)
			.on("mouseout", mouseoutBarsTooltipRectangles);

		function mouseoverBarsTooltipRectangles(_, d) {

			bars.style("opacity", e => e.data.country === d.country ? 1 : fadeOpacity);

			xAxisGroup.selectAll(".tick")
				.style("opacity", e => e === d.country ? 1 : fadeOpacity);

			piesContainer.selectAll("." + classPrefix + "pieGroup")
				.style("opacity", fadeOpacity);

			const thisPieGroup = piesContainer.selectAll("." + classPrefix + "pieGroup")
				.filter(e => e.country === d.country);

			thisPieGroup.style("opacity", 1);
			thisPieGroup.select("text")
				.style("display", (_, i, n) => {
					localVariable.set(n[i], d3.select(n[i]).style("display"));
					return null;
				});

			tooltipDivBarChart.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltipDivBarChart.append("div")
				.style("max-width", "300px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.html("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");

			const thisBox = event.currentTarget.getBoundingClientRect();

			const containerBox = barChartDiv.node().getBoundingClientRect();

			const tooltipBox = tooltipDivBarChart.node().getBoundingClientRect();

			const thisOffsetTop = (containerBox.height / 2) - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + tooltipMargin ?
				thisBox.left - containerBox.left + thisBox.width + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltipDivBarChart.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

		};

		function mouseoutBarsTooltipRectangles(_, d) {

			bars.style("opacity", 1);

			xAxisGroup.selectAll(".tick")
				.style("opacity", 1);

			piesContainer.selectAll("." + classPrefix + "pieGroup")
				.style("opacity", 1)
				.filter(e => e.country === d.country)
				.select("text")
				.style("display", (_, i, n) => localVariable.get(n[i]));

			tooltipDivBarChart.html(null)
				.style("display", "none");
		};

		//end of drawBarChart
	};

	function createColumnTopValues(originalData) {

		//Filter this based on the second column chart or not????

		const numberOfProjects = new Set(),
			numberOfPartners = new Set();

		const numberOfCountries = originalData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]).length;

		const totalAllocations = d3.sum(originalData, d => chartState.selectedFund === "cerf/cbpf" ? d.total : d[chartState.selectedFund]);

		originalData.forEach(row => {
			row.allocationsList.forEach(allocation => {
				if (chartState.selectedFund === "total" ||
					chartState.selectedFund === "cerf/cbpf" ||
					lists.fundTypesList[allocation.FundId] === chartState.selectedFund) {
					allocation.ProjList.toString().split("##").forEach(e => numberOfProjects.add(e));
					allocation.OrgList.toString().split("##").forEach(e => numberOfPartners.add(e));;
				};
			});
		});

		const updateTransition = d3.transition()
			.duration(duration);

		if (chartState.selectedChart === "allocationsByCountry") {

			selections.byCountryAllocationsValue.transition(updateTransition)
				.textTween((_, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, totalAllocations);
					return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
				});

			selections.byCountryAllocationsText.text((chartState.selectedFund === "total" || chartState.selectedFund === "cerf/cbpf" ? "Total" :
				chartState.selectedFund.toUpperCase()) + " allocations");

			selections.byCountryCountriesValue.transition(updateTransition)
				.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfCountries));

			selections.byCountryProjectsValue.transition(updateTransition)
				.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfProjects.size));

			selections.byCountryPartnersValue.transition(updateTransition)
				.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, numberOfPartners.size));

		};

		//end of createColumnTopValues
	};

	function createColumnChart(originalData) {

		if (chartState.selectedChart === "allocationsByCountry") {
			const columnData = originalData.reduce((acc, curr) => {
				const foundRegion = acc.find(e => e.region === curr.region);
				if (foundRegion) {
					foundRegion.total += chartState.selectedFund === "total" ? curr.total : 0;
					foundRegion.cerf += chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr.cerf : 0;
					foundRegion.cbpf += chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr.cbpf : 0;
				} else {
					acc.push({
						region: curr.region,
						total: chartState.selectedFund === "total" ? curr.total : 0,
						cerf: chartState.selectedFund === "cerf" || chartState.selectedFund === "cerf/cbpf" ? curr.cerf : 0,
						cbpf: chartState.selectedFund === "cbpf" || chartState.selectedFund === "cerf/cbpf" ? curr.cbpf : 0,
					});
				};
				return acc;
			}, []);
			columnData.sort((a, b) => chartState.selectedFund === "cerf/cbpf" ? ((b.cerf + b.cbpf) - (a.cerf + a.cbpf)) :
				b[chartState.selectedFund] - a[chartState.selectedFund]);
			createAllocationsByCountryColumnChart(columnData)
		};
		if (chartState.selectedChart === "allocationsBySector") createAllocationsBySectorColumnChart(columnData);
		if (chartState.selectedChart === "allocationsByType") createAllocationsByTypeColumnChart(columnDataType);

		function createAllocationsByCountryColumnChart(columnData) {

			const filteredData = columnData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

			yScaleColumnByCountry.domain(filteredData.map(e => e.region));

			xScaleColumnByCountry.domain([0, d3.max(filteredData, e => chartState.selectedFund === "total" ? e.total : e.cbpf + e.cerf)]);

			const stackedData = stack(filteredData);

			let barsGroupsColumn = svgColumnChart.selectAll("." + classPrefix + "barsGroupsColumn")
				.data(stackedData, d => d.key);

			const barsGroupsColumnExit = barsGroupsColumn.exit().remove();

			const barsGroupsColumnEnter = barsGroupsColumn.enter()
				.append("g")
				.attr("class", classPrefix + "barsGroupsColumn")
				.attr("pointer-events", "none")
				.style("fill", d => colors[d.key]);

			barsGroupsColumn = barsGroupsColumnEnter.merge(barsGroupsColumn);

			let barsColumn = barsGroupsColumn.selectAll("." + classPrefix + "barsColumn")
				.data(d => d, d => d.data.region);

			const barsColumnExit = barsColumn.exit()
				.transition()
				.duration(duration)
				.attr("width", 0)
				.attr("x", svgColumnChartPaddingByCountry[3])
				.style("opacity", 0)
				.remove();

			const barsColumnEnter = barsColumn.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumn")
				.attr("height", yScaleColumnByCountry.bandwidth())
				.attr("width", 0)
				.attr("x", xScaleColumnByCountry(0))
				.attr("y", d => yScaleColumnByCountry(d.data.region))

			barsColumn = barsColumnEnter.merge(barsColumn);

			barsColumn.transition()
				.duration(duration)
				.attr("height", yScaleColumnByCountry.bandwidth())
				.attr("y", d => yScaleColumnByCountry(d.data.region))
				.attr("x", d => d[0] === d[1] ? xScaleColumnByCountry(0) : xScaleColumnByCountry(d[0]))
				.attr("width", d => xScaleColumnByCountry(d[1]) - xScaleColumnByCountry(d[0]));

			let barsColumnTooltipRectangles = svgColumnChart.selectAll("." + classPrefix + "barsColumnTooltipRectangles")
				.data(filteredData, d => d.region);

			const barsColumnTooltipRectanglesExit = barsColumnTooltipRectangles.exit().remove();

			const barsColumnTooltipRectanglesEnter = barsColumnTooltipRectangles.enter()
				.append("rect")
				.attr("class", classPrefix + "barsColumnTooltipRectangles")
				.attr("pointer-events", "all")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("x", svgColumnChartPaddingByCountry[3])
				.attr("width", svgColumnChartWidth - svgColumnChartPaddingByCountry[1] - svgColumnChartPaddingByCountry[3])
				.attr("height", yScaleColumnByCountry.step())
				.attr("y", d => yScaleColumnByCountry(d.region) - yScaleColumnByCountry.bandwidth() / 2);

			barsColumnTooltipRectangles = barsColumnTooltipRectanglesEnter.merge(barsColumnTooltipRectangles);

			barsColumnTooltipRectangles.transition()
				.duration(duration)
				.attr("y", d => yScaleColumnByCountry(d.region) - yScaleColumnByCountry.bandwidth() / 2);

			barsColumnTooltipRectangles.on("mouseover", mouseoverBarsColumnTooltipRectangles)
				.on("mouseout", mouseoutBarsColumnTooltipRectangles);

			function mouseoverBarsColumnTooltipRectangles(event, d) {
				console.log(d);
				chartState.selectedRegion = [d.region];
				const data = filterData(originalData);

				createColumnTopValues(originalData);

				drawMap(data);
				drawLegend(data);
				drawBarChart(data);
			};

			function mouseoutBarsColumnTooltipRectangles(event, d) {

			};

			xAxisGroupColumn.transition()
				.duration(duration)
				.call(xAxisColumnByCountry);

			xAxisGroupColumn.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			yAxisGroupColumn.transition()
				.duration(duration)
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxisColumnByCountry);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => d.split(" ")[0] === "South-Eastern" ? "South-East." : d.split(" ")[0])
					.attr("x", -(yAxisColumnByCountry.tickPadding() + yAxisColumnByCountry.tickSize()))
					.attr("dy", "-0.3em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxisColumnByCountry.tickPadding() + yAxisColumnByCountry.tickSize()))
					.text(d => d.split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

		};

		function createAllocationsBySectorColumnChart(columnData) {


		};

		function createAllocationsByTypeColumnChart(columnDataType) {


		};

		//end of createColumnChart
	};

	function filterData(originalData) {

		const data = [];

		originalData.forEach(row => {
			const copiedRow = Object.assign({}, row);
			if (chartState.selectedChart === "allocationsByCountry") {
				if (chartState.selectedFund === "total") {
					copiedRow.cbpf = 0;
					copiedRow.cerf = 0;
				};
				if (chartState.selectedFund === "cerf/cbpf") {
					copiedRow.total = 0;
				};
				if (chartState.selectedFund === "cerf") {
					copiedRow.cbpf = 0;
					copiedRow.total = 0;
				};
				if (chartState.selectedFund === "cbpf") {
					copiedRow.cerf = 0;
					copiedRow.total = 0;
				};
				if (chartState.selectedRegion.length === 0) {
					data.push(copiedRow);
				} else {
					if (chartState.selectedRegion.indexOf(copiedRow.region) > -1) data.push(copiedRow);
				};
			};

		});

		return data;

		//end of filterData
	};

	function verifyCentroids(data) {
		data.forEach(function(row) {
			if (!centroids[row.isoCode] || isNaN(centroids[row.isoCode].x) || isNaN(centroids[row.isoCode].y)) {
				if (!isNaN(lists.fundLatLongList[row.isoCode][0]) || !isNaN(lists.fundLatLongList[row.isoCode][1])) {
					centroids[row.isoCode] = {
						x: mapProjection([lists.fundLatLongList[row.isoCode][1], lists.fundLatLongList[row.isoCode][0]])[0],
						y: mapProjection([lists.fundLatLongList[row.isoCode][1], lists.fundLatLongList[row.isoCode][0]])[1]
					};
				} else {
					centroids[row.isoCode] = {
						x: mapProjection([0, 0])[0],
						y: mapProjection([0, 0])[1]
					};
					console.log(row);
					console.warn("Attention: " + row.isoCode + "(" + row.countryName + ") has no centroid");
				};
			};
		});
	};

	return draw;

};

function displayLabels(labelSelection) {
	labelSelection.each(function(d) {
		const outerElement = this;
		const outerBox = this.getBoundingClientRect();
		labelSelection.each(function(e) {
			if (outerElement !== this) {
				const innerBox = this.getBoundingClientRect();
				if (!(outerBox.right < innerBox.left ||
						outerBox.left > innerBox.right ||
						outerBox.bottom < innerBox.top ||
						outerBox.top > innerBox.bottom)) {
					if (chartState.selectedFund === "total" ? e.total < d.total : (e.cbpf + e.cerf) < (d.cbpf + d.cerf)) {
						d3.select(this).style("display", "none");
						d3.select(this.previousSibling).style("display", "none");
					} else {
						d3.select(outerElement).style("display", "none");
						d3.select(outerElement.previousSibling).style("display", "none");
					};
				};
			};
		});
	});
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

function wrapText(text, width) {
	text.each(function() {
		let text = d3.select(this),
			words = text.text() === "Latin America and the Caribbean" ? ["America", "Latin"] :
			text.text() === "South-Eastern Asia" ? ["Asia", "South-East."] :
			text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.2,
			y = text.attr("y"),
			x = text.attr("x"),
			dy = words.length > 1 ? -0.2 : 0.3,
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

function wrapText2(text, width) {
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

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function textWithCommas(arr) {
	return arr.reduce((acc, curr, index) => acc + (index >= arr.length - 2 ? index > arr.length - 2 ? curr : curr + " and " : curr + ", "), "");
};

export {
	createAllocations
};