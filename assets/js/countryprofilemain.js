//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";

//|constants

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists, generalClassPrefix) {

  createListMenu(selections, lists, generalClassPrefix);

  console.log(lists)

};

function createListMenu(selections, lists, generalClassPrefix) {
  selections.chartContainerDiv.select("div:not(#" + generalClassPrefix + "SnapshotTooltip)").remove();
};

export { createCountryProfile };