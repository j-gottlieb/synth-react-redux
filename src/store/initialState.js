import {generateKey, getContext} from '../utils/audio';

function generateKeys(startPoint = 0, numKeys = 88) {
  let keys = {};
  for(let i = startPoint; i < (startPoint + numKeys); i++) {
    let key = generateKey(i);
    keys[key.id] = key;
  }
  return keys;
}

let context = getContext();
let gainStage = context.createGain();

export default {
  audio: {
    context,
    gainStage,
    effects: [],
    keys: generateKeys()
  },
  input: {
    devices: [],
    selectedDevice: {}
  },
  synth: {
    envelope: {
      attack: 0,
      release: 0
    },
    ignoreVelocity: false,
    sustain: false,
    waveShape: 'sine'
  }
};