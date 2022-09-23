import React from 'react';
import Modal from 'components/Core/Modal';
import notificationImage from 'assets/images/browser-notification.png';
import focusAssistImage from 'assets/images/focus-assist.png';
import styles from './index.module.css';
import Button from '@material-ui/core/Button';

const NotificationTroubleShootModal = ({ onClose }) => {
  const handleClose = () => {
    onClose();
  };

  const notificationSettingData = [
    {
      id: 0,
      text: '1. Ensure that browser notifications are enabled.',
      image: notificationImage,
    },
    {
      id: 1,
      text: '2. Confirm that Windows Focus Assist/Mac OS Do Not Disturb are turned off.',
      image: focusAssistImage,
    },
  ];

  return (
    <Modal
      size="sm"
      header={'Troubleshoot Notifications'}
      enableMargin={false}
      body={
        <div
          className={`${styles.bodyMargin} d-flex flex-column justify-content-center`}
        >
          <div className={styles.subTitleText}>
            Please ensure the following prerequisites are met before testing
            notifications:
          </div>
          {notificationSettingData.map((item, index) => (
            <div key={index} className={styles.marginBottom}>
              <div className={styles.bodyText}>{item.text}</div>
              <div className="text-center">
                <img
                  src={item.image}
                  className={
                    item.id === 0 ? styles.firstImage : styles.secondImage
                  }
                />
              </div>
            </div>
          ))}
        </div>
      }
      footer={
        <div
          className={`${styles.dismiss} d-flex w-100 justify-content-center dismiss`}
        >
          <Button
            className="primary-btn"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Dismiss
          </Button>
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default NotificationTroubleShootModal;
