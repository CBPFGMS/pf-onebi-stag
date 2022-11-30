//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";
import { createBreadcrumbs } from "./breadcrumbs.js";
import { createCountryProfileOverview } from "./countryprofileoverview.js";
import { createCountryProfileByPartner } from "./countryprofilebypartner.js";
import { createCountryProfileBySector } from "./countryprofilebysector.js";
import { createCountryProfileByPartnerAndSector } from "./countryprofilebypartnerandsector.js";
import { createCountryProfileContributions } from "./countryprofilecontributions.js";
import { buttonsObject } from "./buttons.js";

//|constants
const classPrefix = "pfcpmain",
	generalClassPrefix = "pfbihp",
	tabsData = ["Overview", "Allocations by Partner", "Allocations by Sector", "Allocations by Partner/Sector", "Contributions by Donor"],
	backToMenu = "Back to main menu",
	selectAnOption = "Change Country",
	separator = "##",
	fadeOpacity = 0.1,
	duration = 1000,
	topValuesNoValue = "--",
	piesSize = 20,
	arcGenerator = d3.arc().outerRadius(piesSize / 2).innerRadius(0),
	pieGenerator = d3.pie().value(d => d.value).sort((a, b) => b.fundType - a.fundType),
	currentDate = new Date(),
	currentYear = currentDate.getFullYear(),
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	menuIntroText = "OCHA aims to mobilize and engage the full range of financing instruments, mechanisms and partners to ensure that growing humanitarian needs are met, humanitarian leadership and coordination mechanisms are promoted at the country level, and the large array of global humanitarian financing mechanisms are complementary among themselves and coherent with development funding. At the country level, OCHA helps partners to build common strategies and implementation plans and to appeal for funds as a group. OCHA ensures more responsive, predictable and strategic humanitarian financing through its leadership of the Central Emergency Response Fund (CERF) and Country-Based Pooled Funds (CBPFs) for the humanitarian system.";

chartState.selectedCountryProfileTab = tabsData[0];

let overviewData,
	overviewAdminLevel1Data,
	byPartnerData,
	bySectorData,
	byPartnerAndSectorData,
	contributionsData,
	yearsButtons,
	cerfId,
	cbpfId,
	resetYear = true;

const yearsSetAllocations = new Set(),
	yearsSetContributions = new Set(),
	topValues = {
		allocations: 0,
		projects: new Set()
	};

const tabsCallingFunctions = tabsData.map(d => ({
	name: d,
	callingFunction: null
}));

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, yearsArrayTotal, queryStringObject) {

	d3.select("#pfbihpPlayButton")
		.property("disabled", false);

	const pooledFundsInData = createListMenuData(rawAllocationsData, lists);

	cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	pooledFundsInData.forEach(e => e.funds.sort((a, b) => lists.fundNamesList[a.fund].localeCompare(lists.fundNamesList[b.fund])));

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colorsObject);

	countries.on("click", (event, d) => {
		chartState.selectedCountryProfile = d.fund;
		setQueryString("country", chartState.selectedCountryProfile, lists);
		drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
	});

	if (queryStringObject && queryStringObject.country) {
		chartState.selectedCountryProfile = +queryStringObject.country;
		if (queryStringObject.year) {
			chartState.selectedYear = +queryStringObject.year;
			resetYear = false;
		};
		if (queryStringObject.fund) chartState.selectedFund = queryStringObject.fund;
		drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
	};

};

function createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colors) {

	createDisabledOption(selections.yearDropdown, yearsArrayTotal);

	topValues.allocations = 0;
	topValues.projects.clear();
	updateTopValues(topValues, selections);

	chartState.selectedCountryProfileTab = tabsData[0];

	outerDiv.selectChildren().remove();

	const maxValueInData = pooledFundsInData.reduce((acc, curr) => {
		curr.funds.forEach(fund => {
			fund.values.forEach(e => acc = Math.max(acc, e.value))
		});
		return acc;
	}, 0);

	const maxValueForRegions = pooledFundsInData.reduce((acc, curr) => {
		curr.values.forEach(e => acc = Math.max(acc, e.value));
		return acc;
	}, 0);

	const container = outerDiv.append("div")
		.attr("class", "country-pro-main")
		.append("div")
		.attr("class", "container");

	const title = container.append("h1")
		.html("Country Profile");

	const intro = container.append("p")
		.html(menuIntroText);

	const row = container.append("div")
		.attr("class", "row");

	const regions = row.selectAll(null)
		.data(pooledFundsInData)
		.enter()
		.append("div")
		.attr("class", "col-md-4")
		.append("div")
		.attr("class", "country-list mb-4");

	const regionsContainer = regions.append("div")
		.attr("class", classPrefix + "regionsContainer");

	regionsContainer.append("h2")
		.html(d => d.region);

	const regionsTable = regionsContainer.append("div"); //TABLE HERE

	const uls = regions.append("ul");

	const countries = uls.selectAll(null)
		.data(d => d.funds)
		.enter()
		.append("li");

	const piesDiv = countries.append("div")
		.attr("class", classPrefix + "piesDiv")
		.style("width", piesSize + "px")
		.style("height", piesSize + "px");

	const piesSvg = piesDiv.append("svg")
		.attr("width", "100%")
		.attr("height", "100%");

	const countryNames = countries.append("a")
		.attr("href", "#")
		.html(d => lists.fundNamesList[d.fund]);

	createPies(piesSvg, colors, lists);

	return countries;

};

function createPies(container, colors, lists) {

	const group = container.append("g")
		.attr("transform", `translate(${piesSize/2},${piesSize/2})`);

	const pies = group.selectAll(null)
		.data(d => pieGenerator(d.fundTypes))
		.enter()
		.append("path")
		.attr("d", arcGenerator)
		.attr("fill", d => colors[lists.fundTypesList[d.data.fundType]]);

};

function drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal) {

	if (buttonsObject.playing) stopTimer();

	processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists);

	const mergedYears = Array.from(new Set([...yearsSetAllocations, ...yearsSetContributions]));
	mergedYears.sort((a, b) => a - b);

	createDisabledOption(selections.yearDropdown, mergedYears);

	updateTopValues(topValues, selections);

	outerDiv.selectChildren().remove();

	const breadcrumb = createBreadcrumbs(outerDiv, "country profile");

	breadcrumb.firstBreadcrumb.style("cursor", "pointer");

	breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);

	const topButtonsDiv = breadcrumb.breadcrumbDiv.append("div")
		.attr("data-html2canvas-ignore", "true")
		.attr("class", classPrefix + "topButtonsDiv");

	createLinks(topButtonsDiv);

	const dropdownAndButtonsDiv = outerDiv.append("div")
		.attr("class", classPrefix + "dropdownAndButtonsDiv");

	const dropdownDiv = dropdownAndButtonsDiv.append("div")
		.attr("class", classPrefix + "dropdownDiv");

	const yearsButtonsDiv = dropdownAndButtonsDiv.append("div")
		.attr("class", classPrefix + "yearsButtonsDiv");

	const fundsButtonsDiv = dropdownAndButtonsDiv.append("div")
		.attr("class", classPrefix + "fundsButtonsDiv");

	const tabsOuterDiv = outerDiv.append("div")
		.attr("class", classPrefix + "tabsOuterDiv");

	const tabsDiv = tabsOuterDiv.append("div")
		.attr("class", classPrefix + "tabsDiv");

	const chartDiv = outerDiv.append("div")
		.attr("class", classPrefix + "chartDiv");

	const tooltipDiv = chartDiv.append("div")
		.attr("id", classPrefix + "tooltipDiv")
		.style("display", "none");

	const dropdown = createDropdown(dropdownDiv, pooledFundsInData, lists);

	yearsButtons = createYearsButtons(yearsButtonsDiv, chartState.selectedCountryProfileTab === tabsData[tabsData.length - 1] ? yearsSetContributions : yearsSetAllocations);

	yearsButtons.on("click.main", (_, d) => setQueryString("year", d, lists));

	const fundsButtons = createFundsButtons(fundsButtonsDiv, colorsObject);

	fundsButtons.on("click.main", (event, d) => setQueryString("fund", d, lists));

	const tabs = createTabs(tabsDiv, tabsData);

	setCallFunctions()
	callDrawingFunction();

	dropdown.list.on("click", (_, d) => {
		dropdown.container.classed("active", d => d.clicked = false);
		if (d.name === backToMenu) {
			const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colorsObject);
			deleteQueryStringValues(lists);
			countries.on("click", (_, d) => {
				chartState.selectedCountryProfile = d.fund;
				setQueryString("country", chartState.selectedCountryProfile, lists);
				drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
			});
			return;
		};
		if (d.name === chartState.selectedCountryProfile) return;
		chartState.selectedCountryProfile = d.name;
		setQueryString("country", chartState.selectedCountryProfile, lists);
		breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);
		processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists);
		const mergedYears = Array.from(new Set([...yearsSetAllocations, ...yearsSetContributions]));
		mergedYears.sort((a, b) => a - b);
		createDisabledOption(selections.yearDropdown, mergedYears);
		updateTopValues(topValues, selections);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		yearsButtons = createYearsButtons(yearsButtonsDiv, d === tabsData[tabsData.length - 1] ? yearsSetContributions : yearsSetAllocations);
		yearsButtons.on("click.main", (_, d) => setQueryString("year", d, lists));
		setCallFunctions();
		callDrawingFunction();
	});

	tabs.on("click", (event, d) => {
		if (chartState.selectedCountryProfileTab === d) return;
		if (buttonsObject.playing) stopTimer();
		if (d.includes("Contributions") || chartState.selectedCountryProfileTab.includes("Contributions")) {
			yearsButtons = createYearsButtons(yearsButtonsDiv, d === tabsData[tabsData.length - 1] ? yearsSetContributions : yearsSetAllocations);
			yearsButtons.on("click.main", (_, d) => setQueryString("year", d, lists));
		};
		chartState.selectedCountryProfileTab = d;
		fundsButtons.style("display", e => d === tabsData[tabsData.length - 1] || ((d === tabsData[1] || d === tabsData[3]) && e === "cerf/cbpf") ? "none" : null);
		tabs.classed("active", (_, i, n) => n[i] === event.currentTarget);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		repositionYearsButtons(yearsButtonsDiv);
		setCallFunctions();
		callDrawingFunction();
	});

	breadcrumb.firstBreadcrumb.on("click", (event, d) => {
		const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv, yearsArrayTotal, colorsObject);
		deleteQueryStringValues(lists);
		countries.on("click", (event, d) => {
			chartState.selectedCountryProfile = d.fund;
			setQueryString("country", chartState.selectedCountryProfile, lists);
			drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv, yearsArrayTotal);
		});
		return;
	});

	function setCallFunctions() {
		if (chartState.selectedCountryProfileTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction = createCountryProfileOverview(chartDiv, lists, colorsObject, worldMap, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction = createCountryProfileByPartner(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[2]) tabsCallingFunctions.find(d => d.name === tabsData[2]).callingFunction = createCountryProfileBySector(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[3]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction = createCountryProfileByPartnerAndSector(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons, yearsButtons);
		if (chartState.selectedCountryProfileTab === tabsData[4]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction = createCountryProfileContributions(chartDiv, lists, colorsObject, tooltipDiv, yearsButtons);
	};

	function callDrawingFunction() {
		if (chartState.selectedCountryProfileTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction(overviewData, overviewAdminLevel1Data, resetYear, true);
		if (chartState.selectedCountryProfileTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction(byPartnerData, true, true);
		if (chartState.selectedCountryProfileTab === tabsData[2]) tabsCallingFunctions.find(d => d.name === tabsData[2]).callingFunction(bySectorData, true, true);
		if (chartState.selectedCountryProfileTab === tabsData[3]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction(byPartnerAndSectorData, true, true);
		if (chartState.selectedCountryProfileTab === tabsData[4]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction(contributionsData, true, true);
	};

};

function createDropdown(container, pooledFundsInData, lists) {

	const data = pooledFundsInData.reduce((acc, curr) => {
		acc.push({ type: "region", name: curr.region });
		curr.funds.forEach(e => acc.push({ type: "fund", name: e.fund }));
		return acc;
	}, []);

	data.unshift({ type: "backmenu", name: backToMenu });

	const dropdownContainer = container.append("div")
		.datum({
			clicked: false
		})
		.attr("class", classPrefix + "dropdownContainer");

	const dropdownTitleDiv = dropdownContainer.append("div")
		.attr("class", classPrefix + "dropdownTitleDiv");

	const dropdownTitle = dropdownTitleDiv.append("div")
		.attr("class", classPrefix + "dropdownTitle")
		.html(selectAnOption);

	const dropdownArrow = dropdownTitleDiv.append("div")
		.attr("class", classPrefix + "dropdownArrow");

	dropdownArrow.append("i")
		.attr("class", "fa fa-angle-down");

	const titleWidth = dropdownTitleDiv.node().getBoundingClientRect().width;

	container.style("max-width", (titleWidth + 24) + "px"); //'24' is the padding of the dropdown

	const dropdownList = dropdownContainer.append("div")
		.attr("class", classPrefix + "dropdownList");

	const items = dropdownList.selectAll(null)
		.data(data)
		.enter()
		.append("span")
		.attr("class", d => d.type)
		.html(d => d.type === "fund" ? lists.fundNamesList[d.name] : d.name);

	dropdownTitleDiv.on("click", () => {
		dropdownContainer.classed("active", d => d.clicked = !d.clicked);
	});

	dropdownContainer.on("mouseleave", () => dropdownContainer.classed("active", d => d.clicked = false));

	const countries = items.filter(d => d.tyope !== "region");

	return { list: countries, container: dropdownContainer };

};

function createFundsButtons(container, colors) {
	const buttons = container.selectAll(null)
		.data(buttonsList)
		.enter()
		.append("button")
		.classed("active", d => chartState.selectedFund === d);

	const bullet = buttons.append("span")
		.attr("class", "icon-circle")
		.append("i")
		.attr("class", (_, i) => i === 1 ? "fas fa-adjust fa-xs" : "fas fa-circle fa-xs")
		.style("color", (d, i) => i !== 1 ? colors[d] : null);

	const title = buttons.append("span")
		.html(d => " " + (d === "total" ? capitalize(d) : d.toUpperCase()));

	return buttons;
};

function createYearsButtons(container, yearsDataSet) {

	container.selectChildren().remove();

	const yearsData = Array.from(yearsDataSet).sort((a, b) => a - b);

	const yearLeftArrow = container.append("div")
		.attr("class", classPrefix + "yearLeftArrow")
		.style("cursor", "pointer");

	const yearButtonsContainerDiv = container.append("div")
		.attr("class", classPrefix + "yearButtonsContainerDiv");

	const yearButtonsContainer = yearButtonsContainerDiv.append("div")
		.attr("class", classPrefix + "yearButtonsContainer");

	const yearRightArrow = container.append("div")
		.attr("class", classPrefix + "yearRightArrow")
		.style("opacity", fadeOpacity)
		.style("cursor", "default");

	yearLeftArrow.append("i")
		.attr("class", "fas fa-angle-left");

	yearRightArrow.append("i")
		.attr("class", "fas fa-angle-right");

	const yearsButtons = yearButtonsContainer.selectAll(null)
		.data(yearsData)
		.enter()
		.append("button")
		.html(d => d);

	let yearButtonsSize,
		yearButtonsContainerSize;

	setTimeout(function() {
		yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth;
		yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;

		if (yearButtonsSize <= yearButtonsContainerSize) {
			yearLeftArrow.style("display", "none");
			yearRightArrow.style("display", "none");
		};

		yearButtonsContainer.style("left", -1 * (yearButtonsSize - yearButtonsContainerSize) + "px");
	}, duration / 10);

	yearLeftArrow.on("click", () => {
		const thisLeft = parseInt(yearButtonsContainer.style("left"), 10);
		yearRightArrow.style("opacity", 1)
			.style("cursor", "pointer");
		yearButtonsContainer.transition()
			.duration(duration)
			.style("left", Math.min(thisLeft + yearButtonsContainerSize, 0) + "px")
			.on("end", () => {
				if (parseInt(yearButtonsContainer.style("left"), 10) === 0) {
					yearLeftArrow.style("opacity", fadeOpacity)
						.style("cursor", "default");
				};
			});
	});

	yearRightArrow.on("click", () => {
		const thisLeft = parseInt(yearButtonsContainer.style("left"), 10);
		yearLeftArrow.style("opacity", 1)
			.style("cursor", "pointer");
		yearButtonsContainer.transition()
			.duration(duration)
			.style("left", Math.max(thisLeft - yearButtonsContainerSize, -1 * (yearButtonsSize - yearButtonsContainerSize)) + "px")
			.on("end", () => {
				if (parseInt(yearButtonsContainer.style("left"), 10) === -1 * (yearButtonsSize - yearButtonsContainerSize)) {
					yearRightArrow.style("opacity", fadeOpacity)
						.style("cursor", "default");
				};
			});
	});

	return yearsButtons;
};

function repositionYearsButtons(container) {
	const yearButtonsContainerDiv = container.select(`.${classPrefix}yearButtonsContainerDiv`),
		yearButtonsContainer = container.select(`.${classPrefix}yearButtonsContainer`),
		yearLeftArrow = container.select(`.${classPrefix}yearLeftArrow`),
		yearRightArrow = container.select(`.${classPrefix}yearRightArrow`);

	let yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth,
		yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;

	if (yearButtonsSize <= yearButtonsContainerSize) {
		yearLeftArrow.style("display", "none");
		yearRightArrow.style("display", "none");
	} else {
		yearLeftArrow.style("display", null);
		yearRightArrow.style("display", null);
		yearButtonsSize = ~~yearButtonsContainer.node().scrollWidth;
		yearButtonsContainerSize = ~~yearButtonsContainerDiv.node().getBoundingClientRect().width;
	};

	yearButtonsContainer.style("left", -1 * (yearButtonsSize - yearButtonsContainerSize) + "px");
};

function createTabs(container, data) {

	const ul = container.append("ul")
		.attr("class", "nav nav-tabs");

	const tab = ul.selectAll(null)
		.data(data)
		.enter()
		.append("li")
		.attr("class", "nav-item")
		.append("a")
		.attr("class", "nav-link")
		.attr("href", "#")
		.classed("active", (_, i) => !i)
		.html(d => d);

	return tab;
};

function processAdminLevel1DataForCountryProfileOverview(rawAdminLevel1Data) {
	const data = [];
	rawAdminLevel1Data.forEach(row => {
		if (+row.PooledFundId === chartState.selectedCountryProfile) {
			const foundYear = data.find(d => d.year === row.AllocationYear);
			if (foundYear) {
				const foundAdminLevel1 = foundYear.adminLevel1List.find(e => e.AdminLocation1 === row.AdminLocation1 &&
					e.FundType === row.FundType &&
					e.AdminLocation1Latitude.toFixed(6) === row.AdminLocation1Latitude.toFixed(6) &&
					e.AdminLocation1Longitude.toFixed(6) === row.AdminLocation1Longitude.toFixed(6));
				if (foundAdminLevel1) {
					foundAdminLevel1.AdminLocation1Budget += row.AdminLocation1Budget;
				} else {
					foundYear.adminLevel1List.push(row);
				};
			} else {
				data.push({
					year: row.AllocationYear,
					adminLevel1List: [row]
				});
			};
		};
	});
	return data;
};

function processDataForCountryProfileOverview(rawAllocationsData, lists) {
	const data = [];
	yearsSetAllocations.clear();
	topValues.allocations = 0;
	topValues.projects.clear();
	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			yearsSetAllocations.add(row.AllocationYear);
			topValues.allocations += +row.ClusterBudget;
			row.ProjList.toString().split(separator).forEach(e => topValues.projects.add(e));
			const foundYear = data.find(d => d.year === row.AllocationYear);
			if (foundYear) {
				foundYear.allocationsList.push(row);
				pushCbpfOrCerf(foundYear, row, lists);
			} else {
				const yearObject = {
					year: row.AllocationYear,
					cbpf: 0,
					cerf: 0,
					total: 0,
					allocationsList: [row]
				};
				Object.keys(lists.allocationTypesList).forEach(e => {
					yearObject[`type${separator}${e}${separator}cerf`] = 0;
					yearObject[`type${separator}${e}${separator}cbpf`] = 0;
					yearObject[`type${separator}${e}${separator}total`] = 0;
				});
				pushCbpfOrCerf(yearObject, row, lists);
				data.push(yearObject);
			};
		};
	});
	return data;
};

function processDataForCountryProfileByPartner(rawAllocationsData, lists) {

	const data = {
		cerf: [],
		cbpf: [],
		cbpfAggregated: []
	};

	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			if (row.FundId === cbpfId) {
				const foundYearAggregated = data.cbpfAggregated.find(e => e.year === row.AllocationYear);
				if (foundYearAggregated) {
					const foundPartner = foundYearAggregated.values.find(e => e.partner === row.OrganizatinonId);
					if (foundPartner) {
						foundPartner.value += row.ClusterBudget;
					} else {
						foundYearAggregated.values.push({
							partner: row.OrganizatinonId,
							partnerType: row.OrganizatinonId,
							value: row.ClusterBudget
						});
					};
				} else {
					data.cbpfAggregated.push({
						year: row.AllocationYear,
						values: [{
							partner: row.OrganizatinonId,
							partnerType: row.OrganizatinonId,
							value: row.ClusterBudget
						}]
					});
				};
				populate(data.cbpf, row);
			};
			if (row.FundId === cerfId) populate(data.cerf, row);
		};
	});

	function populate(target, row) {
		const foundYear = target.find(e => e.year === row.AllocationYear);
		if (foundYear) {
			const foundPartner = foundYear.values.find(e => e.partner === row.PartnerCode);
			if (foundPartner) {
				foundPartner.value += row.ClusterBudget;
				foundPartner.projects += separator + row.ProjList;
			} else {
				foundYear.values.push({
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					value: row.ClusterBudget,
					projects: row.ProjList
				});
			};
		} else {
			target.push({
				year: row.AllocationYear,
				values: [{
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					value: row.ClusterBudget,
					projects: row.ProjList
				}]
			});
		};
	};

	data.cerf.sort((a, b) => a.year - b.year);
	data.cbpf.sort((a, b) => a.year - b.year);
	data.cbpfAggregated.sort((a, b) => a.year - b.year);

	return data;

};

function processDataForCountryProfileBySector(rawAllocationsData, lists) {

	const data = [];

	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			if (row.FundId === cerfId) {
				const foundYearAndSector = data.find(e => e.year === row.AllocationYear && e.sector === row.ClusterId);
				if (foundYearAndSector) {
					foundYearAndSector.total += row.ClusterBudget;
					foundYearAndSector.cerf += row.ClusterBudget;
					foundYearAndSector.projectsCerf += (foundYearAndSector.projectsCerf === "" ? "" : separator) + row.ProjList;
					foundYearAndSector.partnersCerf += (foundYearAndSector.partnersCerf === "" ? "" : separator) + row.PartnerCode;
				} else {
					data.push({
						year: row.AllocationYear,
						sector: row.ClusterId,
						projectsCerf: row.ProjList,
						partnersCerf: row.PartnerCode,
						projectsCbpf: "",
						partnersCbpf: "",
						total: row.ClusterBudget,
						cerf: row.ClusterBudget,
						cbpf: 0
					});
				};
			};
			if (row.FundId === cbpfId) {
				if (row.PooledFundId === chartState.selectedCountryProfile && row.FundId === cbpfId) {
					const foundYearAndSector = data.find(e => e.year === row.AllocationYear && e.sector === row.ClusterId);
					if (foundYearAndSector) {
						foundYearAndSector.total += row.ClusterBudget;
						foundYearAndSector.cbpf += row.ClusterBudget;
						foundYearAndSector.projectsCbpf += (foundYearAndSector.projectsCbpf === "" ? "" : separator) + row.ProjList;
						foundYearAndSector.partnersCbpf += (foundYearAndSector.partnersCbpf === "" ? "" : separator) + row.PartnerCode;
					} else {
						data.push({
							year: row.AllocationYear,
							sector: row.ClusterId,
							projectsCerf: "",
							partnersCerf: "",
							projectsCbpf: row.ProjList,
							partnersCbpf: row.PartnerCode,
							total: row.ClusterBudget,
							cerf: 0,
							cbpf: row.ClusterBudget
						});
					};
				};
			};
		};
	});

	return data;

};

