const generalClassPrefix = "pfbihp";

function createButtons(containerSelection, chartState) {

	const helpIcon = containerSelection.append("button")
		.attr("id", generalClassPrefix + "HelpButton");

	helpIcon.html("HELP  ")
		.append("span")
		.attr("class", "fas fa-info")

	const downloadIcon = containerSelection.append("button")
		.attr("id", generalClassPrefix + "DownloadButton");

	downloadIcon.html(".CSV  ")
		.append("span")
		.attr("class", "fas fa-download");

	const snapshotDiv = containerSelection.append("div")
		.attr("class", generalClassPrefix + "SnapshotDiv");

	const snapshotIcon = snapshotDiv.append("button")
		.attr("id", generalClassPrefix + "SnapshotButton");

	snapshotIcon.html("IMAGE ")
		.append("span")
		.attr("class", "fas fa-camera");

	const snapshotContent = snapshotDiv.append("div")
		.attr("class", generalClassPrefix + "SnapshotContent");

	const pdfSpan = snapshotContent.append("p")
		.attr("id", generalClassPrefix + "SnapshotPdfText")
		.html("Download PDF")
	// .on("click", function() {
	// 	createSnapshot("pdf", false);
	// });

	const pngSpan = snapshotContent.append("p")
		.attr("id", generalClassPrefix + "SnapshotPngText")
		.html("Download Image (PNG)")
	// .on("click", function() {
	// 	createSnapshot("png", false);
	// });

	snapshotDiv.on("mouseover", function() {
		snapshotContent.style("display", "block")
	}).on("mouseout", function() {
		snapshotContent.style("display", "none")
	});

	//end of createButtons
};

export {
	createButtons
};