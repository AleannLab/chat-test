import React from 'react';
import clsx from 'clsx';
import styles from './index.module.css';

const OnlineParticipant = ({ online, isText = true }) => {
  return (
    <span
      className={clsx(
        styles.otherIsOnline,
        online ? styles.otherOnline : styles.otherOffline,
      )}
    >
      {isText && online ? 'Online' : 'Offline'}
    </span>
  );
};

export { OnlineParticipant };
