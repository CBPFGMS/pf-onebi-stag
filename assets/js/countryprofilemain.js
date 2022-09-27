//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";
import { createBreadcrumbs } from "./breadcrumbs.js";
import { createCountryProfileOverview } from "./countryprofileoverview.js";
import { createCountryProfileByPartner } from "./countryprofilebypartner.js";
import { createCountryProfileBySector } from "./countryprofilebysector.js";
import { createCountryProfileByPartnerAndSector } from "./countryprofilebypartnerandsector.js";
import { createCountryProfileContributions } from "./countryprofilecontributions.js";

//|constants
const classPrefix = "pfcpmain",
	tabsData = ["Overview", "Allocations by Partner", "Allocations by Sector", "Allocations by Partner/Sector", "Contributions by Donor"],
	backToMenu = "Back to main menu",
	selectAnOption = "Select Fund",
	separator = "##",
	buttonsList = ["total", "cerf/cbpf", "cerf", "cbpf"],
	menuIntroText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nunc tellus, volutpat a laoreet sit amet, rhoncus cursus leo. Fusce velit lorem, interdum eu dui in, luctus ultrices eros. Nullam eu odio in lectus ullamcorper vulputate et a mauris. Nullam nulla lectus, porttitor non interdum vitae, facilisis iaculis urna. Morbi cursus sit amet nibh non rutrum. Etiam in sodales ipsum. Etiam id est magna. Cras ut leo et mi egestas pharetra. Cras et tortor vitae quam fermentum condimentum. Morbi pharetra, est eu viverra tincidunt, mi massa laoreet felis, nec fringilla massa quam at arcu. Donec urna enim, luctus sed blandit ac, vehicula vitae ipsum. Donec in dui non nisl rutrum ornare. Sed sed porttitor massa, id hendrerit mi. Nullam vitae volutpat nulla. Donec elit justo, convallis sed erat ut, elementum aliquam sem.";

let selectedTab = tabsData[0],
	overviewData,
	overviewAdminLevel1Data,
	byPartnerData,
	bySectorData,
	byPartnerAndSectorData,
	contributionsData,
	drawOverview,
	cerfId,
	cbpfId;

const tabsCallingFunctions = tabsData.map(d => ({
	name: d,
	callingFunction: null
}));

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists) {

	const pooledFundsInData = rawAllocationsData.reduce((acc, curr) => {
		const foundRegion = acc.find(e => e.region === lists.fundRegionsList[curr.PooledFundId]);
		if (foundRegion) {
			if (!foundRegion.funds.includes(curr.PooledFundId)) foundRegion.funds.push(curr.PooledFundId);
		} else {
			acc.push({
				region: lists.fundRegionsList[curr.PooledFundId],
				funds: [curr.PooledFundId]
			});
		};
		return acc;
	}, []);

	cerfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cerf");
	cbpfId = +Object.keys(lists.fundTypesList).find(e => lists.fundTypesList[e] === "cbpf");

	pooledFundsInData.forEach(e => e.funds.sort((a, b) => lists.fundNamesList[a].localeCompare(lists.fundNamesList[b])));

	const outerDiv = selections.chartContainerDiv.append("div")
		.attr("class", classPrefix + "outerDiv");

	const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv);

	countries.on("click", (event, d) => {
		chartState.selectedCountryProfile = d;
		drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv);
	});

};

function createListMenu(selections, lists, pooledFundsInData, outerDiv) {

	selectedTab = tabsData[0];

	outerDiv.selectChildren().remove();

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

	regions.append("h2")
		.html(d => d.region);

	const uls = regions.append("ul");

	const countries = uls.selectAll(null)
		.data(d => d.funds)
		.enter()
		.append("li")
		.append("a")
		.attr("href", "#")
		.html(d => lists.fundNamesList[d]);

	return countries;

};

function drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv) {

	processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists);

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

	//const yearsButtons = createYearsButtons(yearsButtonsDiv, etc...);

	const fundsButtons = createFundsButtons(fundsButtonsDiv, colorsObject);

	const tabs = createTabs(tabsDiv, tabsData);

	setCallFunctions()
	callDrawingFunction();

	dropdown.list.on("click", (_, d) => {
		dropdown.container.classed("active", d => d.clicked = false);
		if (d.name === backToMenu) {
			const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv);
			countries.on("click", (_, d) => {
				chartState.selectedCountryProfile = d;
				drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv);
			});
			return;
		};
		if (d.name === chartState.selectedCountryProfile) return;
		chartState.selectedCountryProfile = d.name;
		breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);
		processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		setCallFunctions();
		callDrawingFunction();
	});

	tabs.on("click", (event, d) => {
		if (selectedTab === d) return;
		selectedTab = d;
		fundsButtons.style("display", d === tabsData[tabsData.length - 1] ? "none" : null);
		tabs.classed("active", (_, i, n) => n[i] === event.currentTarget);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		setCallFunctions();
		callDrawingFunction();
	});

	breadcrumb.firstBreadcrumb.on("click", (event, d) => {
		const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv);
		countries.on("click", (event, d) => {
			chartState.selectedCountryProfile = d;
			drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, outerDiv);
		});
		return;
	});

	function setCallFunctions() {
		if (selectedTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction = createCountryProfileOverview(chartDiv, lists, colorsObject, worldMap, tooltipDiv, fundsButtons);
		if (selectedTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction = createCountryProfileByPartner(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons);
		if (selectedTab === tabsData[2]) tabsCallingFunctions.find(d => d.name === tabsData[2]).callingFunction = createCountryProfileBySector(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons);
		if (selectedTab === tabsData[3]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction = createCountryProfileByPartnerAndSector(chartDiv, lists, colorsObject, tooltipDiv, fundsButtons);
		if (selectedTab === tabsData[4]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction = createCountryProfileContributions(chartDiv, lists, colorsObject, tooltipDiv);
	};

	function callDrawingFunction() {
		if (selectedTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction(overviewData, overviewAdminLevel1Data, true, true);
		if (selectedTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction(byPartnerData, true, true);
		if (selectedTab === tabsData[2]) tabsCallingFunctions.find(d => d.name === tabsData[2]).callingFunction(bySectorData, true, true);
		if (selectedTab === tabsData[3]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction(byPartnerAndSectorData, true, true);
		if (selectedTab === tabsData[4]) tabsCallingFunctions.find(d => d.name === tabsData[3]).callingFunction(contributionsData, true, true);
	};

};

function createDropdown(container, pooledFundsInData, lists) {

	const data = pooledFundsInData.reduce((acc, curr) => {
		acc.push({ type: "region", name: curr.region });
		curr.funds.forEach(e => acc.push({ type: "fund", name: e }));
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

	//'24' is the padding of the dropdown
	container.style("max-width", (titleWidth + 24) + "px");

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
	rawAllocationsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
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
			} else {
				foundYear.values.push({
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					value: row.ClusterBudget
				});
			};
		} else {
			target.push({
				year: row.AllocationYear,
				values: [{
					partner: row.PartnerCode,
					partnerType: row.OrganizatinonId,
					value: row.ClusterBudget
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
				} else {
					data.push({
						year: row.AllocationYear,
						sector: row.ClusterId,
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
					} else {
						data.push({
							year: row.AllocationYear,
							sector: row.ClusterId,
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
			} else {
				foundYear.values.push({
					partner: row.PartnerCode,
					sector: row.ClusterId,
					value: row.ClusterBudget
				});
			};
		} else {
			target.push({
				year: row.AllocationYear,
				values: [{
					partner: row.PartnerCode,
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
	//object:
	// {
	// 	"FiscalYear": 2021,
	// 	"PledgePaidDate": "12-2021",
	// 	"DonorId": 193,
	// 	"PooledFundId": 109,
	// 	"PledgeAmt": 2392,
	// 	"PaidAmt": 0
	// }

	const data = [];

	rawContributionsData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
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

function processAllData(rawAllocationsData, rawContributionsData, adminLevel1Data, lists) {
	overviewData = processDataForCountryProfileOverview(rawAllocationsData, lists);
	overviewAdminLevel1Data = processAdminLevel1DataForCountryProfileOverview(adminLevel1Data);
	byPartnerData = processDataForCountryProfileByPartner(rawAllocationsData, lists);
	bySectorData = processDataForCountryProfileBySector(rawAllocationsData, lists);
	byPartnerAndSectorData = processDataForCountryProfileByPartnerAndSector(rawAllocationsData, lists);
	contributionsData = processDataForCountryProfileContributions(rawContributionsData, lists);
};

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1)
};

export { createCountryProfile };