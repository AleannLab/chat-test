import React from 'react';
import Tooltip from 'components/Core/Tooltip';
import styles from './index.module.css';

export default function LobbyIcon({ title, icon }) {
  return (
    <Tooltip title={title} color="#000000" maxWidth={250} placement="top-start">
      <span style={{ cursor: 'pointer' }}>{icon}</span>
    </Tooltip>
  );
}
