import React from 'react';
import MessageBox from '.';

export default {
  title: 'Message Box',
  component: MessageBox,
};

export const Main = (args) => {
  return <MessageBox {...args} />;
};

// Default arg values
Main.args = {
  messageText: 'This is a sample message text',
  showIcon: true,
};
