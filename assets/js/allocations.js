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
	legendPanelHorPadding = 2,
	legendPanelVertPadding = 12,
	mapZoomButtonHorPadding = 6,
	mapZoomButtonVertPadding = 10,
	mapZoomButtonSize = 26,
	maxPieSize = 32,
	minPieSize = 1,
	formatPercent = d3.format("%"),
	svgMapPadding = [0, 10, 0, 10],
	svgBarChartPadding = [4, 4, 4, 4],
	buttonsList = ["total", "cerf", "cbpf"],
	centroids = {};

//|variables
let svgMapWidth,
	svgMapHeight;

//|hardcoded locations
const hardcodedAllocations = [{
	isoCode: "0E",
	long: 0,
	lat: 0
}, {
	isoCode: "0G",
	long: 0,
	lat: 0
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
	const svgMapHeight = mapDivSize.height;
	const svgMapWidth = mapDivSize.width;
	const svgMapPanelWidth = svgMapWidth / svgMapHeight < mapAspectRatio ? svgMapWidth - svgMapPadding[1] - svgMapPadding[3] :
		(svgMapHeight * mapAspectRatio) - svgMapPadding[1] - svgMapPadding[3];

	const mapInnerDiv = mapDiv.append("div")
		.attr("class", classPrefix + "mapInnerDiv");

	const svgMap = mapInnerDiv.append("svg")
		.attr("viewBox", "0 0 " + svgMapWidth + " " + svgMapHeight)
		.style("background-color", "white");

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

	const mapPanelClip = mapPanel.main.append("clipPath")
		.attr("id", classPrefix + "mapPanelClip")
		.append("rect")
		.attr("width", mapPanel.width)
		.attr("height", mapPanel.height);

	mapPanel.main.attr("clip-path", `url(#${classPrefix}mapPanelClip)`);

	const mapContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "mapContainer");

	const zoomLayer = mapPanel.main.append("g")
		.attr("class", classPrefix + "zoomLayer")
		.style("opacity", 0)
		.attr("cursor", "move")
		.attr("pointer-events", "all");

	const zoomRectangle = zoomLayer.append("rect")
		.attr("width", mapPanel.width)
		.attr("height", mapPanel.height);

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

	mapPanel.main.call(zoom);

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

	createMapButtons();

	function draw(data, chartType) {

		verifyCentroids(data);

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

		countryFeatures.features.forEach(function(d) {
			centroids[d.properties.ISO_2] = {
				x: mapPath.centroid(d.geometry)[0],
				y: mapPath.centroid(d.geometry)[1]
			}
		});

		//Countries with problems:
		//And the fake codes: 0E (Eastern Africa) and 0G (Global)
		hardcodedAllocations.forEach(function(d) {
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

	function createMapButtons() {
		const buttons = buttonsDiv.selectAll(null)
			.data(buttonsList)
			.enter()
			.append("button")
			.attr("id", d => classPrefix + d)
			.html(d => capitalize(d));
	};

	function verifyCentroids(data) {
		data.forEach(function(row) {
			if (!centroids[row.isoCode]) {
				if (!isNaN(lists.fundLatLongList[row.isoCode][0]) || !isNaN(lists.fundLatLongList[row.isoCode][1])) {
					centroids[row.isoCode] = {
						x: lists.fundLatLongList[row.isoCode][0],
						y: lists.fundLatLongList[row.isoCode][1]
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

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

export {
	createAllocations
};