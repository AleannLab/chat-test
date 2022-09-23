import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Avatar from 'components/Avatar';
import { observer } from 'mobx-react';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import copy from 'copy-to-clipboard';

import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import Checkbox from 'components/Core/Checkbox';
import { ReactComponent as LinkIcon } from 'assets/images/link.svg';
import styles from './index.module.css';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import debounce from 'lodash.debounce';
import { convertCurrentTime, convertCustomTime } from 'helpers/timezone';
import AddToQueueRenderer from './AddToQueueRenderer';
import { useFlags } from 'launchdarkly-react-client-sdk';

const PatientNameAvatar = ({ id, firstName, lastName, dob }) => {
  return (
    <div className={styles.avatarName}>
      <Avatar id={id} firstName={firstName} lastName={lastName} />
      <div className={styles.info}>
        <span className={styles.name}>
          {firstName} {lastName}{' '}
          {dob ? ` (${moment().diff(dob, 'years')})` : ''}
        </span>
      </div>
    </div>
  );
};

const NotificationComponent = ({
  rowData,
  copiedRow,
  onCopy,
  isSending,
  handleNotifySelection = () => {},
}) => {
  const { paperlessForm } = useStores();
  const [SMSChecked, setSMSChecked] = useState(rowData.SMSChecked);
  const [emailChecked, setEmailChecked] = useState(rowData.emailChecked);

  useEffect(
    () => handleNotifySelection(SMSChecked, emailChecked),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [SMSChecked, emailChecked],
  );

  const handleOnClick = async (value) => {
    if (value === 'SMS') {
      rowData.SMS = !SMSChecked;
      rowData.Email = emailChecked;
      paperlessForm.updatePatientsList(rowData);
      setSMSChecked(!SMSChecked);
    } else if (value === 'Email') {
      rowData.SMS = SMSChecked;
      rowData.Email = !emailChecked;
      paperlessForm.updatePatientsList(rowData);
      setEmailChecked(!emailChecked);
    }
  };

  return (
    <div className="d-flex" style={{ justifyContent: 'center' }}>
      <div className="d-flex align-items-center">
        <Checkbox
          checked={SMSChecked}
          onClickFunc={() => handleOnClick('SMS')}
          disabled={!rowData.phoneNo || isSending}
        />
        <span className={!rowData.phoneNo ? styles.disabledText : ''}>SMS</span>
      </div>
      <div className="d-flex align-items-center">
        <Checkbox
          checked={emailChecked}
          onClickFunc={() => handleOnClick('Email')}
          disabled={!rowData.emailId || isSending}
        />
        <span className={!rowData.emailId ? styles.disabledText : ''}>
          Email
        </span>
      </div>
    </div>
  );
};

const ActionComponent = ({ rowData, copiedRow, onCopy: setCopied }) => {
  const { paperlessForm, notification } = useStores();
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const handleCopyToClipboard = async () => {
    setGeneratingInvite(true);
    try {
      const { inviteLink } = await paperlessForm.generateInviteLink(rowData.id);
      if (inviteLink) {
        const copySuccessful = () => {
          setCopied(rowData);
          setGeneratingInvite(false);
        };
        const url = inviteLink;
        copy(url, {
          onCopy: copySuccessful(),
        });
        // navigator.clipboard.writeText(url).then(
        //   function () {
        //     onCopy(rowData);
        //     setGeneratingInvite(false);
        //   },
        //   function () {
        //     notification.showError(
        //       'An unexpected error occurred while attempting to copy the invite link',
        //     );
        //   },
        // );
      }
    } catch (err) {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to generate the invite link',
      );
    }
  };

  return (
    <>
      <div className={styles.copylinkContainer} onClick={handleCopyToClipboard}>
        <LinkIcon className="me-2" />
        <span>Copy link</span>
        {generatingInvite ? (
          <CircularProgress
            style={{ color: '#DFE7F5', marginLeft: '10px' }}
            size={15}
          />
        ) : (
          <CircularProgress
            style={{
              color: '#DFE7F5',
              marginLeft: '10px',
              visibility: 'hidden',
            }}
            size={15}
          />
        )}
      </div>
      {copiedRow && !generatingInvite && copiedRow.id === rowData.id ? (
        <div className={styles.copyText}>Copied to clipboard.</div>
      ) : null}
    </>
  );
};

