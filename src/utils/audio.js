window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;
let context = new AudioContext();

const service = {
  createOscillator,
  settings
};

let settings = {
  wave: 'square'
};

function createOscillator(freq) {
  let oscillator = context.createOscillator();
  oscillator.type = settings.wave;
  oscillator.frequency.value = freq;
  let gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.value = 0;
  oscillator.connect(gain);
  oscillator.start();
  return {oscillator, gain};
}

export default service;
