
var React = require('react');
var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');

var refugeeConstants = require('../../model/refugee-constants.js');
var moment = require('moment');

var theme = require('lucify-commons/src/js/lucify-theme.jsx');


var RefugeeMapLineChart = React.createClass({


	getData: function() {
		var mom = moment([refugeeConstants.DATA_START_YEAR, refugeeConstants.DATA_START_MONTH]);
		var endMoment = moment([refugeeConstants.DATA_END_YEAR, refugeeConstants.DATA_END_MONTH]);
		var cols = [];
		var xvals = [];

		do {
			var counts = this.props.refugeeCountsModel.getGlobalArrivingPerDayCounts(mom.unix());
			cols.push(counts.asylumApplications);
			xvals.push(mom.unix());
			mom.add(5, 'days');
		} while (endMoment.diff(mom) > 0);


		var ret = {
			x: 'x',
			columns: [
				['x'].concat(xvals),
				['data1'].concat(cols)
			],
			colors: {
				//data1: theme.cyan
				data1: '#ffffff'
			},
			onmouseover: this.handleMouseOver
		}
		return ret;
	},


	getFriendlyTime: function() {
		return moment(new Date(this.props.stamp * 1000)).format('DD.MM.YYYY');
	},


	shouldComponentUpdate: function() {
		this.updateLine(this.props.stamp);
		return false;
	},


	updateLine: function(stamp) {
		var chart = this.refs.c3Chart.chart;
		
		if (!this.lineSel) {
			this.lineSel = d3.select(this.getDOMNode()).select('.c3-xgrid-line');
		}
		
		var xval = chart.internal.x(stamp);
		
		this.lineSel.select('line')
			.attr('x1', xval)
			.attr('x2', xval);

		this.lineSel.select('text')
			.attr('y', xval)
			.text(this.getFriendlyTime());

		// we update the line with the above code
		// since the c3 api function xgrids triggers a redraw
		// for the whole chart

		//chart.xgrids([
   		//	{value: this.props.stamp, text: this.getFriendlyTime()},
  		//]);

		//chart.regions([
		//	{axis: 'x', end: this.props.stamp, 'class': 'regionX'}
		//]);
	},


	handleMouseOver: function(d) {
		this.updateLine(d.x);
		if (this.props.onMouseOver) {
			this.props.onMouseOver(d.x);
		}
	},


	getSpec: function() {
		return {
			axis: {
				x: {
					show: false
				},
				y: {
					show: false
				},
			},
			point: {
				show: false
			},
			legend: {
				show: false
			},
			padding: {
				top: 0,
				bottom: 0,
				right: 0,
				left: 0
			},
			tooltip: {
				show: false
			},
			grid: {
				x: {
					lines: [
						{value: this.props.stamp, text: this.getFriendlyTime()}
					]
				}
			}
		};
	},


	render: function() {

		return (
			<div className='refugee-map-line-chart'>
				<C3Chart 
					ref='c3Chart'
					lineStrokeWidth={2}
					height={100}
					spec={this.getSpec()} 
					data={this.getData()} />
			</div>
		);
	}

});

module.exports = RefugeeMapLineChart;