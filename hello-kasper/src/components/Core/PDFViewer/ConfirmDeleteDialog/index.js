import React from 'react';
import { Button } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useQueryClient, useMutation } from 'react-query';

const ConfirmDeleteDialog = ({ onClose }) => {
  const { activityLogs, fax, notification } = useStores();
  const selectedActivity = activityLogs.selectedActivity;
  const queryClient = useQueryClient();

  const { mutate: handleDeleteFax, isLoading: isDeleting } = useMutation(
    () => fax.deleteFax(selectedActivity.id),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries('fax-logs');
        notification.showSuccess('Fax was deleted successfully');
        activityLogs.setSelectedActivity({});
      },
      onError: (err) => {
        notification.showError(err?.DetailedMessage || err);
      },
      onSettled: () => {
        onClose();
      },
    },
  );

  return (
    <Modal
      allowClosing={!isDeleting}
      size="xs"
      header="Delete confirmation"
      body={
        <div calssName={styles.confirmationRoot}>
          <p className={styles.confirmationSubtitle}>
            Are you sure you want to permanently delete this fax?
          </p>
          <div className="d-flex justify-content-between mt-5">
            <Button
              disabled={isDeleting}
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={handleDeleteFax}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
    />
  );
};

export default ConfirmDeleteDialog;
