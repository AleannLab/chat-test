import Modal from 'components/Core/Modal';
import { automationDataWrapper, PATIENT_TYPE } from 'components/Automation';
import { useState } from 'react';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import { useQueryClient } from 'react-query';
import { Button } from '@material-ui/core';

const AutomationArchiveWarning = ({ onClose, formKey }) => {
  const {
    paperlessAutomation,
    authentication: { user },
    notification,
    paperlessForm,
  } = useStores();
  const [isWorking, setIsWorking] = useState(false);
  const queryClient = useQueryClient();
  const { automationFormData } = paperlessAutomation;

  let patientData = automationFormData.find(
    (filterItem) => filterItem.patient_type === formKey.formValue,
  );

  const handleArchiveForm = async () => {
    try {
      setIsWorking(true);
      let forms = [];
      JSON.parse(patientData.forms).forEach((element) => {
        if (element !== formKey.formKey) {
          forms.push(element);
        }
      });
      const updateAutomationPayload = {
        patientType: formKey.formValue,
        forms: forms,
        id: patientData.id,
        formExpirationPeriod:
          formKey.formValue === PATIENT_TYPE.firstType
            ? undefined
            : patientData.form_expiration_period,
        formExpirationPeriodUnit:
          formKey.formValue === PATIENT_TYPE.firstType ? undefined : 'MONTH',
      };
      await paperlessAutomation.addAndUpdateFormAutomation(
        updateAutomationPayload,
      );
      await queryClient.invalidateQueries('automationFetchData');
      setIsWorking(false);
      await paperlessForm.changeSectionArchiveStatus(
        'archive',
        formKey.formKey,
      );
      paperlessForm.setIsSectionArchived(formKey.formKey);
      await queryClient.invalidateQueries('automationFetchData');
      notification.showSuccess('Form archived successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
      onClose();
    } catch (e) {
      console.error(e);
      notification.showInfo(e.message);
      setTimeout(() => {
        notification.hideNotification();
      }, 5000);
      setIsWorking(false);
      onClose();
    }
  };

  const handleClose = async () => {
    onClose();
  };

  let automationPermission = null;
  try {
    automationPermission = queryClient
      .getQueryData(['userPermissions', user.id])
      .find((perm) => perm.permission_id === 13).enabled;
  } catch (e) {
    console.error(e);
    notification.showError(
      'An unexpected error occurred while attempting to retrieve your account permissions',
    );
    handleClose();
  }

  return (
    <>
      <Modal
        header=""
        size="xs"
        body={
          <div className="d-flex flex-column justify-content-center">
            <div className={styles.showAutomationFormWarningStyle}>
              {`The `} <b>{formKey.formName}</b>
              {' form'} {`is currently being used by the `}{' '}
              <b>
                {
                  automationDataWrapper.find(
                    (item) => item.type == formKey.formValue,
                  ).formMiniTitle
                }
              </b>{' '}
              {`automation.`}
              <div className="mt-3" />
              {automationPermission
                ? 'Do you still want to archive this form? Archiving it will cause the form to be removed from automation.'
                : 'You do not have permission to modify the Automation settings, therefore you cannot archive this form.'}
            </div>
          </div>
        }
        enableMargin={true}
        onClose={handleClose}
        footer={
          <>
            <Button
              className={`primary-btn ${automationPermission ? 'me-auto' : ''}`}
              variant="outlined"
              color="primary"
              onClick={() => {
                handleClose();
              }}
              disabled={isWorking}
            >
              {automationPermission ? 'Cancel' : 'Close'}
            </Button>

            {automationPermission ? (
              <>
                <Button
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    handleArchiveForm();
                  }}
                  disabled={isWorking}
                >
                  {isWorking ? 'Archiving...' : 'Archive Form'}
                </Button>
              </>
            ) : null}
          </>
        }
      ></Modal>
    </>
  );
};

export default AutomationArchiveWarning;