function processDataForCountryProfileByPartnerAndSector(rawAllocationsData, lists) {

	const data = {
		cerf: [],
		cbpf: []
	};

	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			if (row.FundId === cbpfId) populate(data.cbpf, row);
			if (row.FundId === cerfId) populate(data.cerf, row);
		};
	});

	function populate(target, row) {
		const foundYear = target.find(e => e.year === row.AllocationYear);
		if (foundYear) {
			const foundPartnerAndSector = foundYear.values.find(e => e.partner === row.PartnerCode && e.sector === row.ClusterId);
			if (foundPartnerAndSector) {
				foundPartnerAndSector.value += row.ClusterBudget;
				foundPartnerAndSector.projects += separator + row.ProjList;
			} else {
				foundYear.values.push({
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					projects: row.ProjList,
					sector: row.ClusterId,
					value: row.ClusterBudget
				});
			};
		} else {
			target.push({
				year: row.AllocationYear,
				values: [{
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					projects: row.ProjList,
					sector: row.ClusterId,
					value: row.ClusterBudget
				}]
			});
		};
	};

	data.cerf.sort((a, b) => a.year - b.year);
	data.cbpf.sort((a, b) => a.year - b.year);

	return data;

};

function processDataForCountryProfileContributions(rawContributionsData, lists) {

	const data = [];
	yearsSetContributions.clear();

	rawContributionsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			yearsSetContributions.add(row.FiscalYear);
			const foundYear = data.find(e => e.year === row.FiscalYear);
			if (foundYear) {
				const foundDonor = foundYear.values.find(e => e.donor === row.DonorId);
				if (foundDonor) {
					foundDonor.total += (row.PledgeAmt + row.PaidAmt);
					foundDonor.paid += row.PaidAmt;
					foundDonor.pledge += row.PledgeAmt;
				} else {
					foundYear.values.push({
						donor: row.DonorId,
						total: (row.PledgeAmt + row.PaidAmt),
						pledge: row.PledgeAmt,
						paid: row.PaidAmt
					});
				};
			} else {
				data.push({
					year: row.FiscalYear,
					values: [{
						donor: row.DonorId,
						total: (row.PledgeAmt + row.PaidAmt),
						pledge: row.PledgeAmt,
						paid: row.PaidAmt
					}]
				});
			};
		};
	});

	data.sort((a, b) => a.year - b.year);

	return data;

};

