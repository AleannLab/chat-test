import React, { useMemo, useRef, useState } from 'react';
import { Typography, Box, Button, withStyles } from '@material-ui/core';
import Tabs from 'components/Core/Tabs';
import { useMutation, useQueryClient } from 'react-query';
import { useStores } from 'hooks/useStores';
import { ReactComponent as DownloadIcon } from 'assets/images/download.svg';
import { ReactComponent as SendToODIcon } from 'assets/images/send-to-od.svg';
import { ReactComponent as PreviewIcon } from 'assets/images/eye.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import { ReactComponent as SMSIcon } from 'assets/images/comment.svg';
import { ReactComponent as EmailIcon } from 'assets/images/mail.svg';
import { ReactComponent as LinkIcon } from 'assets/images/link.svg';
import { ReactComponent as NoDataIcon } from 'assets/images/form-with-pencil.svg';
import ClearForms from 'components/PatientFormQueues/ClearForm';
import FormPreview from 'components/PatientFormQueues/HashFormQueue/FormPreview';
import FormCard from './FormCard';
import ActionMenu from './ActionMenu';
import Loading from '../Loading';
import PatientData from '../../PatientData';

import './patientForms.css';
import TabHeader from '../TabHeader';
import AddForm from '../AddForm';

const showMenuOptions = false;

const FORM_CARD_TYPE = {
  Complete: 1,
  Incomplete: 2,
};
const StyledButton = withStyles((theme) => ({
  root: {
    padding: 0,
  },
}))(Button);
const TabLabel = ({ text, count }) => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <span>{text}</span>
      {count && (
        <p className="tab-label-count">
          <span>{count}</span>
        </p>
      )}
    </div>
  );
};

const NoDataAvailable = ({ message }) => (
  <div className="h-100 d-flex align-items-center justify-content-center flex-column">
    <div className="no-data-available">
      <NoDataIcon />
    </div>
    <Typography
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: '#999999',
        marginTop: '1rem',
      }}
    >
      {message}
    </Typography>
  </div>
);

