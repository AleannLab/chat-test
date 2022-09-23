import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';

const RemovePatientModal = ({ onRemove, onCancel }) => {
  return (
    <Modal
      size="xs"
      body={
        <div className={styles.confirmDialogBody}>
          <div>
            This patient will be removed from the
            <span className="font-weight-bold"> Patient Board</span> and will
            need to be added again manually.
          </div>
        </div>
      }
      footer={
        <>
          <Button
            className="secondary-btn me-auto"
            variant="contained"
            color="secondary"
            onClick={onRemove}
          >
            Remove
          </Button>
          <Button
            className="primary-btn"
            variant="outlined"
            color="primary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </>
      }
      onClose={onCancel}
    />
  );
};

export default RemovePatientModal;
