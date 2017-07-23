export const getMeasureCnt = state => state.sequencer.measureCnt;

export const getNotes = state => state.sequencer.notes;

export const getSettings = state => ({
  measureCnt: state.measureCnt,
  tempo: state.tempo,
  timeSig: state.timeSig
});

export const getTempo = state => state.sequencer.tempo;

export const getTimeSig = state => state.sequencer.timeSig;
