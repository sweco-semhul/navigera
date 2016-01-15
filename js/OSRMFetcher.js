'use strict';

class OSRMFetcher {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function() {};

  }
  // Get driving route from OSRM service
  fetch(x,y,z, success) {
    return new Promise(function (fulfill, reject) {
      this.statusReporter('Fetching new driving route');
      this.getRequest({
        url: this.config.serviceURL + '?' +
          'loc='+x.northing+','+x.easting +
          '&loc='+y.northing+','+y.easting +
          '&instructions=true' +
          '&alt=true' +
          '&z=' + z || 13

      }).then(function(data) {
        if(data.status === 200) {
          this.statusReporter('<b>KÖRRUTT:</b><br>START: ' + data.route_summary.start_point + '<br>END:' + data.route_summary.end_point + '<br>TOTAL DIST. ' + data.route_summary.total_distance + 'm<br>TOTAL TIME: ' + parseInt(data.route_summary.total_distance/60,10) + 'min');
          var route = {
            instructions: this._convertInstructions(data.route_instructions),
            coordinates: this.polylineDecode(data.route_geometry,6).map(function(latLng) { return [latLng[1], latLng[0]]})
          };
          console.log(route);
          fulfill(route);
        } else {
          this.statusReporter('Failed to load new driving route');
          console.error(data);
          reject(data);
        }
      }.bind(this));
    }.bind(this));
  }

  getRequest(options) {
    return new Promise(function (fulfill, reject) {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
         if(xmlhttp.status == 200){
           var contentType = xmlhttp.getResponseHeader('Content-Type');
           var response = xmlhttp.responseText;
           if(contentType && contentType.indexOf('application/json') !== -1) {
             response = JSON.parse(xmlhttp.responseText);
           }
           fulfill(response);
         } else {
           reject(xmlhttp)
         }
        }
      };

      xmlhttp.open("GET", (options.proxy ? options.proxy+'/' : '') + options.url, true);
      xmlhttp.send();
    });
  }

  // polyline.js decode
  // https://github.com/mapbox/polyline/blob/master/src/polyline.js#L40
  polylineDecode(str, precision) {
      var index = 0,
          lat = 0,
          lng = 0,
          coordinates = [],
          shift = 0,
          result = 0,
          byte = null,
          latitude_change,
          longitude_change,
          factor = Math.pow(10, precision || 5);

      // Coordinates have variable length when encoded, so just keep
      // track of whether we've hit the end of the string. In each
      // loop iteration, a single coordinate is decoded.
      while (index < str.length) {

          // Reset shift, result, and byte
          byte = null;
          shift = 0;
          result = 0;

          do {
              byte = str.charCodeAt(index++) - 63;
              result |= (byte & 0x1f) << shift;
              shift += 5;
          } while (byte >= 0x20);

          latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

          shift = result = 0;

          do {
              byte = str.charCodeAt(index++) - 63;
              result |= (byte & 0x1f) << shift;
              shift += 5;
          } while (byte >= 0x20);

          longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

          lat += latitude_change;
          lng += longitude_change;

          coordinates.push([lat / factor, lng / factor]);
      }

      return coordinates;
  }


  // Convert OSRM instructions to more readable form
  _convertInstructions(t) {
    var e, i, n, o, s = [];
    for (e = 0; e < t.length; e++)
      i = t[e],
      n = this._drivingDirectionType(i[0]),
      o = i[0].split("-"),
      n && s.push({
        type: n,
        distance: i[2],
        time: i[4],
        road: i[1],
        direction: i[6],
        exit: o.length > 1 ? o[1] : void 0,
        index: i[3]
      });
    return s
  }

  // Parse OSRM driving direction types
  _drivingDirectionType(t) {
      switch (parseInt(t, 10)) {
      case 1:
        return "Rakt fram";
      case 2:
        return "Svagt höger";
      case 3:
        return "Höger";
      case 4:
        return "Skarp höger";
      case 5:
        return "Vänd";
      case 6:
        return "Skarp vänster";
      case 7:
        return "Vänster";
      case 8:
        return "Svagt vänster";
      case 9:
        return "Delmål nått";
      case 10:
        return "Rakt fram";
      case 11:
      case 12:
        return "Rondell";
      case 15:
        return "Målet nått";
      default:
        return null
      }
  }

};
