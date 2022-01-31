//|Country Profile main module
import { chartState } from "./chartstate.js";
import { createLinks } from "./links.js";

function createCountryProfile(worldMap, rawAllocationsData, rawContributionsData, adminLevel1Data, selections, colorsObject, lists) {

	const mockup = selections.chartContainerDiv.append("div")
		.attr("class", "country-pro-main")
		.html(`<div class="container">
    <h1>Country Profile</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nunc tellus, volutpat a laoreet sit amet, rhoncus cursus leo. Fusce velit lorem, interdum eu dui in, luctus ultrices eros. Nullam eu odio in lectus ullamcorper vulputate et a mauris. Nullam nulla lectus, porttitor non interdum vitae, facilisis iaculis urna. Morbi cursus sit amet nibh non rutrum. Etiam in sodales ipsum. Etiam id est magna. Cras ut leo et mi egestas pharetra. Cras et tortor vitae quam fermentum condimentum. Morbi pharetra, est eu viverra tincidunt, mi massa laoreet felis, nec fringilla massa quam at arcu. Donec urna enim, luctus sed blandit ac, vehicula vitae ipsum. Donec in dui non nisl rutrum ornare. Sed sed porttitor massa, id hendrerit mi. Nullam vitae volutpat nulla. Donec elit justo, convallis sed erat ut, elementum aliquam sem.</p>
    <div class="row">
      <div class="col-md-4">
        <div class="country-list mb-4">
          <h2>West and Central Africa</h2>
          <ul>
            <li><a href="#">Burkina Faso</a></li>
            <li><a href="#">Cameroon</a></li>
            <li><a href="#">Central African Republic (CAR)</a></li>
            <li><a href="#">Chad</a></li>
            <li><a href="#">Democratic Republic of the Congo (DRC)</a></li>
            <li><a href="#">Mali</a></li>
            <li><a href="#">Niger</a></li>
            <li><a href="#">Nigeria</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="country-list mb-4">
          <h2>Middle East and North Africa</h2>
          <ul>
            <li><a href="#">Iraq</a></li>
            <li><a href="#">Lebanon</a></li>
            <li><a href="#">Libya</a></li>
            <li><a href="#">Occupied Palestinian Territory</a></li>
            <li><a href="#">Syria</a></li>
            <li><a href="#">Yemen</a></li>
            <li><a href="#">Turkey</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="country-list mb-4">
          <h2>Asia and the Pacific</h2>
          <ul>
            <li><a href="#">Afghanistan</a></li>
            <li><a href="#">Myanmar</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="country-list mb-4">
          <h2>Southern and Eastern Africa</h2>
          <ul>
            <li><a href="#">Burundi</a></li>
            <li><a href="#">Eritrea</a></li>
            <li><a href="#">Ethiopia</a></li>
            <li><a href="#">Somalia</a></li>
            <li><a href="#">South Sudan</a></li>
            <li><a href="#">Sudan</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="country-list mb-4">
          <h2>Latin America and the Caribbean</h2>
          <ul>
            <li><a href="#">Colombia</a></li>
            <li><a href="#">Haiti</a></li>
            <li><a href="#">Venezuela</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="country-list mb-4">
          <h2>Eastern Europe</h2>
          <ul>
            <li><a href="#">Ukraine</a></li>
          </ul>
        </div>
      </div>
    </div>
</div>`);

};

export { createCountryProfile };