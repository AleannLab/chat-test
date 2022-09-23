import React from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import PatientProviderInfo from './CustomComponents/PatientProviderInfo';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Skeleton from '@material-ui/lab/Skeleton';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import AppointmentForm from './CustomComponents/AppointmentForm';
import CustomCalendar from './CustomComponents/Calendar';
import AppointmentBooked from './CustomComponents/AppointmentBooked';
import Notification from 'components/Notification';
import styles from './index.module.css';
import TimeExpired from './CustomComponents/TimeExpired';
import useResponsive from 'hooks/useResponsive';
import AppBrandHeader from 'components/AppBrandHeader';
import { convertHexToRGBA } from 'helpers/misc';

const OnlineScheduling = observer(() => {
  const { onlineSchedule } = useStores();
  const responsiveInfo = useResponsive();

  return (
    <div className={styles.container}>
      <div style={{ height: '100%' }}>
        <AppBrandHeader />
        <div className={styles.contentContainer}>
          {(!onlineSchedule.timeExpired &&
            onlineSchedule.formStatus.isSubmitted) ||
          (onlineSchedule.timeExpired &&
            !onlineSchedule.formStatus.isSubmitted) ? null : (
            <Container
              maxWidth="lg"
              className="d-flex justify-content-between mb-4"
            >
              <Grid container>
                <Grid item xs={12} md={8} className={styles.titlesContainer}>
                  <span className={styles.title}>Schedule an Appointment</span>
                  <span className={styles.subtitle}>
                    Complete the form below to schedule your dental appointment.
                  </span>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                  className={styles.officeInfoContainer}
                  style={{
                    backgroundColor: convertHexToRGBA(
                      onlineSchedule.officeInformation.brandColor,
                      12,
                    ),
                  }}
                >
                  <LocationOnIcon
                    style={{
                      color: onlineSchedule.officeInformation.brandColor,
                      marginRight: '1.2rem',
                      fontSize: '2rem',
                    }}
                  />
                  <div
                    className={`d-flex flex-column 
                      ${
                        onlineSchedule.officeInformation.brandColor
                          ? {
                              backgroundColor: convertHexToRGBA(
                                onlineSchedule.officeInformation.brandColor,
                                12,
                              ),
                              color:
                                onlineSchedule.officeInformation.brandColor,
                              borderColor:
                                onlineSchedule.officeInformation.brandColor,
                            }
                          : styles.officeInfoTextContainer
                      }`}
                  >
                    <span className={styles.officeName}>
                      {onlineSchedule.officeInformation.name.length === 0 ? (
                        <Skeleton variant="text" height={17} width={100} />
                      ) : (
                        onlineSchedule.officeInformation.name
                      )}
                    </span>
                    <span className={styles.officeAddress}>
                      {onlineSchedule.officeInformation.address.length === 0 ? (
                        <Skeleton variant="text" height={17} width={100} />
                      ) : (
                        onlineSchedule.officeInformation.address
                      )}
                    </span>
                  </div>
                </Grid>
              </Grid>
            </Container>
          )}
          <Container maxWidth="lg">
            {onlineSchedule.timeExpired ? (
              <Grid container justify="center">
                <TimeExpired />
              </Grid>
            ) : onlineSchedule.formStatus.isSubmitted ? (
              <AppointmentBooked />
            ) : onlineSchedule.scheduleNow ? (
              <AppointmentForm />
            ) : null}
            <Paper className={styles.schedulePaper}>
              <Grid
                container
                className={
                  onlineSchedule.scheduleNow ||
                  onlineSchedule.timeExpired ||
                  onlineSchedule.formStatus.isSubmitted
                    ? 'd-none'
                    : styles.appointmentContainer
                }
              >
                <Grid
                  item
                  xs={12}
                  md={6}
                  className="d-flex justify-content-between"
                  style={{ border: '0.2px solid #f0f3f8' }}
                >
                  <PatientProviderInfo />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  style={{ border: '0.2px solid #f0f3f8' }}
                >
                  <CustomCalendar />
                </Grid>
              </Grid>
            </Paper>
          </Container>
          <Notification />
        </div>

        {/* Extra space required for small devices like mobile and tablet. Specifically needed for iOS devices to resolve scrolling issue. */}
        {!responsiveInfo.isDesktop && (
          <div
            style={{
              height: '20rem',
              visibility: 'hidden',
            }}
          />
        )}
      </div>
    </div>
  );
});

export default OnlineScheduling;
