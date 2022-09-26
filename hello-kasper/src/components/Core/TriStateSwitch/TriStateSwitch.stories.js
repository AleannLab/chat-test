import TriStateSwitch from '.';

export default {
  title: 'TriStateSwitch',
  component: TriStateSwitch,
};

export const Main = (args) => {
  return <TriStateSwitch {...args} />;
};

// Default arg values
Main.args = {
  value: 'ON',
  disabled: false,
  onChange: (d) => console.log(d),
};

Main.argTypes = {
  value: {
    options: ['ON', 'OFF', 'NA'],
    control: { type: 'select' },
  },
};
