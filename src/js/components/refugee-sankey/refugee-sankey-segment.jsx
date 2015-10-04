

var React = require('react');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var FormRow = require('lucify-commons/src/js/components/nice-form-row.jsx');
var Slider = require('lucify-commons/src/js/components/nice-slider.jsx');

var RefugeeSankey = require('./refugee-sankey.jsx');


var RefugeeSankeySegment = React.createClass({

	render: function() {
		return (
			<div className="refugee-sankey-segment">
				<Inputs>
					<div className="lucify-container">
						<DividedCols 
							first={
								<div className="inputs__instructions">
									<h3>Countries involved</h3>

									<p className="first last">
										The below chart shows
										the monthly amount of refugees
										originating and seeking asylum
										from different countries.
									</p>
								
								</div>
							}

							second={
								<div className="inputs__instructions">
									<p className="first last">
										Move the slider to move in time.
									</p>
							
									<FormRow
										title="Time"
										input={<Slider min={0} max={100} />} />
			
									<p className="first last">
										Hover over countries to show details. 
										Click on a country to  lock the selection.
									</p>
								</div>
							} />
					</div>
				</Inputs>

				<div className="refugee-sankey-segment__sankey">
					<div className="lucify-container">
						<RefugeeSankey {...this.props} />
					</div>
				</div>

			</div>
		);
	}

});


module.exports = RefugeeSankeySegment;