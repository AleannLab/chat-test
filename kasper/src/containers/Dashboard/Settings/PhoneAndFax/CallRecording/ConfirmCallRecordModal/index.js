import React from 'react';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import { Button } from '@material-ui/core';

const ConfirmCallRecordModal = ({
  setConfirmUpdateRecording,
  handleCallRecordUpdate,
}) => {
  const handleUpdate = (shouldUpdate) => {
    handleCallRecordUpdate(shouldUpdate, 'recording');
    setConfirmUpdateRecording(false);
  };
  return (
    <Modal
      size="xs"
      body={
        <div className={styles.container}>
          <span className={styles.subtitle}>
            By enabling call recordings, you acknowledge full responsibility for
            complying with state and federal laws. Kasper is not liable for any
            breaches.
          </span>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={() => setConfirmUpdateRecording(false)}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={() => handleUpdate(true)}
          >
            I agree
          </Button>
        </>
      }
      onClose={() => setConfirmUpdateRecording(false)}
    />
  );
};

export default ConfirmCallRecordModal;
