import React from 'react';
import { observer } from 'mobx-react-lite';
import Button from '@material-ui/core/Button';

import styles from './index.module.css';
import Modal from 'components/Core/Modal';

const MicUnavailable = observer(({ onClose, customPosition = false }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      size="sm"
      header="Can't find your Microphone"
      customPosition={customPosition}
      body={
        <div className={styles.root}>
          <div className={styles.infoContainer}>
            <span className={styles.infoMiniPermission}>
              Check your system settings to make sure that a microphone is
              available. If not, plug one in. You might then need to restart
              your browser.
            </span>
          </div>
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Dismiss
          </Button>
        </div>
      }
      onClose={handleClose}
    />
  );
});

export default MicUnavailable;
