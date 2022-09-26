import React from 'react';
import FileUpload from '.';

export default {
  title: 'File Upload',
  component: FileUpload,
};

export const Main = () => {
  return <FileUpload />;
};

export const MaxFilesUploadLimit = () => {
  return <FileUpload maxLimit={5} />;
};

export const Disabled = () => {
  return <FileUpload maxLimit={0} />;
};
