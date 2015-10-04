
var React = require('react');

var Decorator = require('./refugee-context-decorator.jsx');
var RefugeeMapSegment = require('./refugee-map/refugee-map-segment.jsx');
var RefugeeSankeySegment = require('./refugee-sankey/refugee-sankey-segment.jsx');


var RefugeeMainContent = React.createClass({

	render: function() {

		window.pp = this.props;

		return (

			<div className="refugee-main-content">

				<RefugeeMapSegment {...this.props} />
				
				<RefugeeSankeySegment {...this.props} />

			</div>
			
		);

	}

});

/*
				
*/

module.exports = Decorator(RefugeeMainContent);


