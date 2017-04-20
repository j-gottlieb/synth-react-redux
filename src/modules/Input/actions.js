import * as input from '../../utils/input';
import {actions as audioActions} from '../Audio';
const name = 'input';
export const C = {
  GET_INPUT_DEVICES: `${name}/GET_INPUT_DEVICES`,
  ON_SOCKET_INPUT: `${name}/ON_SOCKET_INPUT`,
  SET_INPUT_DEVICE: `${name}/SET_INPUT_DEVICE`
};

export const getInputDevices = () => (dispatch) => {
  input.getDevices()
  .then(devices => {
    dispatch(gotInputDevices(devices));
    // Set default device
    if (devices.length > 0) {
      // Try to default to first midi device
      const midi = devices.find(d => d.device === input.inputTypes.midi);
      if (midi) {
        dispatch(setDevice(midi));
      } else {
        // No midi so just set first device (propably computer keyboard)
        dispatch(setDevice(devices[0]));
      }
    }
  });
};

const gotInputDevices = (devices) => {
  return {
    type: C.GET_INPUT_DEVICES,
    payload: devices
  };
};

export const setDevice = (device) => (dispatch, getState) => {
  const state = getState();
  // Deactivate current device
  input.deactivateDevice(state.input.selectedDevice);
  // Start listening for inputs from new device
  input.setDevice(device, dispatch);
  dispatch(setInputDevice(device || {}));
};

const setInputDevice = (device) => {
  return {
    type: C.SET_INPUT_DEVICE,
    payload: device
  };
};

export const socketMessage = (message) => (dispatch, getState) => {
  const state = getState();
  const note = input.getRandomScaleNote(state.input.socket, message);
  console.log(note);
  dispatch(audioActions.keyDown(note.note, note.velocity));
  dispatch(socketMessageAfter(note));
  setTimeout(() => {
    dispatch(audioActions.keyUp(note.note));
  }, note.length);
};

const socketMessageAfter = (note) => {
  return {
    type: C.ON_SOCKET_INPUT,
    payload: note
  };
};
