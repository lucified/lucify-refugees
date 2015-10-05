
var React = require('react');

var Decorator = require('./refugee-context-decorator.jsx');
var RefugeeMapSegment = require('./refugee-map/refugee-map-segment.jsx');
var RefugeeSankeySegment = require('./refugee-sankey/refugee-sankey-segment.jsx');


var RefugeeMainContent = React.createClass({

	render: function() {

		window.pp = this.props;

		return (

			<div className="refugee-main-content">


				
				<RefugeeSankeySegment {...this.props} />

			</div>
			
		);

	}

});

/*
				
*/

//<RefugeeMapSegment {...this.props} />

module.exports = Decorator(RefugeeMainContent);


