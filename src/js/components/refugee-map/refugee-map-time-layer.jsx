
var React = require('react');

var RefugeeMapLineChart = require('./refugee-map-line-chart.jsx');

var RefugeeMapTimeLayer = React.createClass({

  displayName: 'RefugeeMapTimeLayer',

  propTypes: {
    refugeeCountsModel: React.PropTypes.object
  },

  getInitialState: function() {
    return {} ;
  },


  updateForStamp: function(stamp) {
    this.setState({stamp: stamp});
  },


  render: function() {
    if (!this.props.refugeeCountsModel) {
      return <div />;
    }

    return (
      <div className='refugee-map-time-layer'>
        <RefugeeMapLineChart {...this.props} stamp={this.state.stamp} />
      </div>
    );
  }

});

module.exports = RefugeeMapTimeLayer;
