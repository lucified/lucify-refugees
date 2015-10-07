
var React = require('react');
var _ = require('underscore');

var constants = require('../../model/refugee-constants.js');

module.exports = function(Component) {

   var RefugeePlayContextDecorator = React.createClass({


       getInitialState: function() {
          return {
              stamp: this.props.startStamp, // unix timestamps (seconds-precision)
              speed: 3,
              play: this.props.autoStart,
          }
        },


        getDefaultProps: function() {
          return {
            autoStart: true
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
            if (this.state.stamp < constants.DATA_END_MOMENT.unix()) {
              if (!this.blockPlay && this.state.play) {
                var increment = (60 * 60 * this.state.speed);
                var newStamp = this.state.stamp + increment;
                this.setState({stamp: newStamp});  
                requestAnimationFrame(this.play);    
              }
            }
        },


        handleStampChange: function(newStamp) {
          this.blockPlay = true;
          this.setState({stamp: parseInt(newStamp)});
          this.scheduleUnblockPlay();
        },


        handleSpeedChange: function(newSpeed) {
          this.setState({speed: newSpeed});
        },


        render: function() {
            return <Component 
               {...this.state} 
               handleSpeedChange={this.handleSpeedChange}
               handleStampChange={this.handleStampChange}
               {...this.props} />
        }

   });

   return RefugeePlayContextDecorator;

}

 
