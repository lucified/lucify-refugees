
var React = require('react');

var RefugeeMap = require('./responsive-refugee-map.jsx');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var FormRow = require('lucify-commons/src/js/components/nice-form-row.jsx');
var Slider = require('lucify-commons/src/js/components/nice-slider.jsx');

var RefugeePlayContextDecorator = require('./refugee-play-context-decorator.jsx');

var TimeLayer = require('./refugee-map-time-layer.jsx');

var sprintf = require('sprintf');

var lucifyUtils = require('lucify-commons/src/js/lucify-utils.jsx');


var RefugeeMapSegment = React.createClass({


	componentWillMount: function() {
      	this.props.addStampListener(this.updateForStamp);
	},


    updateForStamp: function(stamp) {
    	this.refs.rmap.updateForStamp(stamp);
    	this.refs.time.updateForStamp(stamp);
	},


	interactionsEnabled: function() {
		return !lucifyUtils.isSlowDevice();
	},


	getPeoplePerPointText: function() {
		if (this.props.peoplePerPoint == 25) {
			return <span>
				Each moving point on the map represents
				25 people. This corresponds approximately to 
				a bus with every other seat taken.
			</span>
		};

		if (this.props.peoplePerPoint == 50) {
			return <span>
				Each moving point on the map represents
				50 people. This corresponds approximately 
				to a bus with no empty seats.
			</span>
		};

		return (
			<span>
				Each moving point on the map corresponds
				to {this.props.peoplePerPoint} people.
			</span>
		)
	},


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
										{this.getPeoplePerPointText()}
									</p>
								
								</div>
							}
							second={
								<div className="inputs__instructions">
									
									<FormRow
										title={<div>Speed</div>}
										input={<Slider min={1} max={100} 
											defaultValue={this.props.speed}
											onChange={this.props.handleSpeedChange} />} />
									
									<p className="first">
										Hover over countries to
										show details. Click on a country to 
										lock the selection. 
									</p>

									<p className="last">
										The line chart displays the rate of 
										asylum seekers over time. Hover over the
										chart to move the map in time.
									</p>

								</div>
							} />
					</div>
				</Inputs>

				<TimeLayer
				  ref="time"
		          onMouseOver={this.props.handleStampChange}
		          stamp={this.props.stamp}
		          refugeeCountsModel={this.props.refugeeCountsModel} />

				<RefugeeMap ref="rmap" 
					{...this.props} 
					interactionsEnabled={this.interactionsEnabled()} />
			</div>
		);
	}

});



module.exports = RefugeePlayContextDecorator(RefugeeMapSegment);
