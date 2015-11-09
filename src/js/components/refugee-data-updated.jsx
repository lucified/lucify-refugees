var React = require('react');

var RefugeeDataUpdated = React.createClass({

  shouldComponentUpdate: function() {
    return false;
  },

  render: function() {
    return (
      <div className="refugee-updated-at">
        Data updated<br />
        {this.props.updatedAt.format("MMM D, YYYY")}
      </div>
      );
  }

});


module.exports = RefugeeDataUpdated;