const SendFormsToPatients = ({ onClose }) => {
  const { sendFormsDialogueV2 } = useFlags();
  const [copiedRow, setCopiedRow] = useState(null);
  const { paperlessForm, patients, notification } = useStores();
  const tableRows = [];
  const [isSending, setIsSending] = useState(false);
  const [notifyPatientMap, setNotifyPatientMap] = useState({});

  const handleAddToQueue = async (patientId) => {
    try {
      setNotifyPatientMap((old) => ({
        ...old,
        [patientId]: { ...old[patientId], submitting: true },
      }));
      await paperlessForm.generateInviteLink(
        patientId,
        notifyPatientMap[patientId].sms,
        notifyPatientMap[patientId].email,
      );
      setNotifyPatientMap((old) => ({
        ...old,
        [patientId]: { ...old[patientId], success: true, submitting: false },
      }));
      notification.showSuccess('Forms were sent successfully');
      paperlessForm.resetSelectedSections();
      paperlessForm.setConsentForm();
      paperlessForm.setIsGroupSent(true);
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to an generate invite link',
      );
    }
  };

  useEffect(() => {
    refreshData();

    return () => {
      patients.setFilters(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tableColumns = [
    { id: 'patient', width: '30%', disablePadding: false, label: 'Patient' },
    {
      id: 'dob',
      align: 'center',
      numeric: false,
      disablePadding: false,
      label: 'Date of birth',
    },
    {
      id: 'appointment',
      align: 'center',
      disablePadding: false,
      label: 'Appointment',
    },
    {
      id: 'notification',
      align: 'center',
      numeric: false,
      disablePadding: false,
      label: 'Notify',
    },
    ...[
      sendFormsDialogueV2
        ? {
            id: 'addToQueue',
            align: 'center',
            numeric: false,
            disablePadding: false,
            label: 'Add to queue',
          }
        : [],
    ],
    { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
  ];

  const createData = (
    id,
    firstName,
    lastName,
    dob,
    appointment,
    phoneNo,
    emailId,
    SMSChecked,
    emailChecked,
  ) => {
    const patient = (
      <PatientNameAvatar
        id={id}
        firstName={firstName}
        lastName={lastName}
        dob={dob}
      />
    );
    const notificationComponent = (
      <NotificationComponent
        rowData={{
          id,
          firstName,
          lastName,
          dob,
          appointment,
          phoneNo,
          emailId,
          SMSChecked,
          emailChecked,
        }}
        copiedRow={copiedRow}
        onCopy={(row) => setCopiedRow(row)}
        isSending={isSending}
        handleNotifySelection={(smsChecked, emailChecked) => {
          setNotifyPatientMap((old) => ({
            ...old,
            [id]: { sms: smsChecked, email: emailChecked },
          }));
        }}
      />
    );
    let dateOfBirth = '';
    const action = (
      <ActionComponent
        rowData={{ id, firstName, lastName, dob, appointment }}
        copiedRow={copiedRow}
        onCopy={(row) => setCopiedRow(row)}
      />
    );
    if (dob) {
      dateOfBirth = moment.utc(dob).format('MMMM D, YYYY');
    }
    let appointmentDate;
    if (!appointment) {
      appointmentDate = '-';
    } else if (
      convertCurrentTime({ format: 'MMMMDDYYYY' }) ===
      convertCustomTime({ dateTime: appointment, format: 'MMMMDDYYYY' })
    ) {
      appointmentDate = 'Today';
    } else {
      appointmentDate = convertCustomTime({
        dateTime: appointment,
        format: 'MMMM D, YYYY',
      });
    }

    const addToQueue = (
      <AddToQueueRenderer
        sendSMS={notifyPatientMap[id]?.sms ?? false}
        sendEmail={notifyPatientMap[id]?.email ?? false}
        showSuccessLabel={notifyPatientMap[id]?.success ?? false}
        handleAddToQueue={() => handleAddToQueue(id)}
        isSubmitting={notifyPatientMap[id]?.submitting ?? false}
      />
    );
    return {
      id,
      patient,
      dateOfBirth,
      appointmentDate,
      notificationComponent,
      ...(sendFormsDialogueV2 ? { addToQueue } : {}),
      action,
    };
  };

  if (patients.pagerData.length > 0) {
    patients.pagerData.forEach((id) => {
      const patient = patients.get([{}, id]);
      let SMSChecked = false;
      let emailChecked = false;
      if (
        paperlessForm.getPatientInPatientsInvitationList({ id: patient.id })
          .length > 0
      ) {
        SMSChecked = paperlessForm.getPatientInPatientsInvitationList({
          id: patient.id,
        })[0].SMS;

        emailChecked = paperlessForm.getPatientInPatientsInvitationList({
          id: patient.id,
        })[0].Email;
      }
      tableRows.push(
        createData(
          patient.id,
          patient.firstname,
          patient.lastname,
          patient.dob,
          patient.next_appointment_on,
          patient.phone_no,
          patient.email,
          SMSChecked,
          emailChecked,
        ),
      );
    });
  }
  const loadData = () => patients.fetchMore({});

  const handleClose = () => {
    paperlessForm.resetPatientsInvitationList();
    onClose();
  };

  const handleSubmit = async () => {
    if (paperlessForm.patientsInvitationList.length > 0) {
      try {
        setIsSending(true);
        await Promise.all(
          paperlessForm.patientsInvitationList.map(async (patient) => {
            try {
              await paperlessForm.generateInviteLink(
                patient.id,
                patient.SMS,
                patient.Email,
              );
            } catch (err) {
              console.error(err);
              throw Error(
                'An unexpected error occurred while attempting to an generate invite link',
              );
            }
          }),
        )
          .then(() => {
            notification.showSuccess('Forms were sent successfully');
            paperlessForm.resetSelectedSections();
            paperlessForm.setConsentForm();
            paperlessForm.setIsGroupSent(true);
            setTimeout(() => {
              notification.hideNotification();
              handleClose();
            }, 2500);
          })
          .catch((err) => {
            console.error(err);
            notification.showError(
              'An unexpected error occurred while attempting to send the invites',
            );
            setTimeout(() => {
              notification.hideNotification();
              handleClose();
            }, 3000);
          });
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to send the invites',
        );
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 3000);
      }
    }
  };

  const refreshData = (searchText) => {
    let search = searchText
      ? { search: searchText }
      : { appointmentDate: moment().format() };
    patients.setFilters({
      ...search,
      patientsOnly: true,
    });
  };

  const handlePatientSearch = debounce((searchText) => {
    refreshData(searchText);
  }, 500);

  return (
    <Modal
      header="Add Form(s) to Patient Queue"
      size="lg"
      allowClosing
      enableMargin={false}
      body={
        <div className="d-flex flex-column justify-content-center mx-5 pl-5 pr-5">
          <div className={styles.subTitleText}>
            Search for a patient and select an action.
          </div>
          <div className={styles.searchBar}>
            <SearchIcon className="me-1" />
            <InputBase
              className={styles.inputBox}
              placeholder="Search..."
              onChange={(e) => handlePatientSearch(e.target.value)}
            />
          </div>
          <Table
            columns={tableColumns}
            rows={tableRows}
            isSelectable={false}
            sortBy={tableColumns[0].id}
            height={450}
            isEmpty={!patients.loading && !patients.pagerData.length}
            enableSearchBar={false}
            loadData={loadData}
            dataToFetch={patients}
          />
        </div>
      }
      footer={
        !sendFormsDialogueV2 ? (
          <div className="d-flex justify-content-between w-100 mx-5 pl-5 pr-5">
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
              disabled={isSending}
            >
              {isSending ? 'Sending' : 'Send'}
            </Button>
          </div>
        ) : null
      }
      onClose={handleClose}
    />
  );
};

export default observer(SendFormsToPatients);
