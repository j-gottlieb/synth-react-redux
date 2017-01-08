import { combineReducers } from 'redux';
import initialState from '../store/initialState';
import gain from './gain';

function effects(state = initialState.audio.effects, action) {
  switch(action.type) {
    case 'ADD_CONTROL':
      return state.map(e => {
        if (e.id === action.payload.id) {
          return Object.assign({}, e, {
            [action.payload.property]: Object.assign({}, e[action.payload.property], {
              control: action.payload.control
            })
          });
        }
        return e;
      });
    case 'ADD_EFFECT':
      return [...state, action.payload];
    case 'REMOVE_EFFECT':
      return state.filter(e => e.id !== action.payload);
    case 'REMOVE_CONTROL':
      return state.map(e => {
        if (e.id === action.payload.id) {
          return Object.assign({}, e, {
            [action.payload.property]: Object.assign({}, e[action.payload.property], {
              control: null
            })
          });
        }
        return e;
      });
    case 'REORDER_EFFECTS':
      const start = state.findIndex(e => e.id === action.payload.id);
      const up = action.payload.up;
      const end = up ? start - 1 : start + 1;
      if (end < 0 || end === state.length) {
        return state;
      }
      let newState = [...state];
      newState.splice(end, 0, newState.splice(start, 1)[0]);
      return newState;
    case 'SEND_CONTROL_MESSAGE':
      return state.map(e => {
        if (e.id === action.payload.control.id) {
          const property = e[action.payload.control.property];
          // transform midi range to target value range
          const value = ((action.payload.value / 127) * (property.max - property.min)) + property.min;
          return Object.assign({}, e, {
            [action.payload.control.property]: Object.assign({}, property, {
              value
            })
          });
        }
        return e;
      });
    case 'SET_EFFECT_SETTINGS':
      return state.map(e => {
        if (e.id === action.payload.id) {
          return action.payload;
        }
        return e;
      });
    default:
      return state;
  }
}

function keys(state = initialState.audio.keys, action) {
  switch(action.type){
    case 'KEY_DOWN':
      return Object.assign({}, state, {
        [action.payload.id]: action.payload
      });
    case 'KEY_UP':
    return Object.assign({}, state, {
      [action.payload]: Object.assign({}, state[action.payload], {
        velocity: 0
      })
    });
    default:
      return state;
  }
}

export default combineReducers({
  effects,
  gain,
  keys
});
