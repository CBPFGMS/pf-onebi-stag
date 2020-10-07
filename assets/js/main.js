//|device features
const isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches);

//|set constants
const chartState = {
		selectedYear: null,
		selectedChart: null
	},
	generalClassPrefix = "pfbihp",
	defaultChart = "allocationsCountry",
	localStorageTime = 3600000,
	currentDate = new Date(),
	localVariable = d3.local(),
	duration = 1000,
	defaultValuesUrl = "https://cbpfgms.github.io/pf-onebi-data/map/defaultvalues.json",
	unworldmapUrl = "https://cbpfgms.github.io/pf-onebi-data/map/unworldmap.json",
	masterFundsUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstCountry.json",
	masterDonorsUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstDonor.json",
	masterAllocationTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstAllocation.json",
	masterFundTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstFund.json",
	masterPartnerTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstOrganization.json",
	masterClusterTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstCluster.json",
	contributionsDataUrl = "https://cbpfgms.github.io/pf-onebi-data/contributionSummary.csv",
	allocationsDataUrl = "https://cbpfgms.github.io/pf-onebi-data/allocationSummary.csv",
	chartTypesAllocations = ["allocationsCountry", "allocationsSector", "allocationsType"],
	chartTypesContributions = ["contributionsDonor", "contributionsCerfCbpf"];

//|constants populated with the data
const yearsArrayAllocations = [],
	yearsArrayContributions = [],
	donorsInSelectedYear = [],
	fundsInSelectedYear = [],
	fundNamesList = {},
	fundRegionsList = {},
	donorNamesList = {},
	donorTypesList = {},
	partnersList = {},
	clustersList = {},
	allocationTypesList = {},
	fundNamesListKeys = [],
	donorNamesListKeys = [],
	topValues = {
		contributions: 0,
		allocations: 0,
		donors: new Set(),
		projects: new Set()
	};

//|set variables
let spinnerContainer,
	drawAllocationsByCountry,
	drawContributionsByDonor;

//|selections
const selections = {
	chartContainerDiv: d3.select("#main-map-panel").append("div").attr("class", generalClassPrefix + "chartContainerDiv"),
	allocationsTopFigure: d3.select("#high-level-fugure-allocations"),
	contributionsTopFigure: d3.select("#high-level-fugure-contributions"),
	donorsTopFigure: d3.select("#high-level-fugure-donors"),
	projectsTopFigure: d3.select("#high-level-fugure-projects"),
	yearDropdown: d3.select("#ddlDropdown"),
	navlinkAllocationsByCountry: d3.select("#navAllocationsByCountry"),
	navlinkAllocationsBySector: d3.select("#navAllocationsBySector"),
	navlinkAllocationsByType: d3.select("#navAllocationsByType"),
	navlinkContributionsByCerfCbpf: d3.select("#navContributionsByCerfCbpf"),
	navlinkContributionsByDonor: d3.select("#navContributionsByDonor"),
};

createSpinner(selections.chartContainerDiv);

//|import modules
import {
	createAllocationsByCountry
} from "./allocationsbycountry.js";

import {
	createContributionsByDonor
} from "./contributionsbydonor.js";


//|load master tables, default values and csv data
Promise.all([fetchFile("defaultValues", defaultValuesUrl, "default values", "json"),
		fetchFile("unworldmap", unworldmapUrl, "world map", "json"),
		fetchFile("masterFunds", masterFundsUrl, "master table for funds", "json"),
		fetchFile("masterDonors", masterDonorsUrl, "master table for donors", "json"),
		fetchFile("masterAllocationTypes", masterAllocationTypesUrl, "master table for allocation types", "json"),
		fetchFile("masterFundTypes", masterFundTypesUrl, "master table for fund types", "json"),
		fetchFile("masterPartnerTypes", masterPartnerTypesUrl, "master table for partner types", "json"),
		fetchFile("masterClusterTypes", masterClusterTypesUrl, "master table for cluster types", "json"),
		fetchFile("allocationsData", allocationsDataUrl, "allocations data", "csv"),
		fetchFile("contributionsData", contributionsDataUrl, "contributions data", "csv")
	])
	.then(rawData => controlCharts(rawData));

