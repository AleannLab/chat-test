import React from 'react';
import LanguageMenu from '.';

export default {
  title: 'Language Menu',
  component: LanguageMenu,
};

export const Main = () => {
  const handleChange = (value) => {
    console.log(value);
  };

  return <LanguageMenu onChange={handleChange} />;
};
