import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import LockIcon from '@material-ui/icons/Lock';

const NotificationPermissionHelper = observer(({ onClose }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      size="sm"
      body={
        <div className={styles.root}>
          <span className={styles.header}>Notifications are Blocked</span>
          <div className={styles.infoContainer}>
            <span className={styles.infoTextMain}>
              Kasper needs you to turn on Notifications, so you can receive
              Notifications for new Messages and Calls. To turn on
              Notifications,
            </span>
            <ul>
              <li className={styles.infoText}>
                Click the <LockIcon className={styles.lockIcon} /> icon in your
                address bar.
              </li>
              <li className={styles.infoText}>
                Enable the toggle for Notifications and refresh the page.
              </li>
            </ul>
          </div>
        </div>
      }
      onClose={handleClose}
    />
  );
});

export default NotificationPermissionHelper;
