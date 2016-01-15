'use strict';

class FileLoader {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function() {};
    this.onload = this.config.onload || function() {};

    if(config.drop) {
      this.enableDrop();
    }
    if(config.pick) {
      this.enablePick();
    }
  }

  enableDrop() {
    var dropContainer = document.getElementById(this.config.drop.target);
    dropContainer.ondragover = function () { this.className = 'hover'; return false; };
    dropContainer.ondragend = function () { this.className = ''; return false; };
    dropContainer.ondrop = function (e) {
      e.preventDefault();
      dropContainer.className = '';
      this.statusReporter('File dropped');

      this.readFile(e.dataTransfer.files[0])

      return false;
    }.bind(this);
  }

  enablePick() {
    var pickContainer = document.getElementById(this.config.pick.target);
    pickContainer.innerHTML += '<input type="file" id="file-input" />';
    document.getElementById('file-input').addEventListener('change', function(e) {
      var element = document.getElementById("file-input");
      element.parentNode.removeChild(element);
      this.statusReporter('File picked');

      this.readFile(e.target.files[0])
      return false;
    }.bind(this), false);

  }

  readFile(file) {
    var reader = new FileReader();
    reader.onload = this.onload;
    if(this.isXML(file)) {
      reader.readAsText(file);
    }
  }

  isXML(file) {
    if(file.type === 'text/xml') {
      this.statusReporter('File ' + file.name + ' is XML');
      return true;
    } else {
      this.statusReporter('File ' + file.name + ' type (' + file.type + ') not supported');
      return false;
    }
  }

};
