import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
} from '@material-ui/core';
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
          name="enabled"
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

const MissedCallAutoReply = () => {
  const { automationSettings, notification } = useStores();
  const queryClient = useQueryClient();

  const { data, isLoading: isFetchingSettings } = useQuery(
    'getAutomationSettings',
    () => automationSettings.getAutomationSettings(),
    {
      onError: (error) => {
        notification.showError(error.message ?? error);
      },
    },
  );

  const { mutateAsync: updateSettings, isLoading: isUpdating } = useMutation(
    'updateAutomationSettings',
    (config) => automationSettings.updateAutomationSettings(config),
    {
      onSuccess: () => {
        notification.showSuccess('Automation settings updated successfully!');
        queryClient.invalidateQueries('getAutomationSettings');
      },
      onError: (error) => {
        notification.showError(error.message ?? error);
      },
    },
  );

  const messageText = data?.message;

  const initialValues = {
    enabled: data?.enabled ?? false,
    message: messageText?.length ? messageText : DEFAULT_MISSED_CALL_REPLY,
    enabledWhenOfficeClosed: data?.enabledWhenOfficeClosed ?? false,
  };

  const validationSchema = Yup.object({
    message: Yup.string()
      .trim()
      .when('enabled', {
        is: false,
        then: Yup.string().notRequired(),
        otherwise: Yup.string()
          .max(320, 'Maximum 320 characters are allowed')
          .required('Message is required!'),
      }),
  });

  return (
    <div className={styles.container}>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={updateSettings}
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
                settingEnabled={values.enabled}
                onSettingChange={(event) => {
                  handleChange(event);
                }}
              />
              <TextMessageForm
                values={values}
                handleChange={handleChange}
                textInputHidden={!values.enabled}
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

export default MissedCallAutoReply;
