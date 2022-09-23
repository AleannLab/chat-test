import Button from '@material-ui/core/Button';
import { ReactComponent as BellIcon } from 'assets/images/no-reminders-bell.svg';
import Modal from 'components/Core/Modal';
import React, { useState } from 'react';
import styles from './index.module.css';

const EmailReminderPreview = ({ onClose, emailReminderData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = [
    { id: '{{firstName}}', value: 'John' },
    { id: '{{lastName}}', value: 'Doe' },
    { id: '{{preferredName}}', value: 'JD' },
    { id: '{{practicePhone}}', value: '888-777-6666' },
    { id: '{{dueDates}}', value: '10/10/2022 & 10:30AM' },
    { id: '{{firstNames}}', value: 'John' },
    { id: '{{preferredNames}}', value: 'John, Jessica, and Lewis' },
    {
      id: '{{onlineSchedulingLink}}',
      value: `${window.location.host}/schedule-appointment`,
    },
    { id: '{{dateTime}}', value: '10/10/2022 & 10:30AM' },
    { id: '{{month}}', value: 'April' },
    { id: '{{day}}', value: 'Monday' },
    { id: '{{dayOfMonth}}', value: '9' },
    { id: '{{time}}', value: '10:30am' },
  ];

  const formatCustomMessage = (values) => {
    let tempstring = values;
    defaultValues.forEach((d) => {
      if (tempstring.includes(d.id)) {
        tempstring = tempstring.replaceAll(d.id, d.value);
      }
    });

    return tempstring;
  };

  return (
    <Modal
      size="sm"
      header="Preview"
      body={
        <div className={styles.container}>
          <div className={styles.preview}>
            <div className={styles.content}>
              <BellIcon />
              <span className={styles.username}>Hi, John!</span>
              <span className={styles.message}>{emailReminderData}</span>
              <div>
                <Button
                  className="secondary-btn me-2"
                  variant="outlined"
                  color="secondary"
                  disabled={isSubmitting}
                >
                  Call Us
                </Button>
                <Button
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  disabled={isSubmitting}
                >
                  Schedule Online
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
      onClose={onClose}
    />
  );
};

export default EmailReminderPreview;
