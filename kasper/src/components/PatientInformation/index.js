import React, { useState } from 'react';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import Grid from '@material-ui/core/Grid';
import PhoneNumber from 'awesome-phonenumber';
import Call from 'assets/images/call.svg';
import Message from 'assets/images/message.svg';
import Copy from 'assets/images/copy.svg';
import Button from '@material-ui/core/Button';
import { ReactComponent as ContactIcon } from 'assets/images/contact.svg';
import PatientData from 'containers/Dashboard/PatientFeed/PatientData';
import moment from 'moment';
import Skeleton from '@material-ui/lab/Skeleton';
import { checkSignificantLength, normalizeNumber } from 'helpers/misc';

const PatientInformation = ({ patientId }) => {
  const {
    patientData,
    notification,
    dialer,
    scheduling: schedulingStore,
  } = useStores();
  const [showPatientData, setShowPatientData] = useState(false);

  // react-query to fetch patient information by patient id
  const patientInformationQuery = useQuery(
    ['patientInformation', patientId],
    () => schedulingStore.getPatientInformationById(patientId),
    {
      enabled: !!patientId,
      onSuccess: (response) => {
        return response;
      },
      staleTime: Infinity,
    },
  );

  const handleCopy = (type, value) => {
    navigator.clipboard.writeText(value);
    notification.showSuccess(
      `${type.charAt(0).toUpperCase() + type.slice(1)} was copied succesfully`,
    );
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
  };

  const handlePatientDataClick = () => {
    patientData.setSelectedPatient(
      patientInformationQuery.data.id,
      patientInformationQuery.data.firstName,
      patientInformationQuery.data.lastName,
    );
    setShowPatientData(true);
  };

  const handlePhoneClick = (phoneNumber) => {
    let phone = PhoneNumber(normalizeNumber(phoneNumber), 'US');
    dialer.startCall(
      phone
        ? checkSignificantLength(phone, phoneNumber)
        : normalizeNumber(phoneNumber),
    );
  };

  return patientInformationQuery.isSuccess ? (
    <>
      <Grid container>
        {/* Start Phone */}
        <Grid container>
          <Grid item xs={6} sm={6} md={6} lg={4}>
            <div className={styles.fieldLabel}>Phone</div>
          </Grid>
          <Grid item xs={2} md={2} lg={1}>
            {patientInformationQuery.data.phoneNo &&
            patientInformationQuery.data.phoneNo !== '' ? (
              <img
                src={Call}
                alt="kasper"
                style={{
                  height: '15px',
                  marginLeft: '10px',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  handlePhoneClick(patientInformationQuery.data.phoneNo)
                }
              />
            ) : (
              <span
                className="ms-2"
                style={{ fontSize: '1rem', fontWeight: 500 }}
              >
                n/a
              </span>
            )}
          </Grid>
          <Grid item xs={4} md={4} lg={7} className="ps-2">
            <div className={styles.fieldValues}>
              {patientInformationQuery.data.phoneNo &&
                patientInformationQuery.data.phoneNo !== '' && (
                  <div>
                    {PhoneNumber(
                      patientInformationQuery.data.phoneNo,
                    ).getNumber('national')}
                    <img
                      src={Copy}
                      alt="Copy"
                      style={{
                        height: '15px',
                        marginLeft: '10px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        handleCopy(
                          'phone number',
                          PhoneNumber(
                            patientInformationQuery.data.phoneNo,
                          ).getNumber('national'),
                        )
                      }
                    />
                  </div>
                )}
            </div>
          </Grid>
        </Grid>
        {/* End Phone */}

        {/* Start Email */}
        <Grid container className="mt-2">
          <Grid item xs={6} md={6} lg={4}>
            <div className={styles.fieldLabel}>Email</div>
          </Grid>
          <Grid item xs={2} md={2} lg={1}>
            {patientInformationQuery.data.email ? (
              <img
                src={Message}
                alt="kasper"
                style={{ height: '12px', marginLeft: '10px', width: '15px' }}
              />
            ) : (
              <span
                className="ms-2"
                style={{ fontSize: '1rem', fontWeight: 500 }}
              >
                n/a
              </span>
            )}
          </Grid>
          <Grid item xs={4} md={4} lg={7} className="ps-2">
            <div className={styles.fieldValues}>
              {patientInformationQuery.data.email}
              {patientInformationQuery.data.email && (
                <img
                  src={Copy}
                  alt="Copy"
                  style={{
                    height: '15px',
                    marginLeft: '10px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    handleCopy('email id', patientInformationQuery.data.email)
                  }
                />
              )}
            </div>
          </Grid>
        </Grid>
        {/* Start Email */}

        {/* Start Preferred Provider */}
        <Grid container className="mt-2">
          <Grid item xs={6} md={6} lg={4}>
            <div className={styles.fieldLabel}>Preferred Provider</div>
          </Grid>
          <Grid item xs={6} md={6} lg={8} className="ps-2">
            <div className={styles.fieldValues}>
              {patientInformationQuery.data.prefferedProvider}
            </div>
          </Grid>
        </Grid>
        {/* End Preferred Provider */}

        {/* Start Date of Birth */}
        <Grid container className="mt-2">
          <Grid item xs={6} md={6} lg={4}>
            <div className={styles.fieldLabel}>Date of Birth</div>
          </Grid>
          <Grid item xs={6} md={6} lg={8} className="ps-2">
            <div className={styles.fieldValues}>
              {patientInformationQuery.data.dob
                ? `${moment(patientInformationQuery.data.dob).format(
                    'MM/DD/YYYY',
                  )} (${moment().diff(
                    patientInformationQuery.data.dob,
                    'years',
                  )})`
                : 'n/a'}
            </div>
          </Grid>
        </Grid>
        {/* End Date of Birth */}

        <Grid container className="mt-2">
          <Button
            size="medium"
            fullWidth
            startIcon={<ContactIcon />}
            variant="outlined"
            color="secondary"
            onClick={handlePatientDataClick}
          >
            Patient Data
          </Button>
        </Grid>
      </Grid>
      {showPatientData === true && (
        <PatientData onClose={() => setShowPatientData(false)} />
      )}
    </>
  ) : patientInformationQuery.isFetching ? (
    <Loader />
  ) : null;
};

export default PatientInformation;

const Loader = () => (
  <Grid container>
    {[...Array(4)].map((d, i) => (
      <Grid item key={i} className="mt-2 d-flex flex-row">
        <Skeleton variant="text" height={20} width={50} />
        <Skeleton className="ms-3" variant="text" height={20} width={200} />
      </Grid>
    ))}
  </Grid>
);
