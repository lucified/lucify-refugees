
var React = require('react');
var d3 = require('d3');
var _ = require('underscore');
var deepcopy = require('deepcopy');
var sprintf = require('sprintf');

d3.sankey = require('./d3-sankey.js');

var countries = require("i18n-iso-countries");



var RefugeeSankey = React.createClass({


	getDefaultProps: function() {
		return {
			width: 800,
			height: 800,
		}
	},

	componentDidMount: function() {
		//this.update();
		this.colorScale = d3.scale.category20();
	},


	getNodes: function() {
 		return this.getOrderedNodeIds().map(function(item) {
 			return {name: item}
 		});
	},


	getOrderedNodeIds: function() {
		var items = {};
		this.getData().forEach(function(item) {
			items[item.oc] = true;
			items[item.ac] = true;
		})
 		return _.keys(items);
	},


	getLinks: function() {
		var nodes = this.getOrderedNodeIds();
		return this.getData().map(function(item) {
			return {
				source: nodes.indexOf(item.oc),
				target: nodes.indexOf(item.ac),
				value: item.count
			}
		});
	},

	getData: function() {
		return this.props.asylumData.filter(function(item) {
			return item.year == 2013 
				&& item.month == 9
				&& item.count > 100;
		});
	},


	getWidth: function() {
		return this.props.width;
	},


	getHeight: function() {
		return this.props.height;
	},


	renderLinks: function(links, path) {
		
		return links.map(function(item) {
			return (
				<path 
					className="link" 
					d={path(item)} 
					strokeWidth={Math.max(1, item.dy)} />
			);
		});
	},


	renderNodes: function(nodes, sankey) {

		return nodes.map(function(item) {
			
			var cond = item.x < this.getWidth() / 2;

			var anchor = cond ? "start" : "end";
			var x = cond ? 6 + sankey.nodeWidth() : -6;
			
			var color = this.colorScale(item.name);


			return (
				<g className="node" 
				   transform={sprintf('translate(%.2f, %.2f)', item.x, item.y)} >
					<rect 
						height={item.y} 
						width={sankey.nodeWidth()} 
						fill={color}
						style={{stroke: d3.rgb(color).darker(2)}} />
					<text 
						x={x} 
						y={item.dy / 2} 
						dy="0.35em"
						textAnchor={anchor} >
						{countries.getName(item.name, 'en')}
					</text>
				</g>
			);
		}.bind(this));

	},


	render: function() {

		if (!this.props.asylumData) {
			return <svg />
		}	

		var nodes = this.getNodes();
		var links = this.getLinks();

		window.nodes = nodes;
		window.links = links;

		var sankey = d3.sankey()
			.nodeWidth(15)
			.nodePadding(10)
			.size([this.getWidth(), this.getHeight()]);

		var path = sankey.link();

		sankey
			.nodes(nodes)
			.links(links);

		window.sankey = sankey;

		sankey.layout(32);

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

