
var React = require('react');

var Decorator = require('./refugee-context-decorator.jsx');
var RefugeeMapSegment = require('./refugee-map/refugee-map-segment.jsx');
var RefugeeSankeySegment = require('./refugee-sankey/refugee-sankey-segment.jsx');
var RefugeeSoccerSegment = require('./refugee-soccer/refugee-soccer-segment.jsx');



var RefugeeMainContent = React.createClass({


	getDefaultProps: function() {
		return {
			mapEnabled: true,
			sankeyEnabled: true,
			soccerEnabled: true
		};
	},


	getMapSegment: function() {
		if (this.props.mapEnabled) {
			return <RefugeeMapSegment {...this.props} />
		}
		return <div />;
	},


	getSankeySegment: function() {
		if (this.props.sankeyEnabled) {
			return <RefugeeSankeySegment {...this.props} />
		}
		return <div />;
	},


	getSoccerSegment: function() {
		if (this.props.soccerEnabled) {
			return <RefugeeSoccerSegment {...this.props} />
		}
		return <div />;
	},


	render: function() {

		// providing a min-height will help the browser
		// to know that there will be a scrollbar
		//
		// this will help the browser to figure out the
		// correct width immediately without an extra
		// iteration

		return (
			<div className="refugee-main-content"
				style={{minHeight: 2000}}>
				{this.getMapSegment()}
				{this.getSankeySegment()}
				{this.getSoccerSegment()}
			</div>
		);

	}

});


module.exports = Decorator(RefugeeMainContent);
