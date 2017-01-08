import React, {PropTypes} from 'react';
import {convertNoteFrequency, createGain} from '../../../utils/audio';
import {defaultVelocity} from '../../../actions/audio';
const minTime = 0.001;
const defaultBendSpeed = 0.05;

class Tone extends React.Component {
  constructor(props) {
    super(props);

    this.bendNote = this.bendNote.bind(this);
    this.createOscillator = this.createOscillator.bind(this);
    this.setupAudio = this.setupAudio.bind(this);
    this.setupOscillator = this.setupOscillator.bind(this);

    this.envelope = createGain(props.context, props.tone.velocity);
    this.envelope.connect(props.output);
  }

  componentDidMount() {
    this.setupAudio(this.props);
  }

  componentWillReceiveProps(next) {
    if (next.settings.waveShape !== this.props.settings.waveShape) {
      // Change oscillator wave shape
      this.oscillator.type = next.settings.waveShape;
    }
    if (next.settings.bend !== this.props.settings.bend) {
      // Pitch Bend
      this.bendNote(this.props.tone.id + (next.settings.bend / 16), next.settings);
    }
    if (next.settings.portamento.on && next.tone.id !== this.props.tone.id) {
      // Portamento Note Change
      this.bendNote(next.tone.id, next.settings, 1 / next.settings.portamento.speed);
    }
    if (next.settings.oscillators.length !== this.props.settings.oscillators.length) {
      // Number of oscillators has changed
      this.setupAudio(next);
    } else {
      // Apply other settings
      next.settings.oscillators.forEach((o, i) => {
        if(o != this.props.settings.oscillators[i]) {
          this.setupOscillator(this.oscillators[i], o);
        }
      });
    }
  }

  bendNote(bendTo, settings, speed = defaultBendSpeed) {
    const now = this.props.context.currentTime;
    this.oscillators.forEach((o, i) => {
      // calculate frequency based on octave and bend destination
      const nextFreq = convertNoteFrequency(bendTo + (settings.oscillators[i].octave * 12));
      // To make the bend smooth we ramp the frequency from current to target
      o.osc.frequency.setValueAtTime(o.osc.frequency.value, now);
      // the last parameter is the speed of the bend
      o.osc.frequency.setTargetAtTime(nextFreq, now, speed);
    });
  }

  createOscillator(props, o) {
    let osc = props.context.createOscillator();
    // Connect modulation oscillator to frequency
    props.modulation.connect(osc.frequency);
    osc.start();
    let gain = props.context.createGain();
    osc.connect(gain);
    gain.connect(this.envelope);
    let oscItem = {
      id: o.id,
      osc,
      gain
    };
    this.setupOscillator(oscItem, o);
    return oscItem;
  }

  setupAudio(props) {
    if (this.oscillators) {
      // Oscillators have been created so we have to either add one or remove one
      if (props.settings.oscillators.length < this.oscillators.length) {
        // Remove an oscillator
        this.oscillators.filter(o => {
          if (!props.settings.oscillators.some(p => p.id === o.id)) {
            o.osc.disconnect();
            o.gain.disconnect();
            return false;
          } else {
            return true;
          }
        });
      } else if (props.settings.oscillators.length > this.oscillators.length){
        // Add an oscillator
        this.oscillators.push(this.createOscillator(props, props.settings.oscillators[props.settings.oscillators.length - 1]));
      }
    } else {
      // Oscillators have not been created yet so create them all
      this.oscillators = props.settings.oscillators.map(o => this.createOscillator(props, o));
    }
  }

  setupOscillator(o, setting) {
    o.osc.type = setting.waveShape;
    o.osc.detune.value = setting.detune;
    o.osc.frequency.value = convertNoteFrequency(this.props.tone.id + (12 * parseInt(setting.octave || 0)));
    o.gain.gain.value = setting.gain;
  }

  render() {
    if (this.envelope) {
      const ignoreVel = this.props.settings.ignoreVelocity;
      let velocity = this.props.tone.velocity;
      const sustain = this.props.settings.sustain;
      if (!sustain || velocity > 0) {
        // Get current time
        const now = this.props.context.currentTime;
        // Cancel any scheduled changes
        this.envelope.gain.cancelScheduledValues(now);
        if (velocity == 0) {
          // Note OFF
          const release = this.props.settings.envelope.release;
          // Transition to ramp down
          this.envelope.gain.setValueAtTime(this.envelope.gain.value, now);
          // Ramp down
          this.envelope.gain.setTargetAtTime(0.0, now, release || minTime);
        } else {
          // Note ON
          velocity = ignoreVel ? defaultVelocity : velocity;
          // Find end time for attack envelope
          const envAttackEnd = now + ((this.props.settings.envelope.attack || 0) / 10.0) + minTime;
          // Transition to envelope
          this.envelope.gain.setValueAtTime(this.envelope.gain.value, now);
          // Start envelope
          this.envelope.gain.linearRampToValueAtTime(velocity, envAttackEnd);
        }
      }
    }
    return null;
  }
}

Tone.propTypes = {
  context: PropTypes.object.isRequired,
  modulation: PropTypes.object,
  output: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  tone: PropTypes.object.isRequired
};

export default Tone;
