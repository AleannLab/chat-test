import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import { useStores } from 'hooks/useStores';
import Button from '@material-ui/core/Button';

const ClearForms = ({ onClose, inviteId, refreshData, searchItem }) => {
  const { patientForm, notification } = useStores();
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    const success = await patientForm.updatePatientInvitation(inviteId, []);
    if (success) {
      onClose();
      notification.showSuccess('Forms were cleared successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 3000);
      refreshData(searchItem);
    }
  };

  return (
    <Modal
      size="xs"
      header="Clear Forms?"
      body={
        <div className="d-flex flex-column justify-content-center">
          <div className={styles.clearFormContent}>
            {`This will`} <b>remove all pending forms</b>{' '}
            {`from the selected patient's
            queue. You can add new forms to the patient's queue at any time.`}
          </div>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
          >
            Yes, Clear
          </Button>
        </>
      }
      onClose={handleClose}
    ></Modal>
  );
};

export default ClearForms;
