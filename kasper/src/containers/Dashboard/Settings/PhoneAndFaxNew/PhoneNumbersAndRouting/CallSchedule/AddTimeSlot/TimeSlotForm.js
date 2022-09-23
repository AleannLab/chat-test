import React, { useEffect, useState } from 'react';
import { CALL_ROUTING_RULES } from 'helpers/constants';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Form, Formik } from 'formik';
import SelectField from 'components/Core/Formik/SelectField';
import Checkbox from 'components/Core/Checkbox';
import { Button, Grid, MenuItem } from '@material-ui/core';
import TimePickerField from 'components/Core/Formik/TimePickerField';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useStores } from 'hooks/useStores';
import moment from 'moment-timezone';
import styles from './index.module.css';
import InternalRouting from '../TwentyFourSevenSchedule/InternalRouting';
import PlayGreeting from '../TwentyFourSevenSchedule/PlayGreeting';
import ForwardToPhoneNumber from '../TwentyFourSevenSchedule/ForwardToPhoneNumber';

const DAYS = [
  { id: 1, value: 'monday', label: 'Monday' },
  { id: 2, value: 'tuesday', label: 'Tuesday' },
  { id: 3, value: 'wednesday', label: 'Wednesday' },
  { id: 4, value: 'thursday', label: 'Thursday' },
  { id: 5, value: 'friday', label: 'Friday' },
  { id: 6, value: 'saturday', label: 'Saturday' },
  { id: 7, value: 'sunday', label: 'Sunday' },
];

const initialState = {
  rule: CALL_ROUTING_RULES[0].value,
  action: '',
  value: '',
  start_time: moment(),
  end_time: moment().add(1, 'hour'),
  days: [],
  position: 0,
  scheduleUuid: null,
  name: null,
  greeting_type_id: '',
  caller_id: '',
  timeout_sec: 0,
  saved_number: '',
  failoverGreetingAction: '',
  failoverGreetingValue: '',
  internalFailoverValue: '',
  internalFailoverAction: '',
};

const RenderTimePicker = ({ handleChange, values, isEditing }) => {
  return (
    <>
      <label className={styles.label}>DAY OF THE WEEK</label>
      <div
        className={styles.timeSlotCheckbox}
        role="group"
        aria-labelledby="checkbox-group"
      >
        {DAYS.map((day) => (
          <>
            <Checkbox
              disabled={isEditing}
              type="checkbox"
              name="days"
              value={day.value}
              checked={values?.days?.includes(day.value)}
              onChange={handleChange}
            />
            {day.label}
          </>
        ))}
      </div>
      <div style={{ gap: 4 }} className="d-flex align-items-center">
        <TimePickerField fieldName="start_time" fieldLabel="FROM" />
        <div
          style={{
            height: '2px',
            background: '#d2d2d2',
            width: 30,
            marginTop: 32,
          }}
        />
        <TimePickerField fieldName="end_time" fieldLabel="TO" />
      </div>
    </>
  );
};
const TimeSlotForm = () => {
  const { incomingCalls, notification } = useStores();
  const queryClient = useQueryClient();
  const [initialValues, setInitialValues] = useState(initialState);
  const [particularScheduleSlotData, setParticularScheduleSlotData] = useState(
    {},
  );
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );
  const history = useHistory();
  const { numberId } = match.params;
  const { state } = useLocation();

  if (numberId === null) {
    notification.showError('A phone number was not provided.');
    setTimeout(() => {
      notification.hideNotification();
    }, 5000);
    history.push('/dashboard/settings/phone-and-fax/phone-number-and-routing');
    return;
  }

  const isEditing = state?.ediTimeSlot?.type === 'edit';

  const uidToEnable =
    state?.scheduleData?.[0]?.uuid ||
    state?.ediTimeSlot?.scheduleData?.[0]?.uuid;

  const idToEnable = state?.particularScheduleId || state?.ediTimeSlot?.id;

  const shouldEnabled =
    (!!state?.scheduleData?.[0]?.uuid && !!state?.particularScheduleId) ||
    (!!state?.ediTimeSlot?.id && !!state?.ediTimeSlot?.scheduleData?.[0]?.uuid);

  const getSchedule = useQuery(
    'getScheduleSlotData',
    () =>
      incomingCalls.getScheduleSlotData({
        scheduleId: uidToEnable,
        id: idToEnable,
      }),
    {
      enabled: shouldEnabled,
      onSuccess: (data) => {
        const ScheduleData = data?.data ?? {};

        setParticularScheduleSlotData(ScheduleData);
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

  const { data: agents } = useQuery(
    'usersAlongWithIncomingCalls',
    () => incomingCalls.getUsers(),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  useEffect(() => {
    if (state?.weekdayValue) {
      setInitialValues((prevState) => ({
        ...prevState,
        days: [state?.weekdayValue],
      }));
    }

    if (state?.ediTimeSlot) {
      const [eh, em, es] = state?.ediTimeSlot?.end_time?.split(':') ?? '';
      const [sh, sm, ss] = state?.ediTimeSlot?.start_time?.split(':') ?? '';
      setInitialValues((prevState) => ({
        ...prevState,
        end_time:
          new Date(
            moment().year(),
            moment().month(),
            moment().day(),
            eh,
            em,
            es,
          ) ?? '',
        start_time:
          new Date(
            moment().year(),
            moment().month(),
            moment().day(),
            sh,
            sm,
            ss,
          ) ?? '',
        rule: state?.ediTimeSlot?.rule ?? '',
        value: state?.ediTimeSlot?.value ?? '',
        action: state?.ediTimeSlot?.action ?? '',
        days: [state?.ediTimeSlot?.weekday] ?? '',
        saved_number: state?.ediTimeSlot?.value ?? '',
        greeting_type_id: state?.ediTimeSlot?.greeting_type_id ?? '',
        caller_id: state?.ediTimeSlot?.caller_id ?? '',
        timeout_sec: state?.ediTimeSlot?.timeout_sec ?? 30,
        internalFailoverAction: state.ediTimeSlot?.failover?.action ?? '',
        failoverGreetingAction:
          state.ediTimeSlot?.failover?.action === 'forward_to_greeting'
            ? state.ediTimeSlot?.failover?.greeting_type_id
            : '',
        failoverGreetingValue:
          state.ediTimeSlot?.failover?.action === 'forward_to_greeting'
            ? state.ediTimeSlot?.failover?.value
            : '',
        internalFailoverValue:
          state.ediTimeSlot?.failover?.action !== 'forward_to_greeting'
            ? state.ediTimeSlot?.failover?.value
            : '',
      }));
    }
  }, [state]);

  const { mutateAsync: addSlot, isLoading: isAddingSlot } = useMutation(
    'addTimeSlot',
    (payload) => incomingCalls.addTimeSlot(payload),
    {
      onSuccess: () => {
        notification.showSuccess('Schedule settings updated successfully!');
        queryClient.invalidateQueries('getScheduleSlots');
        history.push(match.url);
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the slot',
        ),
      retry: false,
    },
  );
  const { mutateAsync: updateSlot, isLoading: isUpdatingSlot } = useMutation(
    'updateSlot',
    (payload) => incomingCalls.updateTimeSlot(payload),
    {
      onSuccess: () => {
        notification.showSuccess('Schedule settings updated successfully!');
        queryClient.invalidateQueries('getScheduleSlots');
        history.push(match.url);
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the slot',
        ),
      retry: false,
    },
  );

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

  const handleSubmitForm = async (values) => {
    const getActionValue = (action, value) => {
      switch (action) {
        case 'forward_to_group':
          return groupsData?.find((group) => group.uuid === value)?.id || null;
        case 'forward_to_exten':
          return (
            agents?.find((agent) => agent.id === value)?.user_exten || null
          );
        case 'forward_to_ivr':
          return ivrList?.find((ivr) => ivr.uuid === value)?.id || null;
        default:
          return null;
      }
    };
    if (state?.ediTimeSlot?.type === 'edit') {
      if (values.rule === 'EXTERNAL') {
        const {
          action,
          saved_number,
          rule,
          value,
          timeout_sec,
          caller_id,
          end_time,
          start_time,
          internalFailoverAction,
          internalFailoverValue,
          failoverGreetingAction,
          failoverGreetingValue,
        } = values;

        const phoneNumber =
          saved_number === 'other'
            ? `+1${value.replace(/\D/g, '')}`
            : saved_number;

        let failover = {};
        if (internalFailoverAction === 'forward_to_greeting') {
          failover = {
            action: 'forward_to_greeting',
            value: failoverGreetingValue,
            greeting_type_id: failoverGreetingAction,
          };
        } else {
          failover = {
            action: internalFailoverAction,
            value: internalFailoverValue,
          };
        }

        const payload = {
          start_time: moment(start_time).format('HH:mm:ss'),
          end_time: moment(end_time).format('HH:mm:ss'),
          rule,
          action,
          value: phoneNumber,
          caller_id,
          timeout_sec,
          failover,
        };

        if (
          particularScheduleSlotData &&
          Object.keys(particularScheduleSlotData).length > 0
        ) {
          particularScheduleSlotData[`${state?.ediTimeSlot?.weekdayValue}`][
            `${state?.ediTimeSlot?.itemIndex}`
          ] = payload;
        }

        const { schedule_uuid, ...rest } = particularScheduleSlotData;
        await updateSlot({
          scheduleUuid: schedule_uuid,
          activeSchedule:
            state?.ediTimeSlot?.scheduleData?.[0]?.active_schedule,
          ...rest,
        });
      } else {
        const {
          rule,
          action,
          value,
          end_time,
          start_time,
          timeout_sec,
          greeting_type_id,
          internalFailoverAction,
          internalFailoverValue,
          failoverGreetingAction,
          failoverGreetingValue,
        } = values;

        let payload = {};

        if (values.rule === 'GREETING') {
          payload = {
            start_time: moment(start_time).format('HH:mm:ss'),
            end_time: moment(end_time).format('HH:mm:ss'),
            rule,
            action,
            value,
            greeting_type_id,
          };
        } else {
          if (action === 'forward_to_ivr') {
            payload = {
              start_time: moment(start_time).format('HH:mm:ss'),
              end_time: moment(end_time).format('HH:mm:ss'),
              rule,
              timeout_sec,
              action,
              value,
              actionValue: {
                id: getActionValue(action, value),
              },
            };
          } else if (action === 'forward_to_exten') {
            payload = {
              start_time: moment(start_time).format('HH:mm:ss'),
              end_time: moment(end_time).format('HH:mm:ss'),
              rule,
              timeout_sec,
              action,
              value,
              actionValue: {
                user_exten: getActionValue(action, value),
              },
            };
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
                  id: getActionValue(
                    internalFailoverAction,
                    internalFailoverValue,
                  ),
                },
              };
            }
            payload = {
              start_time: moment(start_time).format('HH:mm:ss'),
              end_time: moment(end_time).format('HH:mm:ss'),
              rule,
              action,
              value,
              timeout_sec,
              failover,
              actionValue: {
                id: getActionValue(action, value),
              },
            };
          }
        }

        if (
          particularScheduleSlotData &&
          Object.keys(particularScheduleSlotData).length > 0
        ) {
          particularScheduleSlotData[`${state?.ediTimeSlot?.weekdayValue}`][
            `${state?.ediTimeSlot?.itemIndex}`
          ] = payload;
        }

        let particularScheduleSlotDataPayload = {
          id: particularScheduleSlotData['id'],
          name: particularScheduleSlotData['name'],
          number: numberId,
          position: particularScheduleSlotData['position'],
          schedule_uuid: particularScheduleSlotData['schedule_uuid'],
          uuid: particularScheduleSlotData['uuid'],
          ...Object.fromEntries(
            Object.entries(particularScheduleSlotData).filter(([key]) =>
              key.includes(state?.ediTimeSlot?.weekdayValue),
            ),
          ),
        };

        const { schedule_uuid, ...rest } = particularScheduleSlotDataPayload;
        await updateSlot({
          scheduleUuid: schedule_uuid,
          activeSchedule:
            state?.ediTimeSlot?.scheduleData?.[0]?.active_schedule,
          ...rest,
        });
      }
    } else {
      if (values.rule === 'EXTERNAL') {
        const {
          action,
          saved_number,
          rule,
          value,
          timeout_sec,
          caller_id,
          end_time,
          start_time,
          days,
          internalFailoverAction,
          internalFailoverValue,
          failoverGreetingAction,
          failoverGreetingValue,
        } = values;

        const phoneNumber =
          saved_number === 'other'
            ? `+1${value.replace(/\D/g, '')}`
            : saved_number;

        let failover = {};
        if (internalFailoverAction === 'forward_to_greeting') {
          failover = {
            action: 'forward_to_greeting',
            value: failoverGreetingValue,
            greeting_type_id: failoverGreetingAction,
          };
        } else {
          failover = {
            action: internalFailoverAction,
            value: internalFailoverValue,
          };
        }

        const payload = {
          rule,
          action,
          value: phoneNumber,
          caller_id,
          timeout_sec,
          failover,
        };

        let call_route = {};
        days.forEach((day) => {
          call_route[day] = [
            {
              start_time: moment(start_time).format('HH:mm:ss'),
              end_time: moment(end_time).format('HH:mm:ss'),
              ...payload,
            },
          ];
        });

        if (
          particularScheduleSlotData &&
          Object.keys(particularScheduleSlotData).length > 0
        ) {
          if (call_route && Object.keys(call_route).length > 0) {
            Object.keys(call_route).forEach((key) => {
              if (particularScheduleSlotData[key]) {
                let mutatedKey = [
                  ...particularScheduleSlotData[key],
                  call_route[key]?.[0],
                ];
                particularScheduleSlotData[key] = mutatedKey;
              } else {
                particularScheduleSlotData[key] = call_route[key];
              }
            });
            const { schedule_uuid, ...rest } = particularScheduleSlotData;
            await updateSlot({
              scheduleUuid: schedule_uuid,
              activeSchedule: state?.scheduleData?.[0]?.active_schedule,
              ...rest,
            });
          }
        } else {
          const payload = {
            ...call_route,
            scheduleUuid: state?.scheduleData?.[0]?.uuid,
            name: `custom schedule ${state?.position}`,
            position: state?.position,
            activeSchedule: state?.scheduleData?.[0]?.active_schedule,
          };

          await addSlot(payload);
        }
      } else {
        const {
          rule,
          action,
          value,
          end_time,
          start_time,
          timeout_sec,
          greeting_type_id,
          days,
          internalFailoverAction,
          internalFailoverValue,
          failoverGreetingAction,
          failoverGreetingValue,
        } = values;

        let payload = {};

        if (values.rule === 'GREETING') {
          payload = {
            rule,
            timeout_sec,
            action,
            value,
            greeting_type_id,
          };
        } else {
          if (action === 'forward_to_ivr') {
            payload = {
              rule,
              timeout_sec,
              action,
              value,
            };
          } else {
            let failover = {};
            if (internalFailoverAction === 'forward_to_greeting') {
              failover = {
                action: 'forward_to_greeting',
                value: failoverGreetingValue,
                greeting_type_id: failoverGreetingAction,
              };
            } else {
              failover = {
                action: internalFailoverAction,
                value: internalFailoverValue,
              };
            }
            payload = {
              rule,
              action,
              value,
              timeout_sec,
              failover,
            };
          }
        }

        let call_route_obj = {};
        days.forEach((day) => {
          call_route_obj[day] = [
            {
              start_time: moment(start_time).format('HH:mm:ss'),
              end_time: moment(end_time).format('HH:mm:ss'),
              ...payload,
            },
          ];
        });

        if (
          particularScheduleSlotData &&
          Object.keys(particularScheduleSlotData).length > 0
        ) {
          if (call_route_obj && Object.keys(call_route_obj).length > 0) {
            Object.keys(call_route_obj).forEach((key) => {
              if (particularScheduleSlotData[key]) {
                let mutatedKey = [
                  ...particularScheduleSlotData[key],
                  call_route_obj[key]?.[0],
                ];
                particularScheduleSlotData[key] = mutatedKey;
              } else {
                particularScheduleSlotData[key] = call_route_obj[key];
              }
            });

            let particularScheduleSlotDataPayload = {
              id: particularScheduleSlotData['id'],
              name: particularScheduleSlotData['name'],
              number: numberId,
              position: particularScheduleSlotData['position'],
              schedule_uuid: particularScheduleSlotData['schedule_uuid'],
              uuid: particularScheduleSlotData['uuid'],
              ...Object.fromEntries(
                Object.entries(particularScheduleSlotData).filter(([key]) =>
                  Object.keys(call_route_obj).includes(key),
                ),
              ),
            };

            const { schedule_uuid, ...rest } =
              particularScheduleSlotDataPayload;

            await updateSlot({
              scheduleUuid: schedule_uuid,
              activeSchedule: state?.scheduleData?.[0]?.active_schedule,
              ...rest,
            });
          }
        } else {
          const payload = {
            ...call_route_obj,
            scheduleUuid: state?.scheduleData?.[0]?.uuid,
            name: `custom schedule ${state?.position}`,
            number: numberId,
            position: state?.position,
            activeSchedule: state?.scheduleData?.[0]?.active_schedule,
          };
          await addSlot(payload);
        }
      }
    }
  };

  const isSaving = isAddingSlot || isUpdatingSlot;

  return (
    <div className={styles.container}>
      <div className={styles.titleText}>
        {isEditing ? 'Edit Time Slot' : 'Add Time Slot'}
      </div>
      <div className="d-flex flex-column justify-content-center">
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={(values) => handleSubmitForm(values)}
        >
          {(props) => (
            <Form>
              <RenderTimePicker {...props} isEditing={isEditing} />
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
                  disabled={isSaving}
                  color="primary"
                  onClick={() => history.push(match.url)}
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

export default TimeSlotForm;
