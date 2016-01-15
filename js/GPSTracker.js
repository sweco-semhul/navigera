'use strict';

class GPSTracker {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function() {};

    this.lastKnownCoordinate = null;

    this.point = {
      "type": "Point",
      "coordinates": [-74.50, 40]
    };

    this.source = new mapboxgl.GeoJSONSource({
      data: this.point
    });
  }

  enable() { 
    document.getElementById(this.config.target).innerHTML += '<button id="gps-tracker">Start GPS</button>';
    document.getElementById('gps-tracker').onclick = function() {
      this.startTracking();
      document.getElementById(this.config.target).innerHTML = '';
    }.bind(this)
  }

  disable() {
    document.getElementById(this.config.target).innerHTML = '';
  }

  startTracking(){
    if (navigator.geolocation) {
      console.log('GpsTracker FUNCTION startTracking ::');
      this.lastKnownCoordinate = null;
    	this.addLayer();
      this.watchID = navigator.geolocation.watchPosition(
                      function(position) {
                          this.positionReceived(position);
                      }.bind(this),
                      function(err) {
                          console.warn('GpsTracker watchPosition ERROR(' + err.code + '): ' + err.message);
                      },
                      {
                          enableHighAccuracy: true,
                          timeout: 5000,
                          maximumAge: 0
                      });
    } else {
        // handle this? no, should not display gps icon if not supported
    }
  }


  stopTracking(){
    console.log('GpsTracker FUNCTION stopTracking ::');
    navigator.geolocation.clearWatch(this.watchID);
    delete this.watchID;
  }

  isTracking(){
  	return this.watchID && true;
  }

  addLayer() {
    map.addSource('gps-point', this.source);

    map.addLayer({
        "id": "gps-point",
        "type": "circle",
        "source": "gps-point",
        "paint": {
            "circle-radius": 18,
            "circle-color": "#0066ff",
            "circle-opacity": 0.7
        }
    });
  }

  positionReceived(position){
    var coordinate = [position.coords.longitude, position.coords.latitude];
    this.positionUpdate(coordinate);
    this.updateMarker(coordinate, position.coords.accuracy);
    var toPosition = { center: coordinate };
    if(this.lastKnownCoordinate) {
      toPosition.bearing = turf.bearing(turf.point(this.lastKnownCoordinate), turf.point(coordinate));
    }
    this.config.map.easeTo(toPosition);
    this.lastKnownCoordinate = coordinate;
  }

  updateMarker(coordinate, radius){
    this.point.coordinates = coordinate;
    this.source.setData(this.point);
  }

  clearMarker() {}
  positionUpdate() {}

};
