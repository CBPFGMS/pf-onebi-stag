//|import modules


//|device features
const isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches);

//|set constants
const chartState = {
		selectedYear: null,
		selectedChart: null
	},
	defaultChart = "allocationsCountry",
	localStorageTime = 3600000,
	currentDate = new Date(),
	defaultValuesUrl = "./assets/data/defaultvalues.json",
	masterCountriesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstCountry.json",
	masterAllocationTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstAllocation.json",
	masterFundTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstFund.json",
	masterPartnerTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstOrganization.json",
	masterClusterTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstCluster.json",
	contributionsDataUrl = "https://cbpfgms.github.io/pf-onebi-data/contributionSummary.csv",
	allocationsDataUrl = "https://cbpfgms.github.io/pf-onebi-data/allocationSummary.csv",
	chartTypesAllocations = ["allocationsCountry", "allocationsSector", "allocationsType"],
	chartTypesContributions = ["contributionsCountry", "contributionsCerfCbpf"];

//|constants populated with the data
const yearsArrayAllocations = [],
	yearsArrayContributions = [];


//|set variables
let spinnerContainer;

//|selections
const selections = {
	containerDiv: d3.select("#containerDiv") //THIS WILL CHANGE
};


createSpinner();

//|load master tables, default values and csv data
Promise.all([fetchFile("defaultValues", defaultValuesUrl, "default values", "json"),
		fetchFile("masterCountries", masterCountriesUrl, "master table for countries", "json"),
		fetchFile("masterAllocationTypes", masterAllocationTypesUrl, "master table for allocation types", "json"),
		fetchFile("masterFundTypes", masterFundTypesUrl, "master table for fund types", "json"),
		fetchFile("masterPartnerTypes", masterPartnerTypesUrl, "master table for partner types", "json"),
		fetchFile("masterClusterTypes", masterClusterTypesUrl, "master table for cluster types", "json"),
		fetchFile("allocationsData", allocationsDataUrl, "allocations data", "csv"),
		fetchFile("contributionsData", contributionsDataUrl, "contributions data", "csv")
	])
	.then(rawData => controlCharts(rawData));

function controlCharts([defaultValues,
	masterCountries,
	masterAllocationTypes,
	masterFundTypes,
	masterPartnerTypes,
	masterClusterTypes,
	allocationsData,
	contributionsData
]) {

	console.log(defaultValues)
	console.log(masterCountries)
	console.log(masterAllocationTypes)
	console.log(masterFundTypes)
	console.log(masterPartnerTypes)
	console.log(allocationsData)
	console.log(contributionsData);

	preProcessData(allocationsData, contributionsData);

	spinnerContainer.remove();

	//validateDefault

	//end of draw
};

function preProcessData(allocationsData, contributionsData) {

	allocationsData.forEach(row => {
		if (yearsArrayAllocations.indexOf(+row.AllocationYear) === -1) yearsArrayAllocations.push(+row.AllocationYear);
	});

	contributionsData.forEach(row => {
		if (yearsArrayContributions.indexOf(+row.FiscalYear) === -1) yearsArrayContributions.push(+row.FiscalYear);
	});

	yearsArrayAllocations.sort((a, b) => a - b);
	yearsArrayContributions.sort((a, b) => a - b);

};

function fetchFile(fileName, url, warningString, method) {
	if (localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
		const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data) :
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

function validateDefault(values) {
	chartState.selectedYear = +values.year === +values.year ? +values.year : currentDate.getFullYear();
	chartState.selectedChart = chartTypes.indexOf(values.chart) > -1 ? values.chart : defaultChart;
};

function createSpinner() {
	spinnerContainer = containerDiv.append("div")
		.attr("class", "spinnerContainer");

	spinnerContainer.append("div")
		.html("Loading data");

	spinnerContainer.append("div")
		.append("i")
		.attr("class", "fas fa-spinner fa-spin");
};