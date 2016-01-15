'use strict';

class Speaker {

  constructor(config) {
    this.config = config;
    this.statusReporter = this.config.statusReporter || function(){};
    var voices = window.speechSynthesis.getVoices();
    this.voice = voices[config.voiceNr];

    this.msg = new SpeechSynthesisUtterance();
    this.msg.voice = voices[config.voiceNr]; // Note: some voices don't support altering params
    this.msg.voiceURI = 'native';
    this.msg.volume = 1; // 0 to 1
    this.msg.lang = config.lang;
  }

  say(text) {
    this.msg.text = text;
    speechSynthesis.speak(this.msg);
  }

};
