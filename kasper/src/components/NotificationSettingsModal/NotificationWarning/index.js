import React, { useState } from 'react';
import styles from '../index.module.css';
import Alert from '@material-ui/lab/Alert';
import { Link } from 'react-router-dom';
import NotificationTroubleShootModal from 'components/NotificationSettings/NotificationTroubleShootModal';

const NotificationWarning = () => {
  const [OpenNotificationTroubleShoot, SetOpenNotificationTroubleShoot] =
    useState(false);

  const askNotificationPermision = () => {
    if (
      Notification.permission !== 'granted' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          window.location.reload();
        }
      });
    } else {
      SetOpenNotificationTroubleShoot(true);
    }
  };
  return (
    <>
      <div className={styles.alertStrip}>
        <Alert
          variant="filled"
          severity="error"
          className={styles.notification_error}
        >
          Notifications not showing up? Click{' '}
          <span>
            <Link
              to="#"
              className={styles.link}
              onClick={askNotificationPermision}
            >
              <u> here</u>
            </Link>
          </span>{' '}
          to troubleshoot.
        </Alert>
      </div>
      {OpenNotificationTroubleShoot && (
        <NotificationTroubleShootModal
          onClose={() => {
            SetOpenNotificationTroubleShoot(false);
          }}
        />
      )}
    </>
  );
};

export default NotificationWarning;