function controlCharts([defaultValues,
	worldMap,
	masterFunds,
	masterDonors,
	masterAllocationTypes,
	masterFundTypes,
	masterPartnerTypes,
	masterClusterTypes,
	rawAllocationsData,
	rawContributionsData
]) {

	// console.log(defaultValues)
	// console.log(worldMap)
	// console.log(masterFunds)
	// console.log(masterDonors)
	// console.log(masterAllocationTypes)
	// console.log(masterFundTypes)
	// console.log(masterPartnerTypes)
	// console.log(rawAllocationsData)
	// console.log(rawContributionsData)

	createFundNamesList(masterFunds);
	createDonorNamesList(masterDonors);
	createPartnersList(masterPartnerTypes);
	createClustersList(masterClusterTypes);
	createAllocationTypesList(masterAllocationTypes);

	preProcessData(rawAllocationsData, rawContributionsData);

	validateDefault(defaultValues);

	resetTopValues(topValues);

	const allocationsData = processDataAllocations(rawAllocationsData);

	const contributionsData = processDataContributions(rawContributionsData);

	spinnerContainer.remove();

	updateTopFigures(topValues, selections);

	populateYearDropdown(yearsArrayAllocations, selections.yearDropdown);

	selections.yearDropdown.on("change", event => {
		chartState.selectedYear = +event.target.value;
		resetTopValues(topValues);
		const allocationsData = processDataAllocations(rawAllocationsData);
		const contributionsData = processDataContributions(rawContributionsData);
		updateTopFigures(topValues, selections);
		if (chartState.selectedChart === "allocationsCountry") drawAllocationsByCountry(allocationsData);
		if (chartState.selectedChart === "contributionsDonor") drawContributionsByDonor(contributionsData);
	});

	selections.navlinkAllocationsByCountry.on("click", () => {
		if (chartState.selectedChart === "allocationsCountry") return;
		chartState.selectedChart = "allocationsCountry";
		selections.chartContainerDiv.selectChildren().remove();
		drawAllocationsByCountry = createAllocationsByCountry(selections);
		drawAllocationsByCountry(allocationsData);
	});

	selections.navlinkAllocationsBySector.on("click", () => {
		if (chartState.selectedChart === "allocationsSector") return;
		chartState.selectedChart = "allocationsSector";
	});

	selections.navlinkAllocationsByType.on("click", () => {
		if (chartState.selectedChart === "allocationsType") return;
		chartState.selectedChart = "allocationsType";
	});

	selections.navlinkContributionsByCerfCbpf.on("click", () => {
		if (chartState.selectedChart === "contributionsCerfCbpf") return;
		chartState.selectedChart = "contributionsCerfCbpf";
	});

	selections.navlinkContributionsByDonor.on("click", () => {
		if (chartState.selectedChart === "contributionsDonor") return;
		chartState.selectedChart = "contributionsDonor";
		selections.chartContainerDiv.selectChildren().remove();
		drawContributionsByDonor = createContributionsByDonor(selections);
		drawContributionsByDonor(contributionsData);
	});

	//end of controlCharts
};

function preProcessData(rawAllocationsData, rawContributionsData) {

	const yearsSetAllocations = new Set();
	const yearsSetContributions = new Set();

	rawAllocationsData.forEach(row => {
		yearsSetAllocations.add(+row.AllocationYear);
	});

	rawContributionsData.forEach(row => {
		yearsSetContributions.add(+row.FiscalYear);
	});

	yearsArrayAllocations.push(...yearsSetAllocations);
	yearsArrayAllocations.sort((a, b) => a - b);
	yearsArrayContributions.push(...yearsSetContributions);
	yearsArrayContributions.sort((a, b) => a - b);

};

function processDataAllocations(rawAllocationsData) {

	const data = [];

	rawAllocationsData.forEach(row => {
		if (row.AllocationYear === chartState.selectedYear) {
			topValues.allocations += row.ClusterBudget;
			row.ProjList.toString().split("##").forEach(e => topValues.projects.add(e));
		};
	});

	return data;

};

