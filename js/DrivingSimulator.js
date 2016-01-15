'use strict';
// A simple driving simulator animating through the points on the route

class DrivingSimulator {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function() {};
  }

  enable() { 
    document.getElementById(this.config.target).innerHTML += '<button id="simulate">Simulate</button>';
    document.getElementById('simulate').onclick = function() {
      this.onStartSimulation();
      document.getElementById(this.config.target).innerHTML = '';
    }.bind(this)
  }

  disable() {
    document.getElementById(this.config.target).innerHTML = '';
  }

  simulate(route) {
    return new Promise(function (fulfill, reject){
      var index = 0;
      var drive = function() {
        index++;
        if(index < route.coordinates.length-1) {
          this.atWaypoint(route, index);
          this.config.map.easeTo({
            center: route.coordinates[index],
            bearing:  turf.bearing(turf.point(route.coordinates[index]), turf.point(route.coordinates[index+1]))
          });
        } else {
          this.config.map.off('moveend', drive)
          fulfill();
        }
      }.bind(this);
      map.on('moveend', drive);
      drive(route, index);
    }.bind(this));
  }
  onStartSimulation() {}
  atWaypoint() {}
};
