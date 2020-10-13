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
	legendPanelHorPadding = 20,
	legendPanelVertPadding = 12,
	mapZoomButtonHorPadding = 24,
	mapZoomButtonVertPadding = 10,
	mapZoomButtonSize = 26,
	maxPieSize = 32,
	minPieSize = 1,
	legendLineSize = 38,
	showNamesMargin = 12,
	duration = 1000,
	strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5,
	groupNamePadding = 2,
	localVariable = d3.local(),
	formatPercent = d3.format("%"),
	svgMapPadding = [0, 10, 0, 10],
	svgBarChartPadding = [4, 4, 4, 4],
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
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

	const tooltipDiv = containerDiv.append("div")
		.attr("id", classPrefix + "tooltipDiv")
		.style("display", "none");

	const mapDiv = containerDiv.append("div")
		.attr("class", classPrefix + "mapDiv")
		.style("height", formatPercent(mapPercentage));

	const barChartDiv = containerDiv.append("div")
		.attr("class", classPrefix + "barChartDiv")
		.style("height", formatPercent(barChartPercentage));

	const buttonsDiv = mapDiv.append("div")
		.attr("class", classPrefix + "buttonsDiv");

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
		padding: [30, 0, 12, 4]
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
		padding: [0, 0, 0, 0]
	};

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

		//create second column with originalData

		const data = filterData(originalData);

		drawMap(data);

		drawLegend(data);

		drawBarChart(data);

		const mapButtons = buttonsDiv.selectAll("button");

		mapButtons.on("click", (event, d) => {
			chartState.selectedFund = d;

			mapButtons.classed("active", d => chartState.selectedFund === d);

			const data = filterData(originalData);

			drawMap(data);
			drawLegend(data);
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
			.html((d, i) => " " + (i === 1 ? "Cerf/Cbpf" : capitalize(d)));
	};

	function drawMap(unfilteredData) {

		clickableButtons = false;

		const data = unfilteredData.filter(d => chartState.selectedFund === "cerf/cbpf" ? d.cerf + d.cbpf : d[chartState.selectedFund]);

		zoom.on("zoom", zoomed);

		const currentTransform = d3.zoomTransform(svgMap.node());

		data.sort((a, b) => b.total - a.total || (b.cbpf + b.cerf) - (a.cbpf + a.cerf));

		const maxValue = d3.max(data, d => chartState.selectedFund === "total" ? d.total : d.cbpf + d.cerf);

		radiusScale.domain([0, maxValue || 0]);

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

		//pieGroup.on("mouseover", pieGroupMouseover);

		//zoomRectangle.on("mouseover", pieGroupMouseout);

		function zoomed(event) {

			mapContainer.attr("transform", event.transform);

			mapContainer.select("path:nth-child(2)")
				.style("stroke-width", 1 / event.transform.k + "px");

			pieGroup.attr("transform", d => "translate(" + (centroids[d.isoCode].x * event.transform.k + event.transform.x) +
				"," + (centroids[d.isoCode].y * event.transform.k + event.transform.y) + ")");

			if (!chartState.showNames) {
				allTexts.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
			};

			//end of zoomed
		};

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomInGroupMap")
			.on("click", function() {
				zoom.scaleBy(mapPanel.main.transition().duration(duration), 2);
			});

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomOutGroupMap")
			.on("click", function() {
				zoom.scaleBy(mapPanel.main.transition().duration(duration), 0.5);
			});

		// function pieGroupMouseover(datum) {

		// 	currentHoveredElem = this;

		// 	pieGroup.style("opacity", function() {
		// 		return this === currentHoveredElem ? 1 : fadeOpacity;
		// 	});

		// 	tooltip.style("display", "block")
		// 		.html(null);

		// 	tooltip.on("mouseleave", null);

		// 	createCountryTooltip(datum, false);

		// 	const thisBox = this.getBoundingClientRect();

		// 	const containerBox = containerDiv.node().getBoundingClientRect();

		// 	const tooltipBox = tooltip.node().getBoundingClientRect();

		// 	const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

		// 	const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
		// 		(thisBox.left + 2 * (radiusScale(datum.cbpf + datum.cerf) * (containerBox.width / width))) - containerBox.left + tooltipMargin :
		// 		thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

		// 	tooltip.style("top", thisOffsetTop + "px")
		// 		.style("left", thisOffsetLeft + "px");

		// };

		// function pieGroupMouseout() {

		// 	if (isSnapshotTooltipVisible) return;

		// 	currentHoveredElem = null;

		// 	pieGroup.style("opacity", 1);

		// 	tooltip.html(null)
		// 		.style("display", "none");

		// };


		//end of drawMap
	};

	function drawLegend(data) {

		const maxDataValue = radiusScale.domain()[1];

		const sizeCirclesData = [0, maxDataValue / 4, maxDataValue / 2, maxDataValue];

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

		const legendSizeGroupEnter = legendSizeGroup.enter()
			.append("g")
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

		legendSizeGroup.select("." + classPrefix + "legendCirclesText")
			.transition()
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

		legendColors.attr("transform", (_, i) => "translate(" + legendPanel.padding[3] + "," + (legendPanel.height - legendPanel.padding[2] - 18 + (+i * 18)) + ")");

		legendColors.select("rect")
			.style("fill", d => colors[d]);

		legendColors.select("text")
			.text(d => capitalize(d) + " allocations");

		//end of drawLegend
	};

	function drawBarChart(data) {


		//end of drawBarChart
	};

	function filterData(originalData) {

		const data = [];

		originalData.forEach(row => {
			const copiedRow = Object.assign({}, row);
			if (chartState.selectedChart === "allocationsCountry") {
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

export {
	createAllocations
};