import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Avatar from 'components/Avatar';
import moment from 'moment-timezone';
import { observer } from 'mobx-react';

import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import styles from './index.module.css';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import debounce from 'lodash.debounce';
import { convertCurrentTime, convertCustomTime } from 'helpers/timezone';

const PatientNameAvatar = ({ id, firstName, lastName }) => {
  return (
    <div className={styles.avatarName}>
      <Avatar id={id} firstName={firstName} lastName={lastName} />
      <p className={styles.patientName}>
        {firstName} {lastName}
      </p>
    </div>
  );
};

const tableColumns = [
  { id: 'patient', width: '35%', disablePadding: false, label: 'Patient' },
  {
    id: 'date of birth',
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
    id: 'time',
    align: 'center',
    disablePadding: false,
    label: 'Time',
  },
];

const createData = (
  appointmentId,
  patientId,
  firstName,
  lastName,
  dob,
  appointment,
) => {
  let appointmentDate = '';
  let appointmentTime = '';
  let dateOfBirth = '';
  if (dob) {
    dateOfBirth = moment.utc(dob).format('MMMM D, YYYY');
  }

  if (!appointment) {
    appointmentDate = '-';
    appointmentTime = '-';
  } else if (
    convertCurrentTime({ format: 'MMMM D' }) ===
    moment(appointment).format('MMMM D')
  ) {
    appointmentDate = 'Today';
    appointmentTime = moment(appointment).format('LT');
  } else {
    appointmentDate = moment(appointment).format('MMMM D, YYYY');
    appointmentTime = moment(appointment).format('LT');
  }

  const patient = (
    <PatientNameAvatar
      id={patientId}
      firstName={firstName}
      lastName={lastName}
    />
  );

  return {
    id: appointmentId,
    patient,
    dateOfBirth,
    appointmentDate,
    appointmentTime,
  };
};

const AddPatient = () => {
  const history = useHistory();
  const [selectedRows, setSelectedRows] = useState([]); //NOSONAR
  const [isSubmitting, setSubmitting] = useState(false);
  const { lobby, appointments, notification, scheduling } = useStores();
  const [searchText, setSearchText] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState();

  const tableRows = useMemo(() => {
    if (!appointmentsData || !appointmentsData.length) return [];
    return appointmentsData.map(({ id, patient, startDate }) =>
      createData(
        id,
        patient.id,
        patient.firstName,
        patient.lastName,
        patient.dob,
        startDate,
      ),
    );
  }, [appointmentsData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const getData = async () => {
      const data = await scheduling.getAppointments(scheduling.currentDate);
      setAppointmentsData(data);
    };
    getData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    history.goBack();
  };

  const handleSubmitForm = async () => {
    try {
      setSubmitting(true);

      const patients = selectedRows.map((row) => {
        const appointment = appointmentsData.find((d) => d.id === row);
        return { patientId: appointment?.patient.id, appointmentId: row };
      });
      await lobby.addPatientsBulk(patients);
      notification.showSuccess('Patient(s) were added succesfully');
      history.goBack();
    } catch (e) {
      notification.showError(
        'An unexpected error occurred while attempting to add the patient(s)',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const refreshData = async (searchText) => {
    setSearchText(searchText);
    const search = searchText ? { search: searchText } : {};
    const data = await scheduling.getAppointments(
      scheduling.currentDate,
      search,
    );
    setAppointmentsData(data);
  };

  const handlePatientSearch = debounce((searchText) => {
    refreshData(searchText);
  }, 500);

  return (
    <Modal
      header="Add Appointment"
      body={
        <div className={styles.addPatientContainer}>
          <p className={styles.subtitle}>
            You can add new patients to waiting lobby.{' '}
          </p>
          <div className={styles.searchBar}>
            <SearchIcon className="me-1" />
            <InputBase
              className={styles.inputBox}
              placeholder="Search..."
              onChange={(e) => handlePatientSearch(e.target.value)}
            />
          </div>
          <div className="d-flex flex-column justify-content-center">
            <Table
              columns={tableColumns}
              rows={tableRows}
              sortBy={tableColumns[0].id}
              enableSearchBar={false}
              isSelectable
              isAlreadyAdded={(appointmentId) => {
                return lobby.isAppointmetAlreadyAdded({ appointmentId });
              }}
              selected={selectedRows}
              onRowSelect={(rows) => setSelectedRows(rows)}
              height={450}
              allowSelectAll={false}
              emptyText={
                searchText
                  ? 'No matching patients with appointments today.'
                  : 'No appointments today, please search for patient.'
              }
              // isEmpty={!patients.loading && !patients.pagerData.length}
              isEmpty={appointmentsData && !appointmentsData.length}
            />
          </div>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            disabled={isSubmitting}
            color="primary"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmitForm}
            className="secondary-btn"
            variant="contained"
            disabled={isSubmitting || selectedRows.length === 0}
            color="secondary"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </>
      }
      onClose={handleClose}
    />
  );
};

export default observer(AddPatient);
