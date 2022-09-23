import React from 'react';
import Notification from 'components/Notification';
import AppBrandHeader from 'components/AppBrandHeader';
export default function LayoutOuter({ Content }) {
  return (
    <div style={{ height: '100vh', overflowY: 'auto' }}>
      <AppBrandHeader />
      <div className="px-4">
        <Content />
      </div>
      <Notification />
    </div>
  );
}
