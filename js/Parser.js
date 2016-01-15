'use strict';

class Parser {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function() {};
    this.onload = this.config.onload || function() {};
  }

  parse(xmlStr) {
    this.statusReporter('Trying to pare route');
    var route = this.toXMLDoc(xmlStr).getElementsByTagName("route")[0];
    var routeItems = [];
    [].forEach.call(
      route
          .getElementsByTagName("routeItem"), function(item) {
            var stopPoint = item.getElementsByTagName("stopPoint")[0];
            var routeItem = {
              order: this.getFloat(item,'order'),
              stopPoint: {
                easting: this.getFloat(stopPoint,'easting'),
                northing: this.getFloat(stopPoint,'northing'),
                type: this.getText(stopPoint,'type')
              },
              stopPointItems: [].map.call(item.getElementsByTagName("stopPointItem"), function(stopPointItem) {
                return {
                  name: this.getText(stopPointItem, 'name'),
                  easting: this.getFloat(stopPointItem, 'easting'),
                  northing: this.getFloat(stopPointItem, 'northing'),
                  type: this.getText(stopPointItem, 'type')
                };
              }.bind(this))
            };
            routeItems.push(routeItem);
          }.bind(this));

    routeItems = this.sortBy(routeItems,'order');
    this.statusReporter('Successfully parsed ' + routeItems.length + ' route items')
    return new Promise(function (fulfill, reject){
      fulfill({
        name: this.getText(route,'name'),
        type: this.getText(route,'type'),
        routeItems: routeItems,
        coordinates: routeItems.map(function(item) { return [item.stopPoint.easting, item.stopPoint.northing, item.order]})
      });
    }.bind(this));

  }

  toXMLDoc(xmlStr) {
    var xmlDoc;
    if (window.DOMParser) {
      var parser=new DOMParser();
      xmlDoc = parser.parseFromString(xmlStr,"text/xml");
    }
    else {
      // Internet Explorer
      xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async=false;
      xmlDoc.loadXML(xmlStr);
    }
    return xmlDoc;
  }

  getFloat(item, name) {
    return parseFloat(this.getText(item, name));
  }

  getText(item, name) {
    var elements = item.getElementsByTagName(name);
    return elements.length > 0 ? elements[0].textContent : '';
  }

  // Simple sort of object by property
  sortBy(obj, sortParam) {
    function compare(a,b) {
      if (a[sortParam] < b[sortParam])
        return -1;
      else if (a[sortParam] > b[sortParam])
        return 1;
      else
        return 0;
    }
    return obj.sort(compare);
  }
};
