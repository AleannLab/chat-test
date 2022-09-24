import React from 'react';
import clsx from 'clsx';
import styles from './index.module.css';

const OnlineParticipant = ({ online, isText = true, className }) => {
  return (
    <span
      className={clsx(
        styles.otherIsOnline,
        online ? styles.otherOnline : styles.otherOffline,
        className,
      )}
    >
      {isText && (online ? 'Online' : 'Offline')}
    </span>
  );
};

export { OnlineParticipant };
