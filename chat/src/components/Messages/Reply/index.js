import React from 'react';
import Replay from '@material-ui/icons/Reply';
import Close from '@material-ui/icons/Close';
import styles from './index.module.css';

const Reply = ({ replayedMessage, handleCancel }) => {
  return (
    <div className={styles.containerReplayForm}>
      <div className={styles.containerReplayFormWrapper}>
        <div className={styles.replayIcon}>
          <Replay />
        </div>
        <div className={styles.columReplay}></div>
        <div className={styles.containerReplayText}>
          <div className={styles.containerReplayTextRed}>
            {replayedMessage.user.displayName}
          </div>
          <div>{replayedMessage.body}</div>
        </div>
      </div>
      <div className={styles.containerReplayActions}>
        <div>Cancel</div>
        <div onClick={handleCancel} className={styles.closeButton}>
          <Close />
        </div>
      </div>
    </div>
  );
};

export { Reply };
