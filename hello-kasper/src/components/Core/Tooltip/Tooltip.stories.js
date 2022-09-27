import React from 'react';
import CustomTooltip from '.';

export default {
  title: 'Tooltip',
  component: CustomTooltip,
};

export const Main = (args) => {
  return (
    <div
      className="w-100 p-5 d-flex justify-content-center align-items-center"
      style={{ height: 400 }}
    >
      <CustomTooltip {...args}>
        <span>Hover over me!</span>
      </CustomTooltip>
    </div>
  );
};

// Default arg values
Main.args = {
  title: 'Tooltip title',
  placement: 'top',
  arrow: true,
  centerAlign: true,
  maxWidth: 150,
  minHeight: 35,
  color: '#566F9F',
};

export const LongTitle = () => {
  return (
    <CustomTooltip
      title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      arrow={true}
      centerAlign={false}
    >
      <span>Hover over me!</span>
    </CustomTooltip>
  );
};
