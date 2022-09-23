import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';

const ConfirmLeaveFormModal = ({ onOk, onCancel }) => {
  return (
    <Modal
      size="xs"
      header="Leave Form?"
      body={
        <div className={styles.confirmDialogBody}>
          <div>
            Switching forms will{' '}
            <span className="font-weight-bold">lose your progress.</span>
          </div>
          <div>Are you sure you want to leave this form?</div>
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
            Yes, Leave
          </Button>
        </>
      }
      onClose={onCancel}
    />
  );
};

export default ConfirmLeaveFormModal;
