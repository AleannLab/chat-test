import React from 'react';
import Button from '@material-ui/core/Button';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';

const EditConfirmationModal = ({ onCancel, onOk }) => {
  return (
    <Modal
      size="xs"
      header="Restart Form?"
      body={
        <div className={styles.confirmDialogBody}>
          <div>
            This form has{' '}
            <span className="font-weight-bold">already been submitted,</span>{' '}
            would you like to restart this form and resubmit?
          </div>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={onOk}
          >
            Yes, Restart
          </Button>
        </>
      }
      onClose={onCancel}
    />
  );
};

export default EditConfirmationModal;
