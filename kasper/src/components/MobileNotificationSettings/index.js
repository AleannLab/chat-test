import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { useParams } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import Container from '@material-ui/core/Container';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { observer } from 'mobx-react';
import LinearProgress from '@material-ui/core/LinearProgress';
import Skeleton from '@material-ui/lab/Skeleton';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';
import { useStores } from 'hooks/useStores';
import Notification from 'components/Notification';
import NotificationCard from './NotificationCard';
import NotificationSkeleton from './NotificationCard/NotificationSkeleton';
import AppointmentCard from './AppointmentCard';
import AppointmentSkeleton from './AppointmentCard/AppointmentSkeleton';
import CONSTANTS from 'helpers/constants';
import header from './assets/header.png';
import styles from './index.module.css';
import useResponsive from 'hooks/useResponsive';

const MobileNotificationSettings = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const { mobileNotificationSettings, notification } = useStores();
  const params = useParams();
  const patientSecret = params.patientSecret;
  const responsiveInfo = useResponsive();

  useEffect(() => {
    mobileNotificationSettings.fetchTenantInfo({ patientSecret }).catch(() => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the office details',
      );
    });
    mobileNotificationSettings
      .fetchPatientInfo({ patientSecret })
      .then(() => {
        mobileNotificationSettings
          .fetchNotifications({
            id: mobileNotificationSettings.patientInformation.id,
            patientSecret,
          })
          .catch((err) => {
            console.error(err.message);
            notification.showError(
              'An unexpected error occurred while attempting to fetch the notifications',
            );
          });
        mobileNotificationSettings.resetAppointments();
        mobileNotificationSettings
          .fetchAppointments({ patientSecret })
          .catch((err) => {
            console.error(err.message);
            notification.showError(
              'An unexpected error occurred while attempting to fetch the appointments',
            );
          });
      })
      .catch((err) => {
        console.error(err.message);
        notification.showError(
          'An unexpected error occurred while attempting to fetch the data',
        );
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddNotification = ({ id }) => {
    mobileNotificationSettings
      .addNotificationSetting({ id, patientSecret })
      .then(() => {
        mobileNotificationSettings
          .fetchLastNotification({ id, patientSecret })
          .catch((err) => {
            console.error(err.message);
            notification.showError(
              'An unexpected error occurred while attempting to fetch the recent notification',
            );
          });
      })
      .catch((err) => {
        console.error(err.message);
        notification.showError(
          'An unexpected error occurred while attempting to add the notififcation',
        );
      });
  };

  const handleSaveSettings = ({ id }) => {
    mobileNotificationSettings
      .synchronizeNotificationSettings({ id, patientSecret })
      .then(() => {
        notification.showSuccess(
          'Notification settings were saved successfully',
        );
        setTimeout(() => {
          notification.hideNotification();
        }, 3500);
      })
      .catch((err) => {
        console.error(err.message);
        notification.showError(
          'An unexpected error occurred while attempting to save the settings',
        );
      });
  };

  return (
    <div className={styles.container}>
      <Scrollbars style={{ height: '100%' }}>
        <img
          src={header}
          alt="header"
          style={{ width: '100%', height: '64px', objectFit: 'cover' }}
        />
        <div className={styles.contentContainer}>
          <span className={styles.screenInfo}>
            {CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0]}{' '}
            - Appointment Notification Settings
          </span>
          <Container maxWidth="md">
            <Grid container justify="center" direction="column">
              <Grid
                container
                item
                xs={12}
                md={12}
                className={styles.patientInfo}
              >
                <Grid
                  item
                  xs={6}
                  md={6}
                  className={matches ? styles.keyCenter : styles.key}
                >
                  Patient
                </Grid>
                <Grid item xs={6} md={6} className={styles.value}>
                  {mobileNotificationSettings.patientInfoLoaded ? (
                    `${mobileNotificationSettings.patientInformation.firstName} ${mobileNotificationSettings.patientInformation.lastName}`
                  ) : (
                    <Skeleton
                      variant="rect"
                      animation="wave"
                      width="20%"
                      height={15}
                    />
                  )}
                </Grid>

                <Grid container className={styles.patientInfo}>
                  <Grid
                    item
                    xs={6}
                    md={6}
                    className={matches ? styles.keyCenter : styles.key}
                  >
                    Email
                  </Grid>
                  <Grid item xs={6} md={6} className={styles.value}>
                    {mobileNotificationSettings.patientInfoLoaded ? (
                      mobileNotificationSettings.patientInformation.email
                    ) : (
                      <Skeleton
                        variant="rect"
                        animation="wave"
                        width="20%"
                        height={15}
                      />
                    )}
                  </Grid>
                </Grid>

                <Grid container className={styles.patientInfo}>
                  <Grid
                    item
                    xs={6}
                    md={6}
                    className={matches ? styles.keyCenter : styles.key}
                  >
                    Phone
                  </Grid>
                  <Grid item xs={6} md={6} className={styles.value}>
                    {mobileNotificationSettings.patientInfoLoaded ? (
                      mobileNotificationSettings.patientInformation.phoneNo !==
                      null ? (
                        <span>
                          {PhoneNumber(
                            mobileNotificationSettings.patientInformation
                              .phoneNo,
                          ).getNumber('national')}
                        </span>
                      ) : (
                        mobileNotificationSettings.patientInformation.phoneNo
                      )
                    ) : (
                      <Skeleton
                        variant="rect"
                        animation="wave"
                        width="20%"
                        height={15}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <span className={styles.appointmentQuestion}>
                How long before your appointment would you like to be reminded?
              </span>
              {mobileNotificationSettings.notificationInfoLoaded ? (
                <button
                  className={styles.addNotification}
                  onClick={() =>
                    handleAddNotification({
                      id: mobileNotificationSettings.patientInformation.id,
                    })
                  }
                >
                  <AddIcon style={{ color: '#F4266E', marginBottom: '5px' }} />
                  <span className={styles.addNotificationText}>
                    Add Notification
                  </span>
                </button>
              ) : (
                <Skeleton
                  style={{ margin: '20px 0px' }}
                  variant="rect"
                  animation="wave"
                  width="20%"
                  height={20}
                />
              )}
              {mobileNotificationSettings.addingNewNotification && (
                <LinearProgress />
              )}
              {mobileNotificationSettings.deletingNotification && (
                <LinearProgress />
              )}
              <Grid container spacing={2}>
                {mobileNotificationSettings.notificationInfoLoaded
                  ? mobileNotificationSettings.notificationSettings.map(
                      (notification) => (
                        <Grid
                          key={notification.id}
                          item
                          xs={12}
                          md={6}
                          className={styles.notificationCard}
                        >
                          <NotificationCard
                            delivery_method={notification.delivery_methods}
                            unit={notification.unit}
                            notificationTime={notification.time}
                            notificationId={notification.id}
                            patientSecret={params.patientSecret}
                          />
                        </Grid>
                      ),
                    )
                  : [...Array(2)].map((ele, index) => (
                      <Grid
                        key={index}
                        item
                        xs={12}
                        md={6}
                        className={styles.notificationCard}
                      >
                        <NotificationSkeleton />
                      </Grid>
                    ))}
              </Grid>
              {mobileNotificationSettings.notificationInfoLoaded ? (
                <Button
                  className="secondary-btn me-auto ms-auto"
                  variant="contained"
                  style={{ width: '176px', marginTop: '40px' }}
                  color="secondary"
                  onClick={() =>
                    handleSaveSettings({
                      id: mobileNotificationSettings.patientInformation.id,
                    })
                  }
                >
                  Save Settings
                </Button>
              ) : (
                <Skeleton
                  className="me-auto ms-auto"
                  style={{ marginTop: '40px' }}
                  variant="rect"
                  animation="wave"
                  width="20%"
                  height={30}
                />
              )}

              <span className={styles.upcomingAppointments}>
                Upcoming Appointments
              </span>
              <Grid container spacing={2}>
                {mobileNotificationSettings.appointmentInfoLoaded ? (
                  mobileNotificationSettings.appointments.length > 0 ? (
                    mobileNotificationSettings.appointments.map(
                      (appointment) =>
                        moment
                          .utc(appointment.start)
                          .tz(
                            mobileNotificationSettings.tenantInformation
                              .timezone,
                          )
                          .format('MM/DD/YYYY') >=
                          moment
                            .utc()
                            .tz(
                              mobileNotificationSettings.tenantInformation
                                .timezone,
                            )
                            .format('MM/DD/YYYY') && (
                          <Grid
                            item
                            xs={12}
                            md={6}
                            className={styles.appointmentCard}
                            key={appointment.id}
                          >
                            <AppointmentCard
                              appointmentData={appointment}
                              timezone={
                                mobileNotificationSettings.tenantInformation
                                  .timezone
                              }
                            />
                          </Grid>
                        ),
                    )
                  ) : (
                    <span className={styles.noAppointments}>
                      There are no upcoming appointments
                    </span>
                  )
                ) : (
                  [...Array(2)].map((ele, index) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      className={styles.appointmentCard}
                      key={index}
                    >
                      <AppointmentSkeleton />
                    </Grid>
                  ))
                )}
              </Grid>
              {mobileNotificationSettings.tenantInfoLoaded ? (
                mobileNotificationSettings.tenantInformation.telnyxNumber !==
                null ? (
                  <span className={styles.footerText}>
                    To make changes to your appointment or profile info, please
                    call our office at{' '}
                    <span className={styles.contactNo}>
                      {PhoneNumber(
                        mobileNotificationSettings.tenantInformation
                          .telnyxNumber,
                      ).getNumber('national')}
                    </span>
                  </span>
                ) : null
              ) : (
                <span className={styles.footerText}>
                  <Skeleton
                    variant="rect"
                    animation="wave"
                    width="50%"
                    height={15}
                  />
                </span>
              )}
            </Grid>
          </Container>
          <Notification />
        </div>

        {!responsiveInfo.isDesktop && (
          <div
            style={{
              height: '20rem',
              visibility: 'hidden',
            }}
          />
        )}
      </Scrollbars>
    </div>
  );
};

export default observer(MobileNotificationSettings);