function pushCbpfOrCerf(obj, row, lists) {
	if (row.FundId === cbpfId) {
		obj.cbpf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cbpf`] += +row.ClusterBudget;;
	} else if (row.FundId === cerfId) {
		obj.cerf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cerf`] += +row.ClusterBudget;;
	};
	obj.total += +row.ClusterBudget;
	obj[`type${separator}${row.AllocationSurceId}${separator}total`] += +row.ClusterBudget;;
};

function createListMenuData(rawAllocationsData, lists) {

	const data = [];

	rawAllocationsData.forEach(row => {
		const foundRegion = data.find(e => e.region === lists.fundRegionsList[row.PooledFundId]);
		if (foundRegion) {
			const foundYearRegion = foundRegion.values.find(e => e.year === row.AllocationYear);
			if (foundYearRegion) {
				foundYearRegion.value += row.ClusterBudget;
			} else {
				foundRegion.values.push({
					year: row.AllocationYear,
					value: row.ClusterBudget
				});
			};
			const foundFundTypeRegion = foundRegion.fundTypes.find(e => e.fundType === row.FundId);
			if (foundFundTypeRegion) {
				foundFundTypeRegion.value += row.ClusterBudget;
			} else {
				foundRegion.fundTypes.push({
					fundType: row.FundId,
					value: row.ClusterBudget
				});
			};
			const foundCountry = foundRegion.funds.find(e => e.fund === row.PooledFundId);
			if (foundCountry) {
				const foundFundTypeCountry = foundCountry.fundTypes.find(e => e.fundType === row.FundId);
				if (foundFundTypeCountry) {
					foundFundTypeCountry.value += row.ClusterBudget;
				} else {
					foundCountry.fundTypes.push({
						fundType: row.FundId,
						value: row.ClusterBudget
					});
				};
				const foundYear = foundCountry.values.find(e => e.year === row.AllocationYear);
				if (foundYear) {
					foundYear.value += row.ClusterBudget;
				} else {
					foundCountry.values.push({
						year: row.AllocationYear,
						value: row.ClusterBudget
					});
				};
			} else {
				foundRegion.funds.push({
					fund: row.PooledFundId,
					fundTypes: [{
						fundType: row.FundId,
						value: row.ClusterBudget
					}],
					values: [{
						year: row.AllocationYear,
						value: row.ClusterBudget
					}]
				});
			};
		} else {
			data.push({
				region: lists.fundRegionsList[row.PooledFundId],
				funds: [{
					fund: row.PooledFundId,
					fundTypes: [{
						fundType: row.FundId,
						value: row.ClusterBudget
					}],
					values: [{
						year: row.AllocationYear,
						value: row.ClusterBudget
					}]
				}],
				fundTypes: [{
					fundType: row.FundId,
					value: row.ClusterBudget
				}],
				values: [{
					year: row.AllocationYear,
					value: row.ClusterBudget
				}]
			});
		};
	});

	return data;
};

function processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists) {
	overviewData = processDataForCountryProfileOverview(rawAllocationsData, lists);
	overviewAdminLevel1Data = processAdminLevel1DataForCountryProfileOverview(adminLevel1Data);
	byPartnerData = processDataForCountryProfileByPartner(rawAllocationsData, lists);
	bySectorData = processDataForCountryProfileBySector(rawAllocationsData, lists);
	byPartnerAndSectorData = processDataForCountryProfileByPartnerAndSector(rawAllocationsData, lists);
	contributionsData = processDataForCountryProfileContributions(rawContributionsData, lists);
};

function createDisabledOption(dropdownContainer, yearsArray) {
	dropdownContainer.attr("disabled", "disabled");

	let disabledOption = dropdownContainer.selectAll("#" + generalClassPrefix + "disabledOption")
		.data([true]);

	disabledOption = disabledOption.enter()
		.append("option")
		.attr("id", generalClassPrefix + "disabledOption")
		.merge(disabledOption)
		.property("selected", true)
		.property("disabled", true)
		.html(yearsArray[0] + " - " + Math.min(yearsArray[yearsArray.length - 1], currentYear));
};

function updateTopValues(topValues, selections) {

	const updateTransition = d3.transition()
		.duration(duration);

	selections.contributionsTopFigure.text(topValuesNoValue);

	selections.allocationsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			if (!topValues.allocations) return () => topValuesNoValue;
			const currValue = n[i].textContent === topValuesNoValue ? 0 : reverseFormat(n[i].textContent.split("$")[1]);
			const interpolator = d3.interpolate(currValue || 0, topValues.allocations);
			return t => "$" + formatSIFloat(interpolator(t)).replace("G", "B");
		});

	selections.donorsTopFigure.text(topValuesNoValue);

	selections.projectsTopFigure.transition(updateTransition)
		.textTween((_, i, n) => {
			if (!topValues.projects.size) return () => topValuesNoValue;
			return d3.interpolateRound(+n[i].textContent || 0, topValues.projects.size)
		});

};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

function formatSIFloat(value) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	return d3.formatPrefix("." + digits, value)(value);
};

function setQueryString(key, value, lists) {
	if (lists.queryStringValues.has(key)) {
		lists.queryStringValues.set(key, value);
	} else {
		lists.queryStringValues.append(key, value);
	};
	const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
	window.history.replaceState(null, "", newURL);
};

function deleteQueryStringValues(lists) {
	lists.queryStringValues.delete("country");
	lists.queryStringValues.delete("year");
	lists.queryStringValues.delete("fund");
	const newURL = window.location.origin + window.location.pathname + "?" + lists.queryStringValues.toString();
	window.history.replaceState(null, "", newURL);
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

function stopTimer() {
	buttonsObject.playing = false;
	buttonsObject.timer.stop();
	d3.select("#pfbihpyearNumberText").text("");
	d3.select("#" + generalClassPrefix + "PlayButton")
		.datum({
			clicked: false
		})
		.html("PLAY  ")
		.append("span")
		.attr("class", "fas fa-play");
};

export { createCountryProfile };