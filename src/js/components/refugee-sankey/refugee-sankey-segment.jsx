

var React = require('react');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var FormRow = require('lucify-commons/src/js/components/nice-form-row.jsx');
var Slider = require('lucify-commons/src/js/components/nice-slider.jsx');

var ResponsiveDecorator = require('lucify-commons/src/js/decorators/responsive-decorator.jsx');

var moment = require('moment');

var refugeeConstants = require('../../model/refugee-constants.js');

var RefugeeSankey = ResponsiveDecorator(require('./refugee-sankey.jsx'));


var RefugeeSankeySegment = React.createClass({


	getInitialState: function() {
		return {offsetMonths: this.getMaximumOffset() - 1}
	},


	getMaximumOffset: function() {
		var years = refugeeConstants.DATA_END_YEAR - refugeeConstants.DATA_START_YEAR;
		return years * 12 + refugeeConstants.DATA_END_MONTH - refugeeConstants.DATA_START_MONTH + 1;
	},


	getMoment: function() {
		return moment([refugeeConstants.DATA_START_YEAR, refugeeConstants.DATA_START_MONTH])
			.add(this.state.offsetMonths, 'months');
	},

	getMonth: function() {
		return this.getMoment().month();
	},

	getYear: function() {
		return this.getMoment().year();
	},


	monthOffsetChange: function(newOffset) {
		this.setState({
			offsetMonths: newOffset
		})
	},

	renderTimeValue: function() {
		return (this.getMonth() + 1) + "/" + this.getYear();
	},


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
										input={<Slider min={0} max={this.getMaximumOffset()} onChange={this.monthOffsetChange} />} 
										value={this.renderTimeValue()} />
			
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
						<RefugeeSankey {...this.props} month={this.getMonth()} year={this.getYear()} />
					</div>
				</div>

			</div>
		);
	}

});


module.exports = RefugeeSankeySegment;