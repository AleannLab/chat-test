import React, { useEffect, useState } from 'react';
import { CALL_ROUTING_RULES } from 'helpers/constants';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Form, Formik } from 'formik';
import SelectField from 'components/Core/Formik/SelectField';
import { Button, Grid, MenuItem } from '@material-ui/core';
import { observer } from 'mobx-react';
import InternalRouting from '../TwentyFourSevenSchedule/InternalRouting';
import PlayGreeting from '../TwentyFourSevenSchedule/PlayGreeting';
import ForwardToPhoneNumber from '../TwentyFourSevenSchedule/ForwardToPhoneNumber';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useQuery, useQueryClient } from 'react-query';

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

const FallbackActionForm = observer(() => {
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );
  const [initialValues, setInitialValues] = useState(initialState);
  const history = useHistory();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const { incomingCalls, notification } = useStores();

  useEffect(() => {
    if (state?.fallbackAction) {
      console.log(
        '🚀 ~ file: FallBackActionForm.js ~ line 37 ~ useEffect ~ state?.fallbackAction',
        state?.fallbackAction,
      );
      setInitialValues((prevState) => ({
        ...prevState,
        ...state?.fallbackAction,
        rule: state?.fallbackAction?.rule ?? '',
        value: state?.fallbackAction?.value ?? '',
        saved_number: state?.fallbackAction?.value ?? '',
        action: state?.fallbackAction?.action ?? '',
        timeout_sec: state?.fallbackAction?.timeout_sec ?? 30,
        internalFailoverAction: state.fallbackAction?.failover?.action ?? '',
        failoverGreetingAction:
          state.fallbackAction?.failover?.action === 'forward_to_greeting'
            ? state.fallbackAction?.failover?.greeting_type_id
            : '',
        failoverGreetingValue:
          state.fallbackAction?.failover?.action === 'forward_to_greeting'
            ? state.fallbackAction?.failover?.value
            : '',
        internalFailoverValue:
          state.fallbackAction?.failover?.action !== 'forward_to_greeting'
            ? state.fallbackAction?.failover?.value
            : '',
      }));
    }
  }, [state?.fallbackAction]);

  const handleClose = (payload) => {
    history.push(match.url, {
      fallbackAction: payload,
      rotatingSchedule: state.rotatingSchedule,
    });
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

  const { data: agents } = useQuery(
    'usersAlongWithIncomingCalls',
    () => incomingCalls.getUsers(),
    {
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

  const handleGreetingPayload = async (values) => {
    const { action, greeting_type_id, rule, value } = values;

    const fallbackAction = {
      action,
      rule,
      value,
      greeting_type_id,
    };
    setInitialValues(fallbackAction);
    handleClose(fallbackAction);
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
      const fallbackAction = {
        action,
        rule,
        value,
        actionValue: {
          id: getActionValue(action, value),
        },
      };
      setInitialValues(fallbackAction);
      handleClose(fallbackAction);
    } else if (action === 'forward_to_exten') {
      const fallbackAction = {
        action,
        rule,
        value,
        actionValue: {
          user_exten: getActionValue(action, value),
        },
      };
      setInitialValues(fallbackAction);
      handleClose(fallbackAction);
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
            user_exten: getActionValue(action, value),
          },
        };
      } else {
        failover = {
          action: internalFailoverAction,
          value: internalFailoverValue,
          actionValue: {
            id: getActionValue(action, value),
          },
        };
      }
      const fallbackAction = {
        action,
        rule,
        value,
        timeout_sec,
        failover,
        actionValue: {
          id: getActionValue(action, value),
        },
      };
      setInitialValues(fallbackAction);
      handleClose(fallbackAction);
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

    const fallbackAction = {
      action,
      rule,
      value: phoneNumber,
      timeout_sec,
      caller_id,
      failover,
    };
    setInitialValues(fallbackAction);
    handleClose(fallbackAction);
  };

  const handleSubmitForm = async (values) => {
    switch (values.rule) {
      case 'GREETING':
        return handleGreetingPayload(values);
      case 'EXTERNAL':
        return handleExternalPayload(values);
      case 'INTERNAL':
        return handleInternalPayload(values);
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <span
        style={{
          fontWeight: 400,
          fontSize: 14,
          fontFamily: 'Montserrat',
          marginTop: '.5em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        This action will take place for any undefined time slots.
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
                  color="primary"
                  onClick={() => history.push(match.url)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  style={{ width: 'auto' }}
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
});

export default FallbackActionForm;
