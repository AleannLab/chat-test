import React from 'react';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import TodayIcon from '@material-ui/icons/Today';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WorkIcon from '@material-ui/icons/Work';
import Button from '@material-ui/core/Button';
import moment from 'moment-timezone';

import { useStores } from 'hooks/useStores';
import { ReactComponent as BackIcon } from 'assets/images/back-arrow.svg';
import { ReactComponent as DoctorIcon } from '../../../assets/doctor.svg';
import styles from './index.module.css';

const ScheduleInformation = () => {
  const { onlineSchedule } = useStores();

  return (
    <div className={styles.container}>
      <Button
        disabled={onlineSchedule.formStatus.isSubmitting}
        onClick={() => onlineSchedule.setScheduleNow(false)}
        className="mt-4"
      >
        <BackIcon /> <span className={styles.backText}>Back</span>
      </Button>
      <div className={styles.scheduleInformationContainer}>
        <div className={styles.scheduleInformationDoctor}>
          <DoctorIcon />
          <span className={styles.text}>
            {onlineSchedule.practitionerData.selectedPractitioner.name}
          </span>
        </div>
        <div className={styles.scheduleInformation}>
          <TodayIcon style={{ color: '#999999' }} />
          <span className={styles.text}>
            {moment
              .utc(onlineSchedule.dateTime.time)
              .tz(onlineSchedule.officeInformation.timezone)
              .format('LT')}{' '}
            <span className={styles.offset}>
              (GMT
              {moment
                .utc()
                .tz(onlineSchedule.officeInformation.timezone)
                .format('Z')}
              )
            </span>
          </span>
        </div>
        <div className={styles.scheduleInformation}>
          <WorkIcon style={{ color: '#999999' }} />
          <span className={styles.text}>
            {onlineSchedule.appointmentConfig.selectedAppointment.label}
          </span>
        </div>
        <div className={styles.scheduleInformation}>
          <AccessTimeIcon style={{ color: '#999999' }} />
          <span className={styles.text}>
            {moment(onlineSchedule.dateTime.date).format('dddd, MMMM Do YYYY')}
          </span>
        </div>
        <div className={styles.scheduleInformation}>
          <LocationOnIcon style={{ color: '#999999' }} />
          <span className={styles.text}>
            {onlineSchedule.officeInformation.address}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInformation;
