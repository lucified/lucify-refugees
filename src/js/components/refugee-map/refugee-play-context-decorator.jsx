
var React = require('react');
var _ = require('underscore');
var moment = require('moment');


var constants = require('../../model/refugee-constants.js');

module.exports = function(Component) {

  var RefugeePlayContextDecorator = React.createClass({


      componentWillMount: function() {
          this.listeners = [];
          this.stamp = this.props.startStamp
       },


       getInitialState: function() {
          return {
              stamp: this.props.startStamp, // unix timestamps (seconds-precision)
              speed: 1,
              play: this.props.autoStart,
          }
        },


        getDefaultProps: function() {
          return {
            autoStart: true,
            startStamp: moment([2012, 0, 1]).unix()
          }
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
            if (this.stamp < constants.DATA_END_MOMENT.unix()) {
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
          this.listeners.forEach(function(listener) {
            listener(stamp);
          });
        },


        handleStampChange: function(newStamp) {
          this.blockPlay = true;
          this.updateStamp(parseInt(newStamp));
          this.scheduleUnblockPlay();
        },


        handleSpeedChange: function(newSpeed) {
          this.setState({speed: newSpeed});
        },


        addStampListener: function(listener) {
          this.listeners.push(listener);
        },


        render: function() {
            return <Component 
               {...this.state} 
               handleSpeedChange={this.handleSpeedChange}
               handleStampChange={this.handleStampChange}
               addStampListener={this.addStampListener}
               {...this.props} />
        }

   });

   return RefugeePlayContextDecorator;

}

 
