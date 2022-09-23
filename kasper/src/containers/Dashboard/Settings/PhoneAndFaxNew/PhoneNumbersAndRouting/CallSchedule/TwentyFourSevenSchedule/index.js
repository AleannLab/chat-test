import React, { useEffect, useState } from 'react';
import { CALL_ROUTING_RULES } from 'helpers/constants';
import { useLocation } from 'react-router-dom';
import InternalRouting from './InternalRouting';
import PlayGreeting from './PlayGreeting';
import ForwardToPhoneNumber from './ForwardToPhoneNumber';
import { Form, Formik } from 'formik';
import SelectField from 'components/Core/Formik/SelectField';
import { Button, Grid, MenuItem } from '@material-ui/core';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import { useParams } from 'react-router-dom';

const initialState = {
  rule: CALL_ROUTING_RULES[0].value,
  action: '',
  value: '',
  greeting_type_id: '',
  caller_id: '',
  timeout_sec: 0,
  saved_number: '',
  failoverGreetingAction: '',
  failoverGreetingValue: '',
  internalFailoverValue: '',
  internalFailoverAction: '',
};

const TwentyFourSevenSchedule = ({ handleClose, scheduleData }) => {
  const [initialValues, setInitialValues] = useState(initialState);
  const { incomingCalls, notification } = useStores();
  const { state } = useLocation();
  const numberUuid = state?.uuid ?? null;
  const queryClient = useQueryClient();
  const { numberId } = useParams();

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      setInitialValues((prevState) => ({
        ...prevState,
        rule: scheduleData?.[0]?.default?.rule ?? '',
        action: scheduleData?.[0]?.default?.action ?? '',
        value: scheduleData?.[0]?.default?.value ?? '',
        greeting_type_id: scheduleData?.[0]?.default?.greeting_type_id ?? '',
        caller_id: scheduleData?.[0]?.default?.caller_id ?? '',
        timeout_sec: scheduleData?.[0]?.default?.timeout_sec ?? 30,
        saved_number: scheduleData?.[0]?.default?.value ?? '',
        internalFailoverAction: scheduleData[0].default?.failover?.action ?? '',

        failoverGreetingAction:
          scheduleData[0].default?.failover?.action === 'forward_to_greeting'
            ? scheduleData[0].default?.failover?.greeting_type_id
            : '',
        failoverGreetingValue:
          scheduleData[0].default?.failover?.action === 'forward_to_greeting'
            ? scheduleData[0].default?.failover?.value
            : '',
        internalFailoverValue:
          scheduleData[0].default?.failover?.action !== 'forward_to_greeting'
            ? scheduleData[0].default?.failover?.value
            : '',
      }));
    }
  }, [scheduleData]);

  const { mutateAsync: addSchedule, isLoading: isAddingSchedule } = useMutation(
    'addSchedule',
    (payload) => incomingCalls.addSchedule(payload),
    {
      onSuccess: () => {
        notification.showSuccess('Schedule settings updated successfully!');
        handleClose();
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the schedule',
        ),
      retry: false,
    },
  );

  const { mutateAsync: updateSchedule, isLoading: isUpdatingSchedule } =
    useMutation(
      'updateSchedule',
      (payload) => incomingCalls.updateSchedule(payload),
      {
        onSuccess: () => {
          notification.showSuccess('Schedule settings updated successfully!');
          handleClose();
        },
        onError: () =>
          notification.showError(
            'An unexpected error occurred while attempting to update the schedule',
          ),
        retry: false,
      },
    );

  const cachedIvrList = queryClient.getQueryData('getIvrList');

  const { data: ivrList } = useQuery(
    'getIvrList',
    () => incomingCalls.getIvrList(),
    {
      enabled: !cachedIvrList,
      initialData: cachedIvrList,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const groupsData = queryClient.getQueryData('usersAlongGetGroups');

  const { data: groups } = useQuery(
    'usersAlongGetGroups',
    () => incomingCalls.getGroups(),
    {
      enabled: !groupsData,
      initialData: groupsData,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const agents = queryClient.getQueryData('usersAlongWithIncomingCalls');

  const { data: agentsData } = useQuery(
    'usersAlongWithIncomingCalls',
    () => incomingCalls.getUsers(),
    {
      enabled: !agents,
      initialData: agents,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const getActionValue = (action, value) => {
    switch (action) {
      case 'forward_to_group':
        return groupsData?.find((group) => group.uuid === value)?.id || null;
      case 'forward_to_exten':
        return agents?.find((agent) => agent.id === value)?.user_exten || null;
      case 'forward_to_ivr':
        return ivrList?.find((ivr) => ivr.uuid === value)?.id || null;
      default:
        return null;
    }
  };

  const handleFormsRendering = (rule, props) => {
    switch (rule) {
      case 'INTERNAL':
        return <InternalRouting {...props} />;
      case 'GREETING':
        return <PlayGreeting {...props} />;
      case 'EXTERNAL':
        return <ForwardToPhoneNumber {...props} />;
      default:
        return null;
    }
  };

  const handleGreetingPayload = async (values) => {
    const { action, greeting_type_id, rule, value } = values;

    let payload = {
      defaultValue: {
        action,
        rule,
        value,
        greeting_type_id,
      },
      numberUuid: numberUuid,
      scheduleType: '24_7',
      rotatingSchedule: null,
      fallbackAction: null,
      activeSchedule: null,
      number: numberId,
    };

    if (scheduleData?.length > 0) {
      payload.id = scheduleData?.[0]?.id;
      await updateSchedule(payload);
    } else {
      await addSchedule(payload);
    }
  };

  const handleInternalPayload = async (values) => {
    const {
      action,
      timeout_sec,
      rule,
      value,
      internalFailoverAction,
      internalFailoverValue,
      failoverGreetingAction,
      failoverGreetingValue,
    } = values;

    if (action === 'forward_to_ivr') {
      let payload = {
        defaultValue: {
          action,
          rule,
          value,
          actionValue: {
            id: getActionValue(action, value),
          },
          failover:
            ivrList?.find((ivr) => ivr.uuid === value)?.general_failover ||
            null,
        },
        numberUuid: numberUuid,
        scheduleType: '24_7',
        rotatingSchedule: null,
        fallbackAction: null,
        activeSchedule: null,
        number: numberId,
      };

      if (scheduleData?.length > 0) {
        payload.id = scheduleData?.[0]?.id;
        await updateSchedule(payload);
      } else {
        await addSchedule(payload);
      }
    } else if (action === 'forward_to_exten') {
      let failover = {};
      if (internalFailoverAction === 'forward_to_greeting') {
        failover = {
          action: 'forward_to_greeting',
          value: failoverGreetingValue,
          greeting_type_id: failoverGreetingAction,
        };
      } else if (internalFailoverAction === 'forward_to_exten') {
        failover = {
          action: internalFailoverAction,
          value: internalFailoverValue,
          actionValue: {
            user_exten: getActionValue(
              internalFailoverAction,
              internalFailoverValue,
            ),
          },
        };
      } else {
        failover = {
          action: internalFailoverAction,
          value: internalFailoverValue,
          actionValue: {
            id: getActionValue(internalFailoverAction, internalFailoverValue),
          },
        };
      }

      let payload = {
        defaultValue: {
          action,
          rule,
          value,
          failover,
          actionValue: {
            user_exten: getActionValue(action, value),
          },
        },
        numberUuid: numberUuid,
        scheduleType: '24_7',
        rotatingSchedule: null,
        fallbackAction: null,
        activeSchedule: null,
        number: numberId,
      };

      if (scheduleData?.length > 0) {
        payload.id = scheduleData?.[0]?.id;
        await updateSchedule(payload);
      } else {
        await addSchedule(payload);
      }
    } else {
      let failover = {};
      if (internalFailoverAction === 'forward_to_greeting') {
        failover = {
          action: 'forward_to_greeting',
          value: failoverGreetingValue,
          greeting_type_id: failoverGreetingAction,
        };
      } else if (internalFailoverAction === 'forward_to_exten') {
        failover = {
          action: internalFailoverAction,
          value: internalFailoverValue,
          actionValue: {
            user_exten: getActionValue(
              internalFailoverAction,
              internalFailoverValue,
            ),
          },
        };
      } else {
        failover = {
          action: internalFailoverAction,
          value: internalFailoverValue,
          actionValue: {
            id: getActionValue(internalFailoverAction, internalFailoverValue),
          },
        };
      }

      let payload = {
        defaultValue: {
          action,
          rule,
          value,
          timeout_sec,
          failover,
          actionValue: {
            id: getActionValue(action, value),
          },
        },
        numberUuid: numberUuid,
        scheduleType: '24_7',
        rotatingSchedule: null,
        fallbackAction: null,
        activeSchedule: null,
        number: numberId,
      };

      if (scheduleData?.length > 0) {
        payload.id = scheduleData?.[0]?.id;
        await updateSchedule(payload);
      } else {
        await addSchedule(payload);
      }
    }
  };

  const handleExternalPayload = async (values) => {
    const {
      action,
      saved_number,
      rule,
      value,
      timeout_sec,
      caller_id,
      internalFailoverAction,
      failoverGreetingAction,
      failoverGreetingValue,
      internalFailoverValue,
    } = values;

    const phoneNumber =
      saved_number === 'other' ? `+1${value.replace(/\D/g, '')}` : saved_number;

    let failover = {};
    if (internalFailoverAction === 'forward_to_greeting') {
      failover = {
        action: internalFailoverAction,
        value: failoverGreetingValue,
        greeting_type_id: failoverGreetingAction,
      };
    } else if (internalFailoverAction === 'forward_to_exten') {
      failover = {
        action: internalFailoverAction,
        value: internalFailoverValue,
        actionValue: {
          user_exten: getActionValue(
            internalFailoverAction,
            internalFailoverValue,
          ),
        },
      };
    } else {
      failover = {
        action: internalFailoverAction,
        value: internalFailoverValue,
      };
    }

    const payload = {
      defaultValue: {
        action,
        rule,
        value: phoneNumber,
        timeout_sec,
        caller_id,
        failover,
      },
      numberUuid: numberUuid,
      scheduleType: '24_7',
      rotatingSchedule: null,
      fallbackAction: null,
      activeSchedule: null,
      number: numberId,
    };

    if (scheduleData?.length > 0) {
      payload.id = scheduleData?.[0]?.id;
      await updateSchedule(payload);
    } else {
      await addSchedule(payload);
    }
  };

  const handleSubmitForm = async (values) => {
    switch (values.rule) {
      case 'GREETING':
        return await handleGreetingPayload(values);
      case 'EXTERNAL':
        return await handleExternalPayload(values);
      case 'INTERNAL':
        return await handleInternalPayload(values);
      default:
        return null;
    }
  };

  const isSaving = isAddingSchedule || isUpdatingSchedule;

  return (
    <div className={styles.container}>
      <span className={styles.sectionHeader}>
        Calls will always route according to the rule set below
      </span>

      <div className="d-flex flex-column justify-content-center">
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={(values) => handleSubmitForm(values)}
        >
          {(props) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SelectField
                    onChange={(e) => {
                      props.setFieldValue('rule', e.target.value);
                      props.setFieldValue('action', '');
                    }}
                    mt={1}
                    align="left"
                    options={CALL_ROUTING_RULES.map(
                      ({ value, label, color }) => (
                        <MenuItem key={value} value={value}>
                          <span
                            style={{ gap: 5 }}
                            className="d-flex align-items-center"
                          >
                            <div
                              style={{
                                height: 10,
                                width: 10,
                                background: color,
                                borderRadius: '100%',
                              }}
                            />
                            <span>{label}</span>
                          </span>
                        </MenuItem>
                      ),
                    )}
                    fieldName="rule"
                    fieldLabel="INBOUND CALL RULE"
                  />
                </Grid>
              </Grid>
              {handleFormsRendering(props.values.rule, {
                ...props,
              })}
              <div className="d-flex justify-content-between mt-4">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  disabled={isSaving}
                  color="primary"
                  onClick={handleClose}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  disabled={isSaving}
                  color="secondary"
                  style={{ width: 'auto' }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TwentyFourSevenSchedule;
