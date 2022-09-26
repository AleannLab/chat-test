import React from 'react';
import PDFViewer from '.';
import samplePDF from './test.pdf';

export default {
  title: 'PDFViewer',
  component: PDFViewer,
};

export const Main = (args) => {
  return (
    <div style={{ height: '500px', display: 'flex' }}>
      <PDFViewer {...args} />
    </div>
  );
};

// Default arg values
Main.args = {
  file: samplePDF,
};
