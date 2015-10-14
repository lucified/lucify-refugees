
var React = require('react');
var _ = require('underscore');


var RefugeeSoccerSegment = React.createClass({


	getSoccerFields: function(count) {
		return _.range(0, count).map(function() {
			return <img src='images/soccer-field.svg' />
		});
	},


	getEuropeanCount: function() {
		return 507421;
	},


	getRegionalCount: function() {
		// http://data.unhcr.org/syrianrefugees/regional.php
		return 4185302;
	},


	getRegionalSoccerFieldsCount: function() {
		return Math.ceil(this.getRegionalCount() / this.getSoccerFieldCount());
	},


	getEuropeanSoccerFieldsCount: function() {
		return Math.ceil(this.getEuropeanCount() / this.getSoccerFieldCount());
	},


	getSoccerFieldCount: function() {
		// from http://waitbutwhy.com/2015/03/7-3-billion-people-one-building.html
		return 71000;
	},


	shouldComponentUpdate: function() {
		return false;
	},


	render: function() {
		return (
			<div className="refugee-soccer-segment">

				<div className="lucify-container">
					<h3>Only a fraction makes it to Europe</h3>

					<p>
						The United Nations estimates that half a million Syrian 
						refugees have sought asylum in Europe between 
						April 2011 and September 2015. Standing very tighly together, 
						they would fit 	on {this.getEuropeanSoccerFieldsCount()} 
						{' '} soccer fields.
					</p>

					{this.getSoccerFields(this.getEuropeanSoccerFieldsCount())}

					<p>
						Only a small fraction of refugees fleeing 
						their homes make it to Europe. The UN
						has registered four million Syrian
						refugees in Turkey, Lebanon, Jordan, Iraq and Egypt
						and North Africa. Most of them live in refugee camps
						next to the border.
 						They would fit on {this.getRegionalSoccerFieldsCount()} 
						{' '}soccer fields.
					</p>

					{this.getSoccerFields(this.getRegionalSoccerFieldsCount())}
				</div>
			</div>
		);
	}

});


module.exports = RefugeeSoccerSegment;