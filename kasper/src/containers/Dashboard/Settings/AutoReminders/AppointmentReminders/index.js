import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import AppointmentRemindersAccordion from './AppointmentRemindersAccordion';
import ReminderTable from './ReminderTable';

export default function AppointmentReminders() {
  return (
    <>
      <Grid className={styles.root}>
        <div className={styles.header}>
          <div className={styles.titlesContainer}>
            <span className={styles.title}>
              Appointment Reminders & Confirmations
            </span>
            <span className={styles.subtitle}>
              Kasper sends 3 different appointment messages:
              <section style={{ marginTop: '5px', marginBottom: '5px' }}>
                <b>General reminders</b> are customized below and sent at the
                same time every day based on your global settings.
              </section>
              <section style={{ marginTop: '5px', marginBottom: '5px' }}>
                <b>Same day reminders</b> are sent a certain number of hours
                before the appointment.
              </section>
              <section style={{ marginTop: '5px', marginBottom: '5px' }}>
                <b>New/updated appointment</b> messages are triggered by
                appointment changes in Open Dental.
              </section>
            </span>
          </div>
        </div>

        <AppointmentRemindersAccordion />
        <ReminderTable className="flex-grow-1" />
      </Grid>
    </>
  );
}
