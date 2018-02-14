
var React = require('react');

var SoccerFields = require('lucify-commons/src/js/components/soccer-fields.jsx');


var RefugeeSoccerSegment = React.createClass({

  displayName: 'RefugeeSoccerSegment',


  // Note:
  //
  // When updating counts, also make sure
  // to check that texts are still valid.
  //
  // This unfortunately cannot be done automatically
  // as we wish to use friendly wordings for numbers.
  // (unless there is an elaborate library for that)

  getEuropeanCount: function() {
    // http://data.unhcr.org/syrianrefugees/regional.php, Total Syrian Asylum Applications in Europe
    return 1015500; // Apr 2011 - Dec 2017. Checked on 24.1.2018
  },


  getRegionalCount: function() {
    // http://data.unhcr.org/syrianrefugees/regional.php, Registered Syrian Refugees
    return 5563521; // Updated 8.2.2018
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
            The United Nations counts that around a million Syrian refugees
            have sought asylum in Europe between April 2011 and December 2017.
            Standing very tighly together, they would fit
            on {this.getEuropeanSoccerFieldsCount()} soccer fields.
          </p>

          <SoccerFields count={this.getEuropeanSoccerFieldsCount()} />

          <p>
            Only a fraction of refugees fleeing their homes make it to
            Europe. The UN has registered over five million Syrian
            refugees in Turkey, Lebanon, Jordan, Iraq, Egypt and
            North Africa. Most of them live in refugee camps
            close to the border. They would fit
            on {this.getRegionalSoccerFieldsCount()} soccer fields.
          </p>

          <SoccerFields count={this.getRegionalSoccerFieldsCount()} />

        </div>


      </div>
    );
  }

});


module.exports = RefugeeSoccerSegment;
