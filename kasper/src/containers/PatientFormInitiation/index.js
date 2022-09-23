import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Avatar from 'components/Avatar';
import moment from 'moment';
import { observer } from 'mobx-react';
import debounce from 'lodash.debounce';
import { useHistory } from 'react-router-dom';

import { useStores } from 'hooks/useStores';
import { useAuthenticated } from 'hooks/useAuthenticated';
import Table from 'components/Core/Table';
import Notification from 'components/Notification';
import { ReactComponent as PoweredByKasper } from 'assets/images/powered-by-kasper.svg';
import styles from './index.module.css';
import { convertCurrentTime, convertCustomTime } from 'helpers/timezone';
import HeadComp from 'components/SEO/HelmetComp';

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

const PatientFormInitiation = () => {
  const { formInitiation, notification } = useStores();
  const history = useHistory();
  const tableRows = [];
  useAuthenticated();

  const tableColumns = [
    { id: 'patient', width: '45%', disablePadding: false, label: 'Patient' },
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
    { id: 'action', numeric: false, disablePadding: false, label: '' },
  ];

  useEffect(() => {
    if (!formInitiation.isAuthorized) {
      history.replace('/lock-screen');
    } else {
      formInitiation.refreshPager({ hasForms: true }).catch((err) => {
        notification.showError(err.message);
      });
      return () => {
        formInitiation.setFilters(null);
      };
    }
  }, [formInitiation.isAuthorized]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = () => formInitiation.fetchMore({ hasForms: true });

  const createData = (
    id,
    firstName,
    lastName,
    dob,
    appointment,
    inviteLink,
  ) => {
    let appointmentDate = '';
    let dateOfBirth = dob ? moment.utc(dob).format('MMMM D, YYYY') : '-';

    if (!appointment) {
      appointmentDate = '-';
    } else if (
      convertCurrentTime({ format: 'MMMM D' }) ===
      convertCustomTime({ dateTime: appointment, format: 'MMMM D' })
    ) {
      appointmentDate = 'Today';
    } else {
      appointmentDate = convertCustomTime({
        dateTime: appointment,
        format: 'MMMM D, YYYY',
      });
    }

    const patient = (
      <PatientNameAvatar id={id} firstName={firstName} lastName={lastName} />
    );

    const action = (
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          window.open(inviteLink, '_blank');
          formInitiation.setIsAuthorized(false);
        }}
      >
        Start
      </Button>
    );

    return { id, patient, dateOfBirth, appointmentDate, action };
  };

  if (formInitiation.pagerData.length > 0) {
    formInitiation.pagerData.forEach((id) => {
      const patient = formInitiation.get([{}, id]);
      tableRows.push(
        createData(
          patient.patient_id,
          patient.firstname,
          patient.lastname,
          patient.dob,
          patient.appointmentDate,
          patient.invite_link,
        ),
      );
    });
  }

  const handlePatientSearch = debounce((searchText) => {
    if (searchText.length === 0) {
      formInitiation.setFilters({ hasForms: true });
    } else {
      formInitiation.setFilters({ hasForms: true, search: searchText });
    }
  }, 500);

  return (
    <>
      <HeadComp title="Patient Forms" />
      <div className={styles.container}>
        <div style={{ height: '100%' }}>
          <div className={styles.contentContainer}>
            <span className={styles.title}>Patient Form Initiation</span>
            <span className={styles.description}>
              Select a patient to load their forms. To add forms to a patient’s
              profile, please go to the “Patient Form” section of your Kasper
              dashboard.
            </span>
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
              sortBy={tableColumns[0].id}
              enableSearchBar={false}
              isSelectable={false}
              allowSelectAll={false}
              height="75vh"
              isEmpty={
                !formInitiation.loading && !formInitiation.pagerData.length
              }
              loadData={loadData}
              dataToFetch={formInitiation}
            />
          </div>
        </div>
        <div className={styles.kapsperLogo}>
          <PoweredByKasper />
        </div>
        <Notification />
      </div>
    </>
  );
};

export default observer(PatientFormInitiation);
