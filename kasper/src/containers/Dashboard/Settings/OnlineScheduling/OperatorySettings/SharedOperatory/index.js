import React from 'react';
import Button from '@material-ui/core/Button';

import Modal from 'components/Core/Modal';
import styles from './index.module.css';

const SharedOperatory = ({ onClose, handleSharedOperatory }) => {
  return (
    <Modal
      size="xs"
      header=""
      body={
        <div calssName={styles.root}>
          <p className={styles.subtitle}>
            <b>Shared Operatory?</b> Another provider is configured with this
            operatory. Appointment scheduling and availability will be shared.{' '}
          </p>
          <div className="d-flex justify-content-between mt-5">
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={() => {
                onClose();
                handleSharedOperatory(false);
              }}
            >
              Cancel
            </Button>

            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={() => {
                onClose();
                handleSharedOperatory(true);
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
    />
  );
};

export default SharedOperatory;
