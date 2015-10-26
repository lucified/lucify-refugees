
var React = require('react');
var _ = require('underscore');
var moment = require('moment');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');
var FormRow = require('lucify-commons/src/js/components/nice-form-row.jsx');
var Slider = require('lucify-commons/src/js/components/nice-slider.jsx');
var ResponsiveDecorator = require('lucify-commons/src/js/decorators/responsive-decorator.jsx');
var debounceTime = require('lucify-commons/src/js/debounce-time.jsx');


var refugeeConstants = require('../../model/refugee-constants.js');
var RefugeeSankey = ResponsiveDecorator(require('./refugee-sankey.jsx'));


var RefugeeSankeySegment = React.createClass({


	getInitialState: function() {
		var ret = {
			offsetMonths: this.getMaximumOffset(),
			debouncedOffsetMonths: this.getMaximumOffset()}
		return ret;
	},


	getMaximumOffset: function() {
		var years = refugeeConstants.DATA_END_YEAR - refugeeConstants.DATA_START_YEAR;
		return years * 12 + refugeeConstants.DATA_END_MONTH - refugeeConstants.DATA_START_MONTH;
	},


	getMoment: function() {
		return moment([refugeeConstants.DATA_START_YEAR, refugeeConstants.DATA_START_MONTH])
			.add(this.state.offsetMonths, 'months');
	},


	getDebouncedMoment: function() {
		return moment([refugeeConstants.DATA_START_YEAR, refugeeConstants.DATA_START_MONTH])
			.add(this.state.debouncedOffsetMonths, 'months');
	},


	getMonth: function() {
		return this.getMoment().month();
	},


	getYear: function() {
		return this.getMoment().year();
	},


	getCountriesWithMissingData: function() {
		var countriesWithMissingData
			= this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(this.getDebouncedMoment());
		var length = countriesWithMissingData.length;
		if (length > 0) {
			var missingDataText;
			countriesWithMissingData = _.map(countriesWithMissingData, function(countryCode) {
				return this.props.mapModel.getFriendlyNameForCountry(countryCode);
			}.bind(this));
			if (length > 7) {
				missingDataText = "Missing data from " + countriesWithMissingData.slice(0, 6).join(', ') +
					" and " + (length - 6) + " other countries";
			} else {
				missingDataText = "Missing data from ";
				if (length > 1) {
					 missingDataText += countriesWithMissingData.slice(0, length - 1).join(', ') +	" and ";
				}
				missingDataText += countriesWithMissingData[length - 1];
			}
			return missingDataText;
		} else {
			return '';
		}
	},

	monthOffsetChange: function(newOffset) {
		this.updateMonthOffset(newOffset);
		this.scheduleUpdateDebouncedOffset();	
	},


	updateMonthOffset: function(newOffset) {
		this.setState({
			offsetMonths: newOffset
		});
	},


	updateDebouncedOffset: function() {
		this.setState({
			debouncedOffsetMonths: this.state.offsetMonths
		});	
	},


	renderTimeValue: function() {
		return (this.getMonth() + 1) + "/" + this.getYear();
	},


	componentDidMount: function() {
	  this.scheduleUpdateDebouncedOffset = _.debounce(function() {
        this.updateDebouncedOffset();
  	  }.bind(this), debounceTime(250, 50));
	},


	render: function() {
		return (
			<div className="refugee-sankey-segment">
				<Inputs>
					<div className="lucify-container">
						<DividedCols 
							first={
								<div className="inputs__instructions">
									<h3>Country by country</h3>

									<p className="first last">
										<em>The chart below</em> shows the
										monthly total refugees
										originating from and seeking
										asylum in different countries.
									</p>
								
								</div>
							}

							second={
								<div className="inputs__instructions">
									<FormRow
										title="Time"
										input={<Slider 
											defaultValue={this.state.offsetMonths}
											min={0} 
											max={this.getMaximumOffset()} 
											step={1}
											onChange={this.monthOffsetChange} />}  />
									<div className="refugee-sankey-segment__instructions">
										<p className="first last">
											Move the slider to move the 
											chart in time.
										</p>
										<p className="first last">
											Hover over countries to show details.
										</p>
									</div>
								</div>
							} />
					</div>
				</Inputs>

				<div className="refugee-sankey-segment__metadata lucify-container">
					<DividedCols
						first={
							<div className="refugee-sankey-segment__time-title">
								{this.getMoment().format("MMMM YYYY")}
							</div>
						}

						second={
							<div className="refugee-sankey-segment__missing-countries">
								<p className="first last">
									{this.getCountriesWithMissingData()}
								</p>
							</div>
						} />
				</div>
				<div className="refugee-sankey-segment__sankey">
					<div className="lucify-container">
						<RefugeeSankey {...this.props} 
							month={this.getDebouncedMoment().month()} year={this.getDebouncedMoment().year()} />
					</div>
				</div>

			</div>
		);
	}

});


module.exports = RefugeeSankeySegment;