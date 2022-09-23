import { CircularProgress } from '@material-ui/core';
import Switch from 'components/Core/Switch';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import styles from './index.module.css';
import { DEFAULT_MISSED_CALL_REPLY } from 'helpers/constants';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { shallowEqual } from 'recompose';
import * as Yup from 'yup';
import TextMessageForm from './TextMessageForm';
import { useParams } from 'react-router-dom';

const Header = ({ settingEnabled, onSettingChange, disabled, loading }) => {
  return (
    <React.Fragment>
      <div className={styles.header}>
        <span className="d-flex align-items-center">
          Missed Call Auto-Reply SMS
          {loading && (
            <CircularProgress className="ms-2" color="secondary" size={14} />
          )}
        </span>
        <Switch
          disabled={disabled}
          name="missedCallSmsEnable"
          checked={settingEnabled}
          onChange={onSettingChange}
        />
      </div>
      <span className={styles.headerSubtitle}>
        When your office misses a call, send an automated SMS
      </span>
    </React.Fragment>
  );
};

const MissedCallAutoReplyNew = () => {
  const { uuid } = useParams();

  const { automationSettings, notification, phoneFaxOptions, authentication } =
    useStores();
  const queryClient = useQueryClient();

  const { data, isLoading: isFetchingSettings } = useQuery(
    ['recordingOptions'],
    () => phoneFaxOptions.fetchRecordingOptions(uuid || ''),
    {
      retry: false,
      cacheTime: 0,
    },
  );

  const { mutateAsync: updateSettings, isLoading: isUpdating } = useMutation(
    ['updateRecordingOptions'],
    (options) => phoneFaxOptions.updateRecordingOptions(options),
    {
      onError: (err) => {
        notification.showError(
          err.message ||
            'An unexpected error occurred while attempting to update the recording options',
        );
      },
      onSuccess: () => {
        authentication.refreshUser();
        notification.showSuccess('Recording options updated successfully!');
        queryClient.invalidateQueries('recordingOptions');
      },
    },
  );

  // const { data } = useQuery(
  //   'getAutomationSettings',
  //   () => automationSettings.getAutomationSettings(),
  //   {
  //     onError: (error) => {
  //       notification.showError(error.message ?? error);
  //     },
  //   },
  // );

  // const { mutateAsync: updateSettings, isLoading: isUpdating } = useMutation(
  //   'updateAutomationSettings',
  //   (config) => automationSettings.updateAutomationSettings(config),
  //   {
  //     onSuccess: () => {
  //       notification.showSuccess('Automation settings updated successfully!');
  //       queryClient.invalidateQueries('getAutomationSettings');
  //     },
  //     onError: (error) => {
  //       notification.showError(error.message ?? error);
  //     },
  //   },
  // );

  const messageText = data?.message;

  const initialValues = {
    missedCallSmsEnable: data?.missed_call_sms_enable ?? false,
    message: messageText?.length ? messageText : DEFAULT_MISSED_CALL_REPLY,
    smsEnabledWhenOfficeClosed: data?.sms_enabled_when_office_closed ?? false,
  };

  const validationSchema = Yup.object({
    message: Yup.string()
      .trim()
      .when('missedCallSmsEnable', {
        is: false,
        then: Yup.string().notRequired(),
        otherwise: Yup.string()
          .max(320, 'Maximum 320 characters are allowed')
          .required('Message is required!'),
      }),
  });

  const handleUpdateSettings = async (options) => {
    const payload = {
      ...options,
      id: data?.id ?? '',
      method: data ? 'PATCH' : 'POST',
      uuid,
    };
    await updateSettings(payload);
  };

  return (
    <div className={styles.container}>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={handleUpdateSettings}
        enableReinitialize
      >
        {({ values, handleChange, isSubmitting }) => {
          const isChanged = !shallowEqual(values, initialValues);
          const isDisabled = isSubmitting || isUpdating || isFetchingSettings;
          return (
            <Form>
              <Header
                loading={isDisabled}
                disabled={isDisabled}
                settingEnabled={values.missedCallSmsEnable}
                onSettingChange={(event) => {
                  handleChange(event);
                }}
              />
              <TextMessageForm
                values={values}
                handleChange={handleChange}
                textInputHidden={!values.missedCallSmsEnable}
                changed={isChanged}
                disabled={isDisabled}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default MissedCallAutoReplyNew;
