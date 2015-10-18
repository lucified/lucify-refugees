
var React = require('react');

var HideableContainer = require('lucify-commons/src/js/components/hideable-container.jsx');

var Decorator = require('./refugee-context-decorator.jsx');
var RefugeeMapSegment = require('./refugee-map/refugee-map-segment.jsx');
var RefugeeSankeySegment = require('./refugee-sankey/refugee-sankey-segment.jsx');
var RefugeeSoccerSegment = require('./refugee-soccer/refugee-soccer-segment.jsx');

var Loading = require('lucify-commons/src/js/components/loading.jsx');




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
			return (
				<HideableContainer visible={this.props.loaded}>
					<RefugeeMapSegment {...this.props} />
				</HideableContainer>
			);
		}
		return <div />;
	},


	getSankeySegment: function() {
		if (this.props.loaded && this.props.sankeyEnabled) {
			return <RefugeeSankeySegment {...this.props} />
		}
		return <div />;
	},


	getSoccerSegment: function() {
		if (this.props.loaded && this.props.soccerEnabled) {
			return <RefugeeSoccerSegment {...this.props} />
		}
		return <div />;
	},


	getLoadingSegment: function() {
		if (!this.props.loaded) {
			return (
				<div className="lucify-container">
					<Loading progress={this.props.loadProgress} />
				</div>
			);
		}
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
				{this.getLoadingSegment()}
				{this.getMapSegment()}
				{this.getSankeySegment()}
				{this.getSoccerSegment()}
			</div>
		);

	}

});


module.exports = Decorator(RefugeeMainContent);
