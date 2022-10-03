import React, { useState } from 'react';
import Switch from '.';

export default {
  title: 'Switch',
  component: Switch,
};

export const Main = (args) => {
  return <Switch {...args} />;
};

// Default arg values
Main.args = {
  checked: true,
  disabled: false,
};

export const DefaultChecked = () => {
  const [isChecked, setIsChecked] = useState(true);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return (
    <Switch name="DefaultChecked" checked={isChecked} onChange={handleChange} />
  );
};

export const Disabled = () => {
  return <Switch name="Disabled" checked={false} disabled />;
};
