
var React = require('react');
var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');

var refugeeConstants = require('../../model/refugee-constants.js');
var moment = require('moment');
var _ = require('underscore');

var theme = require('lucify-commons/src/js/lucify-theme.jsx');


var RefugeeMapLineChart = React.createClass({


	getData: function() {
		var mom = moment([refugeeConstants.DATA_START_YEAR, refugeeConstants.DATA_START_MONTH]);
		var endMoment = refugeeConstants.DATA_END_MOMENT;
		var cols = [];
		var xvals = [];

		do {
			var counts = this.props.refugeeCountsModel.getGlobalArrivingPerDayCounts(mom.unix());
			cols.push(counts.asylumApplications);
			xvals.push(mom.unix());
			mom.add(5, 'days');
		} while (endMoment.diff(mom) >= 0);


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
			onmouseover: this.handleMouseOverChart,
			onclick: this.handleOnClick,
			regions: {
				'data1': [{
						start: this.getDataMissingStartStamp(),
						end: refugeeConstants.DATA_END_MOMENT.unix(),
						style: 'dashed'
				}]
			}
		};
		return ret;
	},


	getFriendlyTime: function() {
		return moment(new Date(this.props.stamp * 1000)).format('DD.MM.YYYY');
	},


	componentWillReceiveProps: function() {
		this.updateLine(this.props.stamp);
	},


	shouldComponentUpdate: function() {
		return false;
	},


	updateLine: function(stamp) {
		var chart = this.refs.c3Chart.chart;
		
		if (!this.lineSel) {
			this.lineSel = d3.select(this.getDOMNode()).select('.c3-xgrid-line');
		}
		
		var xval = chart.internal.x(stamp);

		// we update the line directly 
		// since the c3 api function xgrids 
		// triggers a redraw for the whole chart
		
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

		this.updateCountriesWithMissingData(stamp);
	},


	updateCountriesWithMissingData: function(stamp) {
		var timestampMoment = moment.unix(stamp);
		var res = this.countriesWithMissingDataCache[timestampMoment.year() * 12 + timestampMoment.month()];

		if (res == null) {
			var countriesWithMissingData
				= this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestampMoment);
			var length = countriesWithMissingData.length;
			if (length > 0) {
				var missingDataText;
				countriesWithMissingData = _.map(countriesWithMissingData, function(countryCode) {
					return this.props.mapModel.getFriendlyNameForCountry(countryCode);
				}.bind(this));
				if (length > 5) {
					missingDataText = "Missing data from " + countriesWithMissingData.slice(0, 4).join(', ') +
						" and " + (length - 4) + " other countries";
				} else {
					missingDataText = "Missing data from ";
					if (length > 1) {
						 missingDataText += countriesWithMissingData.slice(0, length - 1).join(', ') +	" and ";
					}
					missingDataText += countriesWithMissingData[length - 1];
				}

				res = {
					title: "Missing data for " + countriesWithMissingData.join(', '),
					text: missingDataText
				};

			} else {
				res = {
					title: '',
					text: ''
				};
			}
			this.countriesWithMissingDataCache[timestampMoment.year() * 12 + timestampMoment.month()] = res;
		}

		this.labelSelection
			.attr('title', res.title)
			.text(res.text);
	},


	updatePosition: function(d) {
		this.updateLine(d.x);
		if (this.props.onMouseOver) {
			this.props.onMouseOver(d.x);
		}
	},


	handleOnClick: function(d) {
		// Touch devices are never really
		// hovering on the timeline, so the
		// timing logic will not work, even
		// when the touch device is sending
		// a mouseOverEvent for a tap.
		//
		// We should always update on a "click" 
		// event to support touch devices.
		// 
		// However the onClick on c3.js only supports
		// clicks on the line itself. We will listen
		// to onClick of the parent component and use
		// the position conveyed via onMouseOver.
		//  
		// To be sure that the onMouseOver runs
		// before the onClick event, we execute
		// the update after a small delay
		// 
		window.setTimeout(function() {
			if (this.d != null) {
				this.updatePosition(this.d);	
			}
		}.bind(this), 100);
	},


	handleMouseOverChart: function(d) {
		this.d = d;

		// use a simple timing logic to ignore occasions where
		// the mouse clickly passed over the timeline chart,
		// while maintaining the ability to scroll through time
		// on hover
		if (!this.mouseOverStamp || Date.now() - this.mouseOverStamp < 250) {
			return;
		}
		
		this.updatePosition(d);
	},


	handleMouseOver: function() {
		if (!this.mouseOverStamp) {
			this.mouseOverStamp = Date.now();	
		}
	},


	handleMouseLeave: function() {
		this.mouseOverStamp = null;
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


	getDataMissingStartStamp: function() {
		var timestamp = moment(refugeeConstants.DATA_END_MOMENT);
		var countriesWithMissingData = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestamp);

		while (countriesWithMissingData.length > 0) {
			timestamp.subtract(1, 'months');
			countriesWithMissingData = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestamp);
		}

		return timestamp.endOf('month').unix();
	},


	componentDidMount: function() {
		this.labelSelection = d3.select(React.findDOMNode(this.refs.missingData));
		this.countriesWithMissingDataCache = {};
	},



	render: function() {
		return (
			<div className='refugee-map-line-chart'
				onMouseOver={this.handleMouseOver}
				onMouseLeave={this.handleMouseLeave}
				onClick={this.handleOnClick} >
				<span ref="missingData" className="refugee-map-line-chart__missing-data" />
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