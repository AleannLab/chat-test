import React from 'react';
import { observer } from 'mobx-react-lite';
import Button from '@material-ui/core/Button';

import styles from './index.module.css';
import NoMicrophone from 'assets/images/no-microphone.svg';
import Modal from 'components/Core/Modal';

const MicPermissionSecondary = observer(
  ({ onClose, customPosition = false }) => {
    const handleClose = () => {
      onClose();
    };

    return (
      <Modal
        size="sm"
        header="Your Microphone is Blocked"
        customPosition={customPosition}
        body={
          <div className={styles.root}>
            <div className={styles.infoContainer}>
              <span className={styles.infoMiniPermission}>
                Kasper requires access to your microphone. Click the microphone
                blocked icon <img src={NoMicrophone} alt="No microphone icon" />{' '}
                in your browser’s address bar.
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
  },
);

export default MicPermissionSecondary;
