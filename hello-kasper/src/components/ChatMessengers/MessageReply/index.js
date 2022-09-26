import React from 'react';
import styles from './index.module.css';

const MessageReply = ({ message }) => {
  const {
    body,
    user: { displayName },
  } = message.properties;
  return (
    <div className={styles.replayContainer}>
      <div className={styles.replayColum}></div>
      <div className={styles.replayWrapper}>
        <div className={styles.replayFromName}>{displayName}</div>
        <div className={styles.replayFromMessage}>{body}</div>
      </div>
    </div>
  );
};

export { MessageReply };
