function createLinks(containerSelection) {

	const cbpfLink = containerSelection.append("a")
		.attr("class", "nav-link small cbpf-link")
		.attr("data-toggle", "tooltip")
		.attr("href", "https://pfbi.unocha.org")
		.attr("title", "CBPF BI")
		.attr("target", "_blank");

	cbpfLink.append("span")
		.attr("class", "icon-chart")
		.append("i")
		.attr("class", "fas fa-chart-bar");

	cbpfLink.append("span")
		.html("CBPF BI");

	const cerfLink = containerSelection.append("a")
		.attr("class", "nav-link small cerf-link")
		.attr("data-toggle", "tooltip")
		.attr("href", "https://cbpfgms.github.io/cerf-bi-stag/")
		.attr("title", "CBPF BI")
		.attr("target", "_blank");

	cerfLink.append("span")
		.attr("class", "icon-chart")
		.append("i")
		.attr("class", "fas fa-chart-bar");

	cerfLink.append("span")
		.html("CERF BI");

};

export {
	createLinks
};