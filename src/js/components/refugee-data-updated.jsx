var React = require('react');

var RefugeeDataUpdated = React.createClass({

  displayName: 'RefugeeDataUpdated',

  propTypes: {
    updatedAt: React.PropTypes.object
  },

  shouldComponentUpdate: function() {
    return false;
  },

  render: function() {
    return (
      <div className="refugee-updated-at">
        Data updated<br />
        {this.props.updatedAt.format('MMM D, YYYY')}
      </div>
    );
  }

});


module.exports = RefugeeDataUpdated;
