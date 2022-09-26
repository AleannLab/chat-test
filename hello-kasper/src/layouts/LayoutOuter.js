import React from 'react';
export default function LayoutOuter({ Content }) {
  return (
    <div style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="px-4">
        <Content />
      </div>
    </div>
  );
}