const TabBody = ({
  forms,
  formType, // Incomplete or Complete
  noDataMsg,
  actionMenuOptions,
  contextMenuOptions,
}) => {
  return (
    <div className="d-flex h-100 flex-column">
      {forms.length === 0 ? (
        <NoDataAvailable message={noDataMsg} />
      ) : (
        <div>
          <ActionMenu options={actionMenuOptions} forms={forms} />
          {forms
            .sort((a, b) => new Date(b.completed_on) - new Date(a.completed_on))
            .map((form) => {
              return (
                <FormCard
                  type={formType}
                  formKey={form.key}
                  formID={form.formID}
                  file_uuid={form?.file_uuid}
                  file_name={form?.file_name}
                  key={form.key}
                  completed_on={form?.completed_on}
                  formName={form.name}
                  menuOptions={contextMenuOptions}
                  actionDate={
                    formType === FORM_CARD_TYPE.Incomplete
                      ? form.sent_on
                      : form.completed_on
                  }
                  actionPrefix={
                    formType === FORM_CARD_TYPE.Incomplete
                      ? null
                      : 'Completed on'
                  }
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

const PatientForms = ({ forms: patientForms }) => {
  const [showPatientData, setShowPatientData] = useState(false);
  const [clearForms, setClearForms] = useState(false);
  const [formPreview, setFormPreview] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const variableRef = useRef({ selectedFormKey: null });
  const queryClient = useQueryClient();
  const {
    patientsFeed,
    notification,
    paperlessForm,
    patientData,
    patientForm,
  } = useStores();
  const selectedPatient = patientsFeed.selectedPatient;

  const deleteForm = useMutation(
    (forms) => patientForm.updatePatientInvitation(patientForms.secret, forms),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patientForms');
        notification.showSuccess('Form deleted successfully');
      },
      onError: (errorMessage) => {
        notification.showError(errorMessage);
      },
    },
  );

  const patientInvitation = useMutation(
    (patient_id) => patientForm.patientInvitation(patient_id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patientForms');
      },
      onError: (errorMessage) => {
        notification.showError(errorMessage);
      },
    },
  );

  const sendToOpenDental = useMutation(
    (payload) => patientData.sendToOpenDental(selectedPatient.id, payload),
    {
      onSuccess: () => {
        notification.showInfo('Your form is being uploaded to your PMS.');
        setTimeout(() => {
          notification.hideNotification();
        }, 5000);
      },
      onError: (errorMessage) => {
        notification.showError(errorMessage);
      },
    },
  );

  const tabs = useMemo(() => {
    if (!patientForms) {
      return [];
    }
    const {
      completed_forms: completedForms,
      incomplete_forms: incompleteForms,
    } = patientForms;

    return [
      {
        index: 0,
        label: (
          <TabLabel text="Pending" count={incompleteForms.length || null} />
        ),
        body: (
          <TabBody
            forms={incompleteForms}
            formType={FORM_CARD_TYPE.Incomplete}
            noDataMsg="No pending forms"
            actionMenuOptions={[
              {
                key: 'resendLinkViaEmail',
                text: 'Resend Link via Email',
                icon: (
                  <EmailIcon width="12px" height="20px" className="menu-icon" />
                ),
                disabled: !selectedPatient.email,
                handleClick: async () => {
                  incompleteForms.forEach((f, index) => {
                    const form = { ...f, formKey: f.key };
                    paperlessForm.selectSection({ form, index });
                  });

                  try {
                    await paperlessForm.generateInviteLink(
                      selectedPatient.id,
                      false,
                      true,
                    );
                  } catch (err) {
                    console.error(err);
                    throw Error(
                      'An unexpected error occurred while attempting to an generate invite link',
                    );
                  }
                  notification.showSuccess('Forms were sent successfully');
                  paperlessForm.resetSelectedSections();
                },
              },
              {
                key: 'resendLinkViaSMS',
                text: 'Resend Link via SMS',
                disabled: !selectedPatient.phone_no,
                icon: (
                  <SMSIcon width="12px" height="20px" className="menu-icon" />
                ),
                handleClick: async () => {
                  incompleteForms.forEach((f, index) => {
                    const form = { ...f, formKey: f.key };
                    paperlessForm.selectSection({ form, index });
                  });
                  try {
                    await paperlessForm.generateInviteLink(
                      selectedPatient.id,
                      true,
                      false,
                    );
                  } catch (err) {
                    console.error(err);
                    throw Error(
                      'An unexpected error occurred while attempting to an generate invite link',
                    );
                  }
                  notification.showSuccess('Forms were sent successfully');
                  paperlessForm.resetSelectedSections();
                },
              },
              {
                key: 'copyLink',
                text: 'Copy Link',
                icon: (
                  <LinkIcon width="12px" height="20px" className="menu-icon" />
                ),
                handleClick: async () => {
                  let url = '';
                  try {
                    notification.showInfo('Generating link');
                    const { inviteLink } =
                      await paperlessForm.generateInviteLink(
                        selectedPatient.id,
                      );
                    url = inviteLink;
                  } catch (err) {
                    console.error(err);
                    notification.showError(
                      'An unexpected error occurred while attempting to generate the invite link',
                    );
                    throw Error(
                      'An unexpected error occurred while attempting to an generate invite link',
                    );
                  }
                  navigator.clipboard.writeText(url);
                  notification.showSuccess('Link copied to clipboard');
                  setTimeout(() => {
                    notification.hideNotification();
                  }, 5000);
                },
              },
              {
                key: 'clearForms',
                text: 'Clear Forms',
                icon: (
                  <DeleteIcon
                    width="12px"
                    height="20px"
                    className="menu-icon"
                  />
                ),
                handleClick: () => {
                  setClearForms(true);
                },
              },
            ]}
            contextMenuOptions={[
              {
                name: 'Preview',
                handleClick: (formKey) => {
                  variableRef.current.selectedFormKey = formKey;
                  setFormPreview(true);
                },
                icon: (
                  <PreviewIcon
                    width="14px"
                    height="20px"
                    className="menu-icon"
                  />
                ),
              },
              {
                name: 'Delete Form',
                handleClick: (formKey) => {
                  const forms = incompleteForms
                    .filter((form) => form.key !== formKey)
                    .map((form) => form.key);
                  deleteForm.mutate(forms);
                },
                icon: (
                  <DeleteIcon
                    width="11px"
                    height="20px"
                    className="menu-icon"
                  />
                ),
              },
            ]}
          />
        ),
      },
      {
        index: 1,
        label: (
          <TabLabel text="Completed" count={completedForms.length || null} />
        ),
        body: (
          <TabBody
            forms={completedForms}
            formType={FORM_CARD_TYPE.Complete}
            noDataMsg="No forms completed"
            actionMenuOptions={[
              ...(showMenuOptions
                ? [
                    {
                      key: 'downloadAllAsPDF',
                      text: 'Download All as PDF',
                      icon: null,
                      handleClick: () => {},
                    },
                  ]
                : []),
              {
                key: 'viewDataAsTable',
                text: 'View Data as Table',
                icon: null,
                handleClick: () => {
                  patientData.setSelectedPatient(
                    selectedPatient.id,
                    selectedPatient.firstname,
                    selectedPatient.lastname,
                  );
                  setShowPatientData(true);
                },
              },
            ]}
            contextMenuOptions={[
              ...(showMenuOptions
                ? [
                    {
                      name: 'Download',
                      handleClick: () => void 0,
                      icon: (
                        <DownloadIcon
                          width="12px"
                          height="20px"
                          className="menu-icon"
                        />
                      ),
                    },
                  ]
                : []),
              {
                name: 'Send to PMS',
                handleClick: (
                  formKey,
                  formID,
                  file_uuid,
                  completed_on,
                  file_name,
                ) => {
                  sendToOpenDental.mutate({
                    formKey: formKey,
                    secret: patientForms.secret,
                    formSpecific: formID,
                    uuid: file_uuid,
                    completed_on,
                    file_name,
                  });
                },
                icon: (
                  <SendToODIcon
                    width="12px"
                    height="20px"
                    className="menu-icon"
                  />
                ),
              },
            ]}
          />
        ),
      },
    ];
  }, [
    patientForms,
    notification,
    paperlessForm,
    selectedPatient,
    patientData,
    deleteForm,
    sendToOpenDental,
  ]);

  const addFormHandler = () => {
    if (patientForms.invite_link === null) {
      patientInvitation.mutate(patientForms.patient_id);
    }
    setShowAddNewModal(true);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <TabHeader title="Patient Forms">
        <StyledButton
          color="secondary"
          disabled={!patientForms}
          onClick={() => addFormHandler()}
        >
          + Add Form
        </StyledButton>
      </TabHeader>
      {!patientForms ? (
        [...Array(3)].map((x, i) => <Loading variant="rect" key={i} />)
      ) : (
        <>
          <Tabs
            className="patient-forms-tabs"
            panelClassName="tab-panel-container"
            config={tabs}
            defaultTabIndex={tabs[0].index}
          />
          {showPatientData && (
            <PatientData onClose={() => setShowPatientData(false)} />
          )}
          {clearForms && (
            <ClearForms
              onClose={() => setClearForms(false)}
              refreshData={() => queryClient.invalidateQueries('patientForms')}
              inviteId={patientForms.secret}
            />
          )}
          {formPreview && (
            <FormPreview
              onCloseFormPreview={() => setFormPreview(false)}
              formkey={variableRef.current.selectedFormKey}
            />
          )}
        </>
      )}
      {showAddNewModal && (
        <AddForm
          invitationId={patientForms.secret}
          forms={patientForms.incomplete_forms ?? []}
          onClose={() => setShowAddNewModal(false)}
        />
      )}
    </Box>
  );
};

export default PatientForms;
