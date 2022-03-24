//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";
import { createBreadcrumbs } from "./breadcrumbs.js";
import { createCountryProfileOverview } from "./countryprofileoverview.js";
import { createCountryProfileByPartner } from "./countryprofilebypartner.js";

//|constants
const classPrefix = "pfcpmain",
	tabsData = ["Overview", "Allocations by partner", "Allocations", "Funding by Cluster", "Contributions by Donor"],
	backToMenu = "Back to main menu",
	selectAnOption = "Select Fund",
	separator = "##",
	menuIntroText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nunc tellus, volutpat a laoreet sit amet, rhoncus cursus leo. Fusce velit lorem, interdum eu dui in, luctus ultrices eros. Nullam eu odio in lectus ullamcorper vulputate et a mauris. Nullam nulla lectus, porttitor non interdum vitae, facilisis iaculis urna. Morbi cursus sit amet nibh non rutrum. Etiam in sodales ipsum. Etiam id est magna. Cras ut leo et mi egestas pharetra. Cras et tortor vitae quam fermentum condimentum. Morbi pharetra, est eu viverra tincidunt, mi massa laoreet felis, nec fringilla massa quam at arcu. Donec urna enim, luctus sed blandit ac, vehicula vitae ipsum. Donec in dui non nisl rutrum ornare. Sed sed porttitor massa, id hendrerit mi. Nullam vitae volutpat nulla. Donec elit justo, convallis sed erat ut, elementum aliquam sem.";

let selectedTab = tabsData[0],
	overviewData,
	overviewAdminLevel1Data,
	byPartnerData,
	drawOverview,
	cerfId,
	cbpfId;

const tabsCallingFunctions = tabsData.map(d => ({
	name: d,
	callingFunction: null
}));

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, cerfByPartnerData, selections, colorsObject, lists) {

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
		drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, cerfByPartnerData, selections, colorsObject, lists, outerDiv);
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

function drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, cerfByPartnerData, selections, colorsObject, lists, outerDiv) {

	processAllData(rawAllocationsData, adminLevel1Data, cerfByPartnerData, lists);

	outerDiv.selectChildren().remove();

	const breadcrumb = createBreadcrumbs(outerDiv, "country profile");

	breadcrumb.firstBreadcrumb.style("cursor", "pointer");

	breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);

	const topButtonsDiv = breadcrumb.breadcrumbDiv.append("div")
		.attr("data-html2canvas-ignore", "true")
		.attr("class", classPrefix + "topButtonsDiv");

	createLinks(topButtonsDiv);

	const dropdownDiv = outerDiv.append("div")
		.attr("class", classPrefix + "dropdownDiv");

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

	const tabs = createTabs(tabsDiv, tabsData);

	setCallFunctions()
	callDrawingFunction();

	dropdown.on("change", (event, d) => {
		if (event.currentTarget.value === backToMenu) {
			const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv);
			countries.on("click", (event, d) => {
				chartState.selectedCountryProfile = d;
				drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, cerfByPartnerData, selections, colorsObject, lists, outerDiv);
			});
			return;
		};
		if (+event.currentTarget.value === chartState.selectedCountryProfile) return;
		chartState.selectedCountryProfile = +event.currentTarget.value;
		breadcrumb.secondBreadcrumbSpan.html(lists.fundNamesList[chartState.selectedCountryProfile]);
		processAllData(rawAllocationsData, adminLevel1Data, cerfByPartnerData, lists);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		setCallFunctions();
		callDrawingFunction();
	});

	tabs.on("click", (event, d) => {
		if (selectedTab === d) return;
		selectedTab = d;
		tabs.classed("active", (_, i, n) => n[i] === event.currentTarget);
		chartDiv.selectChildren("div:not(#" + classPrefix + "tooltipDiv)").remove();
		setCallFunctions();
		callDrawingFunction();
	});

	breadcrumb.firstBreadcrumb.on("click", (event, d) => {
		const countries = createListMenu(selections, lists, pooledFundsInData, outerDiv);
		countries.on("click", (event, d) => {
			chartState.selectedCountryProfile = d;
			drawCountryProfile(worldMap, rawAllocationsData, pooledFundsInData, rawContributionsData, adminLevel1Data, cerfByPartnerData, selections, colorsObject, lists, outerDiv);
		});
		return;
	});

	function setCallFunctions() {
		if (selectedTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction = createCountryProfileOverview(chartDiv, lists, colorsObject, worldMap, tooltipDiv);
		if (selectedTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction = createCountryProfileByPartner(chartDiv, lists, colorsObject, tooltipDiv);
	};

	function callDrawingFunction() {
		if (selectedTab === tabsData[0]) tabsCallingFunctions.find(d => d.name === tabsData[0]).callingFunction(overviewData, overviewAdminLevel1Data, true, true);
		if (selectedTab === tabsData[1]) tabsCallingFunctions.find(d => d.name === tabsData[1]).callingFunction(byPartnerData, true, true);
	};

};

function createDropdown(container, pooledFundsInData, lists) {

	//IMPORTANT: change <select> for <div> elements

	const data = pooledFundsInData.flatMap(d => d.funds).sort((a, b) => lists.fundNamesList[a].localeCompare(lists.fundNamesList[b]));

	data.unshift(backToMenu);
	data.unshift(selectAnOption);

	const select = container.append("select");

	const options = select.selectAll(null)
		.data(data)
		.enter()
		.append("option")
		.property("disabled", (_, i) => !i)
		.attr("value", d => d)
		.html((d, i) => i > 1 ? lists.fundNamesList[d] : d);

	return select;

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

function processDataForCountryProfileOverview(rawDataAllocations, lists) {
	const data = [];
	rawDataAllocations.forEach(row => {
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

function processDataForCountryProfileByPartner(rawDataAllocations, cerfByPartnerData, lists) {

	const data = {
		cerf: [],
		cbpf: []
	};

	rawDataAllocations.forEach(row => {
		if (row.FundId === cbpfId && row.PooledFundId === chartState.selectedCountryProfile) {
			const foundYear = data.cbpf.find(e => e.year === row.AllocationYear);
			if (foundYear) {
				const foundPartner = foundYear.values.find(e => e.partner === row.OrganizatinonId);
				if (foundPartner) {
					foundPartner.value += row.ClusterBudget;
				} else {
					foundYear.values.push({
						partner: row.OrganizatinonId,
						value: row.ClusterBudget
					});
				};
			} else {
				data.cbpf.push({
					year: row.AllocationYear,
					values: [{
						partner: row.OrganizatinonId,
						value: row.ClusterBudget
					}]
				});
			};
		};
	});

	cerfByPartnerData.forEach(row => {
		if (row.PooledFundId === chartState.selectedCountryProfile) {
			const foundYear = data.cerf.find(e => e.year === row.AllocationYear);
			if (foundYear) {
				const foundPartner = foundYear.values.find(e => e.partner === row.PartnerCode);
				if (foundPartner) {
					foundPartner.value += row.Budget;
				} else {
					foundYear.values.push({
						partner: row.PartnerCode,
						value: row.Budget
					});
				};
			} else {
				data.cerf.push({
					year: row.AllocationYear,
					values: [{
						partner: row.PartnerCode,
						value: row.Budget
					}]
				});
			};
		};
	});

	data.cerf.sort((a, b) => a.year - b.year);
	data.cbpf.sort((a, b) => a.year - b.year);

	return data;

};

function pushCbpfOrCerf(obj, row, lists) {
	if (lists.fundTypesList[row.FundId] === "cbpf") {
		obj.cbpf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cbpf`] += +row.ClusterBudget;;
	} else if (lists.fundTypesList[row.FundId] === "cerf") {
		obj.cerf += +row.ClusterBudget;
		obj[`type${separator}${row.AllocationSurceId}${separator}cerf`] += +row.ClusterBudget;;
	};
	obj.total += +row.ClusterBudget;
	obj[`type${separator}${row.AllocationSurceId}${separator}total`] += +row.ClusterBudget;;
};

function processAllData(rawAllocationsData, adminLevel1Data, cerfByPartnerData, lists) {
	overviewData = processDataForCountryProfileOverview(rawAllocationsData, lists);
	overviewAdminLevel1Data = processAdminLevel1DataForCountryProfileOverview(adminLevel1Data);
	byPartnerData = processDataForCountryProfileByPartner(rawAllocationsData, cerfByPartnerData, lists);
};

export { createCountryProfile };