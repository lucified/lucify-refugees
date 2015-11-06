
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');
var deepcopy = require('deepcopy');
var sprintf = require('sprintf');

d3.sankey = require('./d3-sankey.js');

var countries = require("i18n-iso-countries");
var classNames = require('classNames');



var getCountryFromNodeId = function(id) {
	return id.replace('_dest', '').replace('_origin', '');
}


// Child components 
// ----------------


var Node = React.createClass({


	componentDidUpdate: function() {
		this.update(true);
	},


	componentDidMount: function() {
		this.update(false);
	},


	update: function(transition) {
		var item = this.props.item;
		var cond = item.x < this.props.width / 2;

		var sel = d3.select(this.getDOMNode());

		if (transition) {
			sel = sel.transition();
		}

		sel.attr('transform', sprintf('translate(%.2f, %.2f)', item.x, item.y));
	
		var height = Math.max(Math.round(item.dy), 2);

		sel.select('rect')
			.attr('height', height)
			.attr('width', this.props.nodeWidth);

		sel.select('text')
			.attr('y', height / 2)
			.select('.value')
				.text(this.getValue());
	},


	getValue: function() {

		var node = this.props.item;

		var country = getCountryFromNodeId(node.name);

		if (this.props.activeNode == null || this.props.activeNode.name == node.name) {
			return node.value;
		}

		var found = _.find(node.sourceLinks, function(item) {
			return item.targetName == this.props.activeNode.name;
		}.bind(this));

		if (found != null) {
			return found.value + " to " + this.props.getCountryName(
				getCountryFromNodeId(this.props.activeNode.name));
		}

		found = _.find(node.targetLinks, function(item) {
			return item.sourceName == this.props.activeNode.name;
		}.bind(this));

		if (found != null) {
			return found.value;
			// this is a bit too long probably
			//return found.value 
			//	+ " from " 
			//	+ this.props.getCountryName(this.props.activeCountry)
			//	+ " to"
		}

		return "\u00A0";
	},


	render: function() {
		var item = this.props.item;

		var cond = item.x < this.props.width / 2;
		var anchor = cond ? "start" : "end";
		var x = cond ? 6 + this.props.nodeWidth : -6;
		
		var classes = classNames({
			node: true,
			'node--hovered': item == this.props.activeNode,
			'node--unselected': item !== this.props.activeNode && this.props.activeNode != null
		});

		var textComponent;
		var params = {
			x: x,
			dy: "0.35em",
			textAnchor: anchor
		}

		if (!cond) {
			textComponent = (
				<text {...params} dx="-6">
					<tspan className="value"></tspan>
					<tspan className="countryName" dx="6">{this.props.friendlyName}</tspan>
				</text>
			)
		} else {
			textComponent = (
				<text {...params}>
					<tspan className="countryName">{this.props.friendlyName}</tspan>
					<tspan className="value" dx="6"></tspan>
				</text>
			)
		}

		return (
			<g className={classes}>
				<rect 
					onMouseOver={this.props.onMouseOver}
					onMouseOut={this.props.onMouseOut} />
				{textComponent}
			</g>
		);
	}
	
});



var LinkPath = React.createClass({


	componentDidUpdate: function() {
		this.update(true);
	},

	componentDidMount: function() {
		this.update(false);
	},


	update: function(transition) {
		var item = this.props.item;		
		var sel = d3.select(this.getDOMNode());

		if (transition) {
			sel = sel.transition();
		}

		sel.attr('d', this.props.pathFunction(item));
	},


	render: function() {
		var item = this.props.item;
		var classes = classNames({
			'link': true,
			'link--unselected': this.props.activeNode != null
				&& item.sourceName != this.props.activeNode.name 
				&& item.targetName != this.props.activeNode.name,
			'link--hovered': this.props.activeNode != null
				&& (item.sourceName == this.props.activeNode.name
				|| item.targetName == this.props.activeNode.name)
		});

		return (
			<path className={classes}
				strokeWidth={Math.max(1, item.dy)} />
		);
	}
});


