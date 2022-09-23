import { Box, Button } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import React, { useMemo, useState } from 'react';
import Table from 'components/Core/Table';
import { ReactComponent as PreviewIcon } from 'assets/images/eye.svg';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import FormPreview from 'components/PatientFormQueues/HashFormQueue/FormPreview';

const AddForm = ({ onClose, invitationId, forms }) => {
  const [previewForm, setPreviewForm] = useState(null);
  const [selectedForms, setSelectedForms] = useState([]);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const { paperlessForm, patientForm, notification } = useStores();
  const queryClient = useQueryClient();

  const formsMetaQuery = useQuery(
    ['paperlessFormsMeta'],
    () => paperlessForm.getFormsMeta(),
    {
      initialData: [],
      select: (forms) => {
        forms = forms.filter((form) => !form.archived);
        return forms.map((form) => {
          const action = (
            <PreviewIcon
              width="14px"
              height="20px"
              className="menu-icon"
              fill="#9A9A9A"
              cursor="pointer"
              onClick={() => setPreviewForm(form.formKey)}
            />
          );
          return {
            id: form.formKey,
            name: form.name,
            action,
          };
        });
      },
    },
  );

  const { mutate: addFormToQueue } = useMutation(
    (forms) => patientForm.updatePatientInvitation(invitationId, forms),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patientForms');
        notification.showSuccess('Form added successfully');
        setShowPendingPopup(false);
        onClose();
      },
      onError: (errorMessage) => {
        notification.showError(errorMessage);
        setShowPendingPopup(false);
        onClose();
      },
    },
  );

  const tableColumns = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        width: '80%',
      },
      { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
    ],
    [],
  );
  return (
    <>
      <Modal
        header="Add Form"
        size="sm"
        body={
          <Box display="flex" flexDirection="column">
            <Table
              columns={tableColumns}
              rows={formsMetaQuery.data}
              isSelectable
              selected={selectedForms}
              onRowSelect={(ids) => setSelectedForms(ids)}
              sortBy={tableColumns[0].name}
              height={400}
              enableSearchBar
              isEmpty={formsMetaQuery.isFetched && !formsMetaQuery.data.length}
            />
          </Box>
        }
        footer={
          <>
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              disabled={!invitationId || selectedForms.length === 0}
              onClick={() => {
                if (forms.length > 0) {
                  setShowPendingPopup(true);
                } else {
                  const existingForms = forms.map((form) => form.key);
                  addFormToQueue([...existingForms, ...selectedForms]);
                }
              }}
            >
              Add to Queue
            </Button>
          </>
        }
        onClose={onClose}
      ></Modal>
      {previewForm && (
        <FormPreview
          onCloseFormPreview={() => setPreviewForm(null)}
          formkey={previewForm}
        ></FormPreview>
      )}
      {showPendingPopup && (
        <Modal
          header=""
          size="xs"
          onClose={() => {
            setShowPendingPopup(false);
          }}
          body={
            <div className="d-flex flex-column justify-content-center">
              <div className={styles.showPendingPopupStyle}>
                {`This patient has `} <b>{forms.length}</b>{' '}
                {` pending form${forms.length > 1 ? 's' : ''} in their queue. `}
                {`Do you want to remove them first, or add the `}
                {'selected forms to the existing queue?'}
              </div>
            </div>
          }
          footer={
            <>
              <Button
                className="primary-btn me-auto"
                variant="outlined"
                color="primary"
                onClick={() => {
                  const existingForms = forms.map((form) => form.key);
                  addFormToQueue([...existingForms, ...selectedForms]);
                }}
              >
                Keep Pending
              </Button>

              <Button
                className="secondary-btn"
                variant="contained"
                color="secondary"
                disabled={!invitationId || selectedForms.length === 0}
                onClick={() => {
                  addFormToQueue([...selectedForms]);
                }}
              >
                Clear Pending
              </Button>
            </>
          }
        ></Modal>
      )}
    </>
  );
};

export default AddForm;
