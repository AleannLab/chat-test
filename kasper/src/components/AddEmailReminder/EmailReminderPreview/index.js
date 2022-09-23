import Button from '@material-ui/core/Button';
import { ReactComponent as BellIcon } from 'assets/images/no-reminders-bell.svg';
import Modal from 'components/Core/Modal';
import React, { useState } from 'react';
import styles from './index.module.css';

const EmailReminderPreview = ({
  handleBack,
  onClose,
  submitNewEmailReminder,
  submitEditedEmailReminder,
  emailReminderData,
  isEditing,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = [
    { id: '{First Name}', value: 'John' },
    { id: '{Last Name}', value: 'Doe' },
    { id: '{Preferred Name}', value: 'JD' },
    { id: '{Practice Phone}', value: '+987654320' },
    { id: '{Date & Time}', value: '10/10/2022 & 10:30AM' },
    { id: '{Month}', value: 'April' },
    { id: '{Day}', value: 'Monday' },
    { id: '{Day of Month}', value: '9' },
    { id: '{Time}', value: '11.50PM' },
  ];

  const formatCustomMessage = (values) => {
    let tempstring = values.customMessage;
    defaultValues.forEach((d) => {
      if (tempstring.includes(d.id)) {
        tempstring = tempstring.replaceAll(d.id, d.value);
      }
    });

    return tempstring;
  };

  const handleSave = () => {
    setIsSubmitting(true);
    const {
      reminderName,
      dueDate,
      durationType,
      period,
      modifiedCustomMessage,
      customMessage,
    } = emailReminderData;
    if (isEditing) {
      submitEditedEmailReminder(
        reminderName,
        dueDate,
        durationType,
        period,
        customMessage,
        modifiedCustomMessage,
        emailReminderData.id,
      );
    } else {
      submitNewEmailReminder(
        reminderName,
        dueDate,
        durationType,
        period,
        customMessage,
        modifiedCustomMessage,
        null,
      );
    }
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
              <span className={styles.message}>
                {formatCustomMessage(emailReminderData)}
              </span>
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
          <div className={styles.footer}>
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>

            <Button
              onClick={handleSave}
              className="secondary-btn"
              variant="contained"
              color="secondary"
              disabled={isSubmitting}
            >
              Save
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
    />
  );
};

export default EmailReminderPreview;
