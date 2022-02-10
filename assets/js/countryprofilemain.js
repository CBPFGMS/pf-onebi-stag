//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";

//|constants
const classPrefix = "pfcpmain",
  menuIntroText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nunc tellus, volutpat a laoreet sit amet, rhoncus cursus leo. Fusce velit lorem, interdum eu dui in, luctus ultrices eros. Nullam eu odio in lectus ullamcorper vulputate et a mauris. Nullam nulla lectus, porttitor non interdum vitae, facilisis iaculis urna. Morbi cursus sit amet nibh non rutrum. Etiam in sodales ipsum. Etiam id est magna. Cras ut leo et mi egestas pharetra. Cras et tortor vitae quam fermentum condimentum. Morbi pharetra, est eu viverra tincidunt, mi massa laoreet felis, nec fringilla massa quam at arcu. Donec urna enim, luctus sed blandit ac, vehicula vitae ipsum. Donec in dui non nisl rutrum ornare. Sed sed porttitor massa, id hendrerit mi. Nullam vitae volutpat nulla. Donec elit justo, convallis sed erat ut, elementum aliquam sem.";

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists) {

  const outerDiv = selections.chartContainerDiv.append("div")
    .attr("class", classPrefix + "outerDiv");

  createListMenu(selections, lists, rawAllocationsData, outerDiv);

};

function createListMenu(selections, lists, rawAllocationsData, outerDiv) {

  const mainDiv = outerDiv.append("div")
    .attr("class", "country-pro-main");

  const container = mainDiv.append("div")
    .attr("class", "container");

  const title = container.append("h1")
    .html("Country Profile");

  const intro = container.append("p")
    .html(menuIntroText);

  const row = container.append("div")
    .attr("class", "row");

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

  uls.selectAll(null)
    .data(d => d.funds)
    .enter()
    .append("li")
    .append("a")
    .attr("href", "#")
    .html(d => lists.fundNamesList[d]);


};

export { createCountryProfile };