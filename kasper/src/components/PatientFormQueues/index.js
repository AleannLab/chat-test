import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Avatar from 'components/Avatar';
import { observer } from 'mobx-react';
import moment from 'moment';
import ActionsMenu from './ActionsMenu';
import HashFormQueue from './HashFormQueue';
import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import styles from './index.module.css';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import debounce from 'lodash.debounce';

const PatientNameAvatar = ({ id, firstName, lastName, dob }) => {
  return (
    <div className={styles.avatarName}>
      <Avatar id={id} firstName={firstName} lastName={lastName} />
      <div className={styles.info}>
        <span className={styles.name}>
          {firstName} {lastName}{' '}
        </span>
      </div>
    </div>
  );
};
const OfForms = ({ showHashFormHandler, incompleteForms, patientInfo }) => {
  return (
    <div className="d-flex align-item-center justify-content-center flex-column">
      <span>{incompleteForms.length}</span>
      <small
        className={styles.ofFormView}
        onClick={() => showHashFormHandler(patientInfo)}
      >
        click to View
      </small>
    </div>
  );
};

const PatientFormQueues = ({ onClose }) => {
  const { paperlessForm, patient, formInitiation, notification } = useStores();
  const tableRows = [];
  const [showHashFormQueue, setShowHashFormQueue] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [particularPatientInfo, setParticularPatientInfo] = useState({});
  const currentDate = moment();
  const weekEnd = currentDate.clone().endOf('week');
  const weekStart = currentDate.clone().startOf('week').format('YYYY-MM-DD');
  const weekEndDate = weekEnd.format('YYYY-MM-DD');

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
      id: '#ofForms',
      align: 'center',
      disablePadding: false,
      label: '# of forms',
    },
    {
      id: 'start',
      align: 'center',
      disablePadding: false,
      label: 'Appt. Date',
      canSort: true,
    },
    { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
  ];

  const prepareActionList = () => {
    return [
      { label: 'Resend link via Email', value: 1 },
      { label: 'Resend link via SMS', value: 2 },
      { label: 'Copy Link', value: 3 },
      { label: 'Clear Forms', value: 4 },
    ];
  };

  const showHashFormHandler = async (patientInfo) => {
    await setParticularPatientInfo(patientInfo);
    setShowHashFormQueue(true);
  };

  const refreshData = (searchText) => {
    let search =
      searchText && searchText != ''
        ? { search: searchText }
        : { weekEndDate: weekEndDate, sortCol: 'start', sortDir: 'asc' };
    formInitiation.setFilters({
      ...search,
      hasForms: true,
    });
  };

  const createData = (
    id,
    firstName,
    lastName,
    dob,
    appointment,
    incompleteForms,
    secret,
    startDate,
    patient_id,
    phone,
    email,
  ) => {
    const patient = (
      <PatientNameAvatar
        id={id}
        firstName={firstName}
        lastName={lastName}
        dob={dob}
      />
    );
    const patientInfo = {
      firstName: firstName,
      lastName: lastName,
      patientId: patient_id,
      phone: phone,
      email: email,
    };
    let dateOfBirth = '';
    let forms = (
      <OfForms
        showHashFormHandler={showHashFormHandler}
        incompleteForms={incompleteForms}
        patientInfo={patientInfo}
      />
    );

    const action = (
      <ActionsMenu
        menuItems={prepareActionList()}
        rowData={{
          id,
          firstName,
          lastName,
          dob,
          appointment,
          incompleteForms,
          secret,
          phone,
          email,
        }}
        refreshData={refreshData}
        searchItem={searchItem}
      />
    );
    if (dob) {
      dateOfBirth = moment.utc(dob).format('MM/DD/YYYY');
    }
    let start = '-';
    if (startDate) {
      start = moment.utc(startDate).format('MM/DD/YYYY');
    }
    return {
      id,
      patient,
      dateOfBirth,
      forms,
      start,
      action,
    };
  };
  if (formInitiation.pagerData.length > 0) {
    formInitiation.pagerData.forEach((id) => {
      const patientQueue = formInitiation.get([{}, id]);
      tableRows.push(
        createData(
          patientQueue.id,
          patientQueue.firstname,
          patientQueue.lastname,
          patientQueue.dob,
          patientQueue.next_appointment_on,
          patientQueue.incomplete_forms,
          patientQueue.secret,
          patientQueue.start,
          patientQueue.patient_id,
          patientQueue.phone_no,
          patientQueue.email,
        ),
      );
    });
  }
  const loadData = () => formInitiation.fetchMore({});

  const handleClose = () => {
    paperlessForm.resetPatientsInvitationList();
    onClose();
  };

  useEffect(() => {
    refreshData(searchItem);
  }, [searchItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePatientSearch = debounce((searchText) => {
    setSearchItem(searchText);
  }, 500);

  return (
    <>
      <Modal
        header="Patient Form Queues"
        size="md"
        body={
          <div className="d-flex flex-column justify-content-center">
            <div className={styles.subTitleText}>
              Below is a list of patients with incomplete forms outstanding.
            </div>
            <div className={styles.searchBar}>
              <SearchIcon className="me-1" />
              <InputBase
                className={styles.inputBox}
                placeholder="Search..."
                onChange={(e) => handlePatientSearch(e.target.value)}
              />
            </div>
            <div className={styles.PatientFormQueuesTable}>
              <Table
                columns={tableColumns}
                rows={tableRows}
                isSelectable={false}
                sortBy={tableColumns[3].id}
                height={450}
                isEmpty={
                  !formInitiation.loading && !formInitiation.pagerData.length
                }
                enableSearchBar={false}
                loadData={loadData}
                dataToFetch={formInitiation}
              />
            </div>
          </div>
        }
        footer={
          <div className="d-flex w-100 justify-content-center">
            <Button
              className="primary-btn"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        }
        onClose={handleClose}
      />
      {showHashFormQueue === true && (
        <HashFormQueue
          onClose={() => setShowHashFormQueue(false)}
          particularPatientInfo={particularPatientInfo}
          patientListIncompleteForms={refreshData}
          searchPatient={searchItem}
        />
      )}
    </>
  );
};

export default observer(PatientFormQueues);
