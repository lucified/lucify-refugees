
var React = require('react');

var RefugeeMap = require('./responsive-refugee-map.jsx');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var FormRow = require('lucify-commons/src/js/components/nice-form-row.jsx');
var Slider = require('lucify-commons/src/js/components/nice-slider.jsx');


var RefugeeMapSegment = React.createClass({

	render: function() {
		return (
			<div className="refugee-map-segment">
				<Inputs>
					<div className="lucify-container">
						<DividedCols 
							first={
								<div className="inputs__instructions">
									<h3>The flow towards Europe</h3>
									<p className="first">
										The below map shows the flow asylum
										seekers to European countries over time.
									</p>
									
									<p className="last">
										Most refugees never make it to Europe.
										UNHCR estimates that only 10% of Syrian
										refugees have sought asylum in Europe.
									</p>
								
								</div>
							}
							second={
								<div className="inputs__instructions">
									<p className="first last">
										Move the sliders to adjust speed and 
										move in time. 
									</p>

									<FormRow
										title={<div>Speed</div>}
										input={<Slider min={0} max={100} />} />
									
									<FormRow
										title={<div>Time</div>}
										input={<Slider min={0} max={100} />} />

									<p className="first last">
										Hover over countries to
										show details. Click on a country to 
										lock the selection.
									</p>
								</div>
							} />
					</div>
				</Inputs>
				<RefugeeMap {...this.props} />
			</div>
		);
	}

});


module.exports = RefugeeMapSegment;
