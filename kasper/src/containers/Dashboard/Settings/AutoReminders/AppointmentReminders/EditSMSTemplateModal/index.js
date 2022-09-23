import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Tabs from 'components/Core/Tabs';
import SMSTemplate from '../Forms/SMSTemplate';
import { useStores } from 'hooks/useStores';
import { useQueryClient, useMutation } from 'react-query';

const tagsForIndividual = [
  { id: 'first_name', display: 'First Name', sampleValue: 'John' },
  { id: 'preferred_name', display: 'Preferred Name', sampleValue: 'Johnny' },
  {
    id: 'practice_phone',
    display: 'Practice Phone',
    sampleValue: '888-777-6666',
  },
  { id: 'date', display: 'Date', sampleValue: '5/7' },
  { id: 'time', display: 'Time', sampleValue: '1:30pm' },
];

const tagsForFamily = [
  {
    id: 'first_names',
    display: 'Names',
    sampleValue: 'John, Jessica, and Lewis',
  },
  {
    id: 'practice_phone',
    display: 'Practice Phone',
    sampleValue: '888-777-6666',
  },
  { id: 'date', display: 'Date', sampleValue: '5/7' },
  { id: 'times', display: 'Times', sampleValue: '10:30am, 11:00am and 2:00pm' },
];

export default function EditSMSTemplateModal({ onClose }) {
  const { reminders, notification } = useStores();
  const queryClient = useQueryClient();

  // Get cached data from react-query
  const {
    kasper_reminder_same_day_sms_individual: smsTemplateForIndividual = '',
    kasper_reminder_same_day_sms_family: smsTemplateForFamily = '',
  } = queryClient.getQueryData(['officeConfigs', 'sameDayReminders']);

  // Mutate office configs
  const updateOfficeConfigs = useMutation(
    (configObj) => reminders.updateOfficeConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'sameDayReminders'],
          (oldData) => ({
            ...oldData,
            ...variables,
          }),
        );
        notification.showSuccess('SMS Template Updated Successfully!');
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Handle submit event
  const handleSubmit = async ({ message }, type) => {
    if (type === 'individual') {
      await updateOfficeConfigs.mutateAsync({
        kasper_reminder_same_day_sms_individual: message,
      });
    } else {
      await updateOfficeConfigs.mutateAsync({
        kasper_reminder_same_day_sms_family: message,
      });
    }
  };

  // Tab view config
  const tabs = [
    {
      index: 0,
      label: 'Individual',
      body: (
        <SMSTemplate
          message={smsTemplateForIndividual}
          tags={tagsForIndividual}
          onSubmit={(data) => handleSubmit(data, 'individual')}
          onClose={onClose}
        />
      ),
    },
    {
      index: 1,
      label: 'Family',
      body: (
        <SMSTemplate
          message={smsTemplateForFamily}
          tags={tagsForFamily}
          onSubmit={(data) => handleSubmit(data, 'family')}
          onClose={onClose}
        />
      ),
    },
  ];

  return (
    <Modal
      size="sm"
      header="Edit Same Day SMS"
      body={
        <div>
          <div className={styles.tabBar} />
          <Tabs config={tabs} defaultTabIndex={tabs[0].index} />
        </div>
      }
      onClose={onClose}
    />
  );
}
