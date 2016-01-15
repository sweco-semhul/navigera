'use strict';

class FileLoader {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function() {};
    this.onload = this.config.onload || function() {};

    if(config.drop) {
      this.enableDrop();
    }
  }

  enableDrop() {
    var dropContainer = document.getElementById(this.config.drop.target);
    dropContainer.ondragover = function () { this.className = 'hover'; return false; };
    dropContainer.ondragend = function () { this.className = ''; return false; };
    dropContainer.ondrop = function (e) {
      dropContainer.className = '';
      e.preventDefault();
      this.statusReporter('File dropped');

      var file = e.dataTransfer.files[0],
          reader = new FileReader();

      reader.onload = this.onload;

      if(file.type === 'text/xml') {
        this.statusReporter('File ' + file.name + ' is XML');
        reader.readAsText(file);
      } else {
        this.statusReporter('File ' + file.name + ' type (' + file.type + ') not supported');
      }

      return false;
    }.bind(this);
  }

};
