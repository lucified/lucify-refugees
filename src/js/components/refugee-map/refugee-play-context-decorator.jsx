
var React = require('react');
var _ = require('underscore');
var moment = require('moment');

var lucifyUtils = require('lucify-commons/src/js/lucify-utils.jsx');


var RefugeeConstants = require('../../model/refugee-constants.js');

module.exports = function(Component) {

  var RefugeePlayContextDecorator = React.createClass({


      componentWillMount: function() {
          this.stamp = this.props.startStamp;
       },


       getInitialState: function() {
          return {
              stamp: this.props.startStamp, // unix timestamps (seconds-precision)
              speed: this.getDefaultSpeed(),
              play: this.props.autoStart,
          };
        },


        getDefaultSpeed: function() {
          if (lucifyUtils.isSlowDevice()) {
              return 6;
          }
          return 2;
        },


        getDefaultProps: function() {
          return {
            autoStart: true,
            startStamp: moment([RefugeeConstants.DATA_START_YEAR, RefugeeConstants.DATA_START_MONTH, 1]).unix()
          };
        },
         

        componentDidMount: function() {
          this.blockPlay = false;

          this.scheduleUnblockPlay = _.debounce(function() {
              //console.log("unblocking play");
              this.unblockPlay();
          }, 500);

          if (this.props.autoStart) {
            this.play();
          }
        },


        unblockPlay: function() {
          this.blockPlay = false;
          this.play();
        },


        play: function() {
            if (this.stamp <= RefugeeConstants.DATA_END_MOMENT.unix()) {
              if (!this.blockPlay && this.state.play) {
                var increment = (60 * 60 * this.state.speed);
                var newStamp = this.stamp + increment;
                this.updateStamp(newStamp);
                requestAnimationFrame(this.play);    
              }
            }
        },


        updateStamp: function(stamp) {
          this.stamp = stamp;

          // updating of stamp is not done with a
          // regular React state object, as this will
          // trigger the relatively costly render
          // operation for the whole subtree
          //
          // for the purposes of the animation it is 
          // a bit costly even when shouldComponentUpdate
          // is implemented
          //
          // thus the stamp is updated by calling a special 
          // updateForStamp() method for all relevant
          // subcomponents
          //
          this.refs.comp.updateForStamp(stamp);
        },


        handleStampChange: function(newStamp) {
          this.blockPlay = true;
          this.updateStamp(parseInt(newStamp));
          this.scheduleUnblockPlay();
        },


        handleSpeedChange: function(newSpeed) {
          this.setState({speed: newSpeed});
        },


        render: function() {
            return <Component 
               ref='comp'
               {...this.state} 
               handleSpeedChange={this.handleSpeedChange}
               handleStampChange={this.handleStampChange}
               addStampListener={this.addStampListener}
               {...this.props} />
        }

   });

   return RefugeePlayContextDecorator;

}

 