function processDataContributions(rawContributionsData) {

	const data = [];

	rawContributionsData.forEach(row => {
		if (row.FiscalYear === chartState.selectedYear) {
			topValues.contributions += +row.PaidAmt;
			topValues.donors.add(row.DonorId);
		};
	});

	return data;

};


function fetchFile(fileName, url, warningString, method) {
	if (localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
		const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
			JSON.parse(localStorage.getItem(fileName)).data;
		console.info("PFBI chart info: " + warningString + " from local storage");
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunction = method === "csv" ? d3.autoType : null;
		return fetchMethod(url, rowFunction).then(fetchedData => {
			try {
				localStorage.setItem(fileName, JSON.stringify({
					data: method === "csv" ? d3.csvFormat(fetchedData) : fetchedData,
					timestamp: currentDate.getTime()
				}));
			} catch (error) {
				console.info("PFBI chart, " + error);
			};
			console.info("PFBI chart info: " + warningString + " from API");
			return fetchedData;
		});
	};
};

function updateTopFigures(topValues, selections) {

	const updateTransition = d3.transition()
		.duration(duration);

	selections.contributionsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, topValues.contributions);
			return t => formatSIFloat(interpolator(t)).replace("G", "B");
		});

	selections.allocationsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, topValues.allocations);
			return t => formatSIFloat(interpolator(t)).replace("G", "B");
		});

	selections.donorsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, topValues.donors.size));

	selections.projectsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => d3.interpolateRound(n[i].textContent || 0, topValues.projects.size));

};

function populateYearDropdown(yearData, dropdownContainer) {

	let yearDropdownOptions = dropdownContainer.selectAll(`.${generalClassPrefix}yearDropdownOptions`)
		.data(yearData.slice().reverse());

	const yearDropdownOptionsExit = yearDropdownOptions.exit().remove();

	const yearDropdownOptionsEnter = yearDropdownOptions.enter()
		.append("option")
		.attr("class", generalClassPrefix + "yearDropdownOptions")
		.html(d => d)
		.attr("value", d => d);

	yearDropdownOptions = yearDropdownOptionsEnter.merge(yearDropdownOptions);

	yearDropdownOptions.property("selected", d => chartState.selectedYear === d);

};

function validateDefault(values) {
	chartState.selectedChart = chartTypesAllocations.indexOf(values.chart) > -1 || chartTypesContributions.indexOf(values.chart) > -1 ?
		values.chart : defaultChart;
	const yearArray = chartTypesAllocations.indexOf(chartState.selectedChart) > -1 ? yearsArrayAllocations : yearsArrayContributions;
	chartState.selectedYear = +values.year === +values.year && yearArray.indexOf(+values.year) > -1 ?
		+values.year : currentDate.getFullYear();
};

function createFundNamesList(fundsData) {
	fundsData;
	fundsData.forEach(row => {
		fundNamesList[row.id + ""] = row.PooledFundName;
		fundNamesListKeys.push(row.id + "");
	});
};

function createDonorNamesList(donorsData) {
	donorsData.forEach(row => {
		donorNamesList[row.id + ""] = row.donorName;
		donorNamesListKeys.push(row.id + "");
		donorTypesList[row.id + ""] = row.donorType;
	});
};

function createPartnersList(partnersData) {
	partnersData.forEach(row => {
		partnersList[row.id + ""] = row.OrganizationTypeName;
	});
};

function createClustersList(clustersData) {
	clustersData.forEach(row => {
		clustersList[row.id + ""] = row.ClustNm;
	});
};

function createAllocationTypesList(allocationTypesData) {
	allocationTypesData.forEach(row => {
		allocationTypesList[row.id + ""] = row.AllocationName;
	});
};

function resetTopValues(obj) {
	for (const key in obj) typeof obj[key] === "number" ? obj[key] = 0 : obj[key].clear();
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

function createSpinner(container) {
	spinnerContainer = container.append("div")
		.attr("class", generalClassPrefix + "spinnerContainer");

	spinnerContainer.append("div")
		.attr("class", generalClassPrefix + "spinnerText")
		.html("Loading data");

	spinnerContainer.append("div")
		.attr("class", generalClassPrefix + "spinnerSymbol")
		.append("i")
		.attr("class", "fas fa-spinner fa-spin");
};