import React from 'react';

import Avatar from '.';

export default {
  title: 'Avatar',
  component: Avatar,
};

export const Main = (args) => {
  return <Avatar {...args} />;
};

// Default arg values
Main.args = {
  id: 1,
  src: 'https://material-ui.com/static/images/avatar/1.jpg',
  firstName: 'John',
  lastName: 'Smith',
  mobileNo: '',
  width: 40,
  height: 40,
  className: '',
  letterFontSize: '0.85rem',
  customLetter: '',
};

export const NoImage = () => {
  return <Avatar id={1} firstName="John" lastName="Smith" />;
};

export const LetterAvatarWithCustomFontSize = () => {
  return (
    <Avatar id={1} firstName="John" lastName="Smith" letterFontSize="1.5rem" />
  );
};

export const LetterAvatarWithCustomFontSizeAndAvatarSize = () => {
  return (
    <Avatar
      id={1}
      firstName="John"
      lastName="Smith"
      letterFontSize="1.5rem"
      width="3rem"
      height="3rem"
    />
  );
};

export const NoImageCustomInitials = () => {
  return <Avatar id={1} customLetter="#" />;
};

export const NoImageDefaultInitials = () => {
  return <Avatar id={1} />;
};

export const CustomWidthHeightInPxWithImage = () => {
  return (
    <Avatar
      id={1}
      src="https://material-ui.com/static/images/avatar/1.jpg"
      firstName="John"
      lastName="Smith"
      width={70}
      height={70}
    />
  );
};

export const CustomWidthHeightInRemWithImage = () => {
  return (
    <Avatar
      id={1}
      src="https://material-ui.com/static/images/avatar/1.jpg"
      firstName="John"
      lastName="Smith"
      width="7rem"
      height="7rem"
    />
  );
};
