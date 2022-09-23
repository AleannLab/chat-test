import React from 'react';
import BrandPreview from './Brand';

export default {
  title: 'BrandPreview',
  component: BrandPreview,
};

export const Main = (args) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          height: '400px',
          width: '600px',
        }}
      >
        <BrandPreview {...args} />
      </div>
    </div>
  );
};

// Default arg values
Main.args = {
  brandColor: '#f4266e',
  coverPictureUrl:
    'https://www.spfdentalcare.com/assets/images/banner-static.jpg',
  profilePictureUrl: 'https://www.spfdentalcare.com/assets/images/logo.png',
};

Main.argTypes = {
  brandColor: { control: { type: 'color' } },
};
