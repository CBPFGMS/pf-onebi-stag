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
	svgMapPadding = [0, 4, 0, 4],
	svgBarChartPadding = [4, 4, 4, 4],
	centroids = {};

//|variables
let svgMapWidth,
	svgMapHeight;

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

	const mapDivSize = mapDiv.node().getBoundingClientRect();
	const svgMapHeight = mapDivSize.height;
	const mapDivWidth = mapDivSize.width;
	const svgMapWidth = mapDivWidth / svgMapHeight < mapAspectRatio ? mapDivWidth :
		svgMapHeight * mapAspectRatio;

	const mapInnerDiv = mapDiv.append("div")
		.attr("class", classPrefix + "mapInnerDiv")
		.style("width", svgMapWidth + "px");

	const svgMap = mapInnerDiv.append("svg")
		.attr("viewBox", "0 0 " + svgMapWidth + " " + svgMapHeight)
		.style("background-color", "white");

	const mapPanel = {
		main: svgMap.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + svgMapPadding[3] + "," + svgMapPadding[0] + ")"),
		width: svgMapWidth - svgMapPadding[1] - svgMapPadding[3],
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
		//"KM","WS","AG","DM","MH","CV"
		//Comoros, (west) Samoa, Antigua and Barbuda, Dominica, Marshall Islands, Cabo Verde
		//And the fake codes: XX, XV, XA and XG
		// hardcodedAllocations.forEach(function(d) {
		// 	const projected = mapProjection([d.long, d.lat]);
		// 	centroids[d.isoCode] = {
		// 		x: projected[0],
		// 		y: projected[1]
		// 	};
		// });

	};

	function verifyCentroids(data) {
		data.forEach(function(row) {
			if (!centroids[row.isoCode]) {
				centroids[row.isoCode] = {
					x: mapProjection([0, 0])[0],
					y: mapProjection([0, 0])[1]
				};
				console.log(row);
				console.warn("Attention: " + row.isoCode + "(" + row.countryName + ") has no centroid");
			};
		});
	};

	return draw;

};

export {
	createAllocations
};