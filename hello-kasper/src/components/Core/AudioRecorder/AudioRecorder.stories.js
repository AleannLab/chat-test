import React from 'react';
import AudioRecorder from '.';

export default {
  title: 'Audio Recorder',
  component: AudioRecorder,
};

export const Main = (args) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <AudioRecorder style={{ width: 200 }} />
    </div>
  );
};

// Default arg values
Main.args = {
  outerIsRecording: false,
  setOuterIsRecording: () => {},
  onGenerateAudioURL: () => {},
  type: '',
};
