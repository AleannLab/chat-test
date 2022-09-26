import React, { useState } from 'react';
import CustomCheckbox from '.';

export default {
  title: 'Checkbox',
  component: CustomCheckbox,
};

export const Main = (args) => {
  return <CustomCheckbox {...args} />;
};

// Default arg values
Main.args = {
  checked: true,
  indeterminate: false,
  defaultDisabled: false,
  enableRipple: true,
};

export const Indeterminate = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChecked = (e) => {
    setIsChecked(e.target.checked);
  };

  return (
    <CustomCheckbox
      checked={isChecked}
      onClickFunc={handleChecked}
      indeterminate={isChecked}
    />
  );
};