// Main Component 
// --------------


var RefugeeSankey = React.createClass({


	getInitialState: function() {
		return {
			hovered: null
		}
	},


	getDefaultProps: function() {
		return {
			width: 800,
		}
	},


	componentDidMount: function() {
		this.colorScale = d3.scale.category20();
	},


	getNodes: function() {
 		return this.getOrderedNodeIds().map(function(item) {
 			return {name: item}
 		});
	},


	getOriginId: function(country) {
		return country + "_origin";
	},


	getDestinationId: function(country) {
		return country + "_dest";
	},


	getOriginNodeIds: function() {
		var ret = {};
		this.getSimplifiedData().forEach(function(item) {
			ret[this.getOriginId(item.oc)] = true;
		}.bind(this));
		return _.keys(ret);
	},


	getDestinationNodeIds: function() {
		var ret = {};
		this.getSimplifiedData().forEach(function(item) {
			ret[this.getDestinationId(item.ac)] = true;
		}.bind(this));
		return _.keys(ret);	
	},


	getOrderedNodeIds: function() {
		return this.getOriginNodeIds().concat(this.getDestinationNodeIds());
	},


	getLinks: function() {
		var nodes = this.getOrderedNodeIds();
		return this.getSimplifiedData().map(function(item) {
			return {
				source: nodes.indexOf(this.getOriginId(item.oc)),
				target: nodes.indexOf(this.getDestinationId(item.ac)),
				sourceName: this.getOriginId(item.oc),
				targetName: this.getDestinationId(item.ac),
				value: item.count
			}
		}.bind(this));
	},


	/*
	 * Get raw data
	 */
	getData: function() {
		return this.props.asylumData.filter(function(item) {
			return item.year == this.props.year 
				&& item.month == this.props.month + 1
				&& item.count > 0;
		}.bind(this));
	},


	// get a hash of totals for each country
	//
	getCountryTotals: function(data) {
		var sourceCounts = {};
		var targetCounts = {};

		this.getData().forEach(function(item) {
			if (!targetCounts[item.ac]) {
				targetCounts[item.ac] = 0;
			}
			targetCounts[item.ac] += item.count;
		
			if (!sourceCounts[item.oc]) {
				sourceCounts[item.oc] = 0;
			}
			sourceCounts[item.oc] += item.count;
		});

		return {
			sourceCountries: sourceCounts,
			targetCountries: targetCounts
		}
	},


	toCappedList: function(obj) {
		var sorted = _.pairs(obj).sort(function(a, b) {
			return b[1] - a[1];
		});

		return sorted.slice(0, Math.min(15, sorted.length)).map(function(item) {
			return item[0];
		});
	},


	/*
	 * Get a list of source countries that
	 * are significant enough to be shown
	 */
	getSourceCountries: function() {
		return this.toCappedList(this.getCountryTotals().sourceCountries);
	},


	/*
	 * Get a list of target countries
     * that are significant enough to be shown
	 */
	getTargetCountries: function() {
		return this.toCappedList(this.getCountryTotals().targetCountries);
	},


	/*
	 * Get data simplified in such a way that
     * insignificant countries are mapped to "others"
     */
	getSimplifiedData: function() {
		var ret = [];

		var sourceCountries = this.getSourceCountries();
		var targetCountries = this.getTargetCountries();

		this.getData().forEach(function(item) {
			var sourceCountry = sourceCountries.indexOf(item.oc) !== -1 && item.oc !== 'XXX' ? item.oc : "others";
			var targetCountry = targetCountries.indexOf(item.ac) !== -1 && item.ac !== 'XXX' ? item.ac : "others";
			
			if (sourceCountry == "others" || targetCountry == "others") {
				var found = _.find(ret, function(val) {
					return val.oc == sourceCountry && val.ac == targetCountry;
				});
				if (found) {
					found.count += item.count;
					return;
				}
			}
			ret.push({
				oc: sourceCountry,
				ac: targetCountry,
				count: item.count
			});
		});

		return ret;
	},


	getWidth: function() {
		return this.props.width;
	},


	getHeight: function() {
		return Math.min(this.props.width, Math.max(window.innerHeight * 0.6, 600));
	},


	getCountryName: function(name) {

		if (name == "others") {
			return "Others";
		}

		var friendlyName = this.props.mapModel.getFriendlyNameForCountry(name);

		if (!friendlyName) {
			console.log("no name for " + name);
		}

		return friendlyName;
	},


	getActiveNode: function() {
		return this.state.hovered;
	},


	getOnMouseOut: function(item) {
		return function() {
			this.setState({hovered: null});	
			//if (this.state.hovered == item) {
			//}
		}.bind(this);
	},


	getOnMouseOver: function(item) {
		return function() {
			console.log("hovering on" + item);
			this.setState({hovered: item});
		}.bind(this);
	},


	renderLinks: function(links, pathFunction) {
		return links.map(function(item) {
			return <LinkPath
					key={item.sourceName + item.targetName}
					item={item}
					pathFunction={pathFunction}
					activeNode={this.getActiveNode()} />
		}.bind(this));
	},


	renderNodes: function(nodes, sankey) {
		return nodes.map(function(item) {

			var country = getCountryFromNodeId(item.name);

			return (
				<Node 
					getCountryName={this.getCountryName} // sic
					width={this.getWidth()}
					key={item.name}
				    item={item} 
					onMouseOver={this.getOnMouseOver(item)}
					onMouseOut={this.getOnMouseOut(item)}
					activeNode={this.getActiveNode()}
					nodeWidth={sankey.nodeWidth()}
					friendlyName={this.getCountryName(country)} />
			);
		}.bind(this));
	},


	componentWillReceiveProps: function(nextProps) {
		if (nextProps.width !== this.props.width) {
			this._sankey = null;
		}

		if (nextProps.month !== this.props.month
			|| nextProps.year !== this.props.year) {
			this._nodes = null;
			this._links = null;
		}
	},


	getSankey: function() {
		if (!this._sankey) {
			this._sankey = d3.sankey()
				.nodeWidth(15)
				.nodePadding(10)
				.size([this.getWidth(), this.getHeight()]);
		}
		return this._sankey;
	},


	shouldComponentUpdate: function(nextProps, nextState) {
		return this.props.month !== nextProps.month
			|| this.props.year !== nextProps.year
			|| this.state.hovered !== nextState.hovered
			|| this.props.asylumData !== nextProps.asylumData
			|| this.props.width !== nextProps.width;
	},


	getCachedNodes: function() {
		if (!this._nodes) {
			this._nodes = this.getNodes();
		}
		return this._nodes;
	},


	getCachedLinks: function() {
		if (!this._links) {
			this._links = this.getLinks();
		}
		return this._links;
	},


	render: function() {
		if (!this.props.asylumData) {
			return <svg />
		}	

		var nodes = this.getCachedNodes();
		var links = this.getCachedLinks();

		var sankey = this.getSankey();

		var path = sankey.link();
		
		sankey
			.nodes(nodes)
			.links(links);
		sankey.layout(32);

		// this will lock the y-scale of the sankey
		// it is a bit fragile, as the height of the svg 
		// will not be able to accomodate if refugee counts
		// are larger than when the y-scale was locked
		//
		// this is not a problem as long as we show
		// initially the latest month and refugee counts
		// keep increasing
		//
		if (!sankey.isLockedKY()) {
			//console.log("locking ky");
			//sankey.lockKY();
		}

		return (
			<svg className="refugee-sankey" 
				style={{width: this.getWidth(), height: this.getHeight()}}>
				<g>
					{this.renderNodes(nodes, sankey)}
				</g>
				<g>
					{this.renderLinks(links, path)}
				</g>
			</svg>
		);

	}

});


module.exports = RefugeeSankey;

