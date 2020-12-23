//|Options buttons

import {
	chartState
} from "./chartstate.js";

const generalClassPrefix = "pfbihp",
	allocationsDataUrl = "https://cbpfgms.github.io/pf-onebi-data/download/pfmb_allocations.csv",
	contributionsDataUrl = "https://cbpfgms.github.io/pf-onebi-data/download/pfmb_contributions.csv",
	helpPortalUrl = "https://gms.unocha.org/content/business-intelligence";

const buttonsObject = {
	timer: null,
	playing: false,
	createButtons(containerSelection, yearsArrayAllocations, yearsArrayContributions, duration, selections) {

		const yearsArray = chartState.selectedChart !== "contributionsByCerfCbpf" ? JSON.parse(JSON.stringify(yearsArrayAllocations)) :
			JSON.parse(JSON.stringify(yearsArrayContributions));

		const helpIcon = containerSelection.append("button")
			.attr("id", generalClassPrefix + "HelpButton");

		helpIcon.html("HELP  ")
			.append("span")
			.attr("class", "fas fa-info");

		const downloadIcon = containerSelection.append("button")
			.attr("id", generalClassPrefix + "DownloadButton");

		downloadIcon.html(".CSV  ")
			.append("span")
			.attr("class", "fas fa-download");

		const playIcon = containerSelection.append("button")
			.datum({
				clicked: false
			})
			.attr("id", generalClassPrefix + "PlayButton");

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

		snapshotDiv.on("mouseover", () => snapshotContent.style("display", "block"))
			.on("mouseout", () => snapshotContent.style("display", "none"));

		helpIcon.on("click", () => {
			window.open(helpPortalUrl, "help_portal");
		});

		downloadIcon.on("click", () => {
			if (chartState.selectedChart.includes("contributions")) {
				window.open(contributionsDataUrl, "_blank");
			} else {
				window.open(allocationsDataUrl, "_blank");
			};
		});

		playIcon.html("PLAY  ")
			.append("span")
			.attr("class", "fas fa-play");

		playIcon.on("click", (_, d) => {
			d.clicked = !d.clicked;
			playIcon.html(d.clicked ? "PAUSE " : "PLAY  ")
				.append("span")
				.attr("class", d.clicked ? "fas fa-pause" : "fas fa-play");

			if (d.clicked) {
				loopYears();
				this.playing = true;
				this.timer = d3.interval(loopYears, 2 * duration);
			} else {
				this.playing = false;
				this.timer.stop();
			};

			function loopYears() {
				const index = yearsArray.indexOf(chartState.selectedYear);
				chartState.selectedYear = yearsArray[(index + 1) % yearsArray.length];
				if (chartState.selectedChart !== "contributionsByCerfCbpf") {
					selections.yearDropdown.selectAll("option")
						.property("selected", d => chartState.selectedYear === d);
					selections.yearDropdown.dispatch("change");
				} else {
					const yearButton = d3.select(".pfbiccyearButtonsDiv")
						.selectAll("button")
						.filter(d => d === chartState.selectedYear);

					yearButton.dispatch("click");
					yearButton.dispatch("click");
				};
			};

		});

		//end of createButtons
	}
};

export {
	buttonsObject
};