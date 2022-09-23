import React from 'react';
import { observer } from 'mobx-react-lite';

import styles from './index.module.css';
import NoMicHelper from 'assets/images/no-mic-helper.svg';
import NoMicrophone from 'assets/images/no-microphone.svg';
import Modal from 'components/Core/Modal';

const MicPermissionPrimary = observer(({ onClose }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      size="sm"
      body={
        <div className={styles.root}>
          <img src={NoMicHelper} alt="Enable microphone helper" />
          <span className={styles.header}>Your Microphone is Blocked</span>
          <div className={styles.infoContainer}>
            <span className={styles.infoTextMain}>
              Kasper needs access to your microphone. To use Kasper,
            </span>
            <ul>
              <li className={styles.infoText}>
                Click the microphone blocked icon{' '}
                <img src={NoMicrophone} alt="No microphone icon" /> in your
                browser’s address bar.
              </li>
              <li className={styles.infoText}>
                Allow access and refresh the page.
              </li>
            </ul>
          </div>
        </div>
      }
      onClose={handleClose}
    />
  );
});

export default MicPermissionPrimary;
