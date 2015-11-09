
var React = require('react');
var _ = require('underscore');

var SoccerFields = require('lucify-commons/src/js/components/soccer-fields.jsx');
var DataUpdated = require('../refugee-data-updated.jsx');
var RefugeeConstants = require('../../model/refugee-constants.js');


var RefugeeSoccerSegment = React.createClass({


	getEuropeanCount: function() {
		// http://data.unhcr.org/syrianrefugees/regional.php, Total Syrian Asylum Applications in Europe
		return 512909; // Updated 31.10.2015
	},


	getRegionalCount: function() {
		// http://data.unhcr.org/syrianrefugees/regional.php, Registered Syrian Refugees
		return 4290332; // Updated 3.11.2015
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

					<SoccerFields count={this.getEuropeanSoccerFieldsCount()} />

					<p>
						Only a small fraction of refugees fleeing
						their homes make it to Europe. The UN
						has registered four million Syrian
						refugees in Turkey, Lebanon, Jordan, Iraq, Egypt and
						North Africa. Most of them live in refugee camps
						close to the border.
						They would fit on {this.getRegionalSoccerFieldsCount()}
						{' '}soccer fields.
					</p>

					<SoccerFields count={this.getRegionalSoccerFieldsCount()} />

				</div>

				<DataUpdated updatedAt={RefugeeConstants.SYRIA_REFUGEES_DATA_UPDATED_MOMENT} />
			</div>
		);
	}

});


module.exports = RefugeeSoccerSegment;
