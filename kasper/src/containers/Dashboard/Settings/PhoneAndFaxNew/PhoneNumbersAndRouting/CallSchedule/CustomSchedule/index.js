import React, { useEffect } from 'react';
import styles from './index.module.css';
import Add from '@material-ui/icons/Add';
import Switch from 'components/Core/Switch';
import { Button, LinearProgress } from '@material-ui/core';
import EditCustomSchedule from './EditCustomSchedule';
import { ReactComponent as NoSchedulesIllustration } from 'assets/images/no-schedules.svg';
import { useState } from 'react';
import { Reorder } from 'framer-motion/dist/framer-motion';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useParams } from 'react-router-dom';

const initialState = {
  defaultValue: null,
  scheduleUuid: null,
  scheduleType: 'custom',
  rotatingSchedule: false,
  fallbackAction: null,
  activeSchedule: null,
};

const LEGEND = [
  {
    color: '#566F9F',
    label: 'Internal Routing',
  },
  {
    color: '#61A6E7',
    label: 'Forwarded',
  },
  {
    color: '#FEA828',
    label: 'Play Greeting',
  },
];

const ScheduleActions = ({ handleAddSchedule, values, onSettingChange }) => {
  return (
    <div>
      <span className={styles.sectionHeader}>
        Set up a custom schedule below
      </span>
      <div className={styles.actionsContainer}>
        <div style={{ gap: 10 }} className="d-flex align-items-center">
          <span className={styles.switchLabel}>Rotating Schedule?</span>
          <Switch
            name="rotatingSchedule"
            checked={values.rotatingSchedule}
            onChange={onSettingChange}
          />
          <span className={styles.note}>
            Rotation order based on schedule order where the highest will be
            first
          </span>
        </div>
        <Button
          className={styles.addSchedule}
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={handleAddSchedule}
        >
          Add Schedule
        </Button>
      </div>
    </div>
  );
};

const Info = ({ fallbackAction, rotatingSchedule }) => {
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );
  const history = useHistory();

  useEffect(() => {
    initialState['fallbackAction'] = fallbackAction;
  }, [fallbackAction]);

  const handleRenderAction = (action) => {
    switch (action) {
      case 'forward_to_exten':
        return ':Forward to agent';
      case 'forward_to_ivr':
        return ':Forward to IVR';
      case 'forward_to_group':
        return ':Forward to group';
      case 'forward_to_phone':
        return ':Forward to number';
      case 'forward_to_greeting':
        return '';

      default:
        return 'Add fallback action';
    }
  };
  const handleRenderRule = (rule) => {
    switch (rule) {
      case 'INTERNAL':
        return 'Internal routing';
      case 'EXTERNAL':
        return 'External routing';
      case 'GREETING':
        return 'Play greeting';

      default:
        return 'Add fallback action';
    }
  };
  return (
    <div className={styles.infoContainer}>
      <div style={{ gap: '2.5em' }} className="d-flex align-items-center">
        {LEGEND.map(({ label, color }) => (
          <span className="d-flex align-items-center" key={label}>
            <span
              style={{ background: color }}
              className={styles.legendCircle}
            />
            <span className={styles.legendLabel}>{label}</span>
          </span>
        ))}
      </div>
      <div className={styles.fallbackContainer}>
        <span className={styles.legendLabel}>
          Fallback action
          <span
            className={`${styles.legendLabel} ${styles.actionText}`}
            onClick={() =>
              history.push(`${match.url}/fallback-action`, {
                rotatingSchedule: rotatingSchedule,
                fallbackAction: fallbackAction,
              })
            }
          >
            {fallbackAction
              ? `${handleRenderRule(
                  fallbackAction?.rule ?? null,
                )} ${handleRenderAction(fallbackAction?.action ?? null)} `
              : handleRenderAction(fallbackAction?.action ?? null)}
          </span>
        </span>
      </div>
    </div>
  );
};

const NoSchedules = ({ setShowSchedules, handleAddSchedule }) => {
  return (
    <div style={{ height: 300 }}>
      <span className={styles.sectionHeader}>
        Set up a custom schedule below
      </span>
      <div className={styles.noScheduleContainer}>
        <NoSchedulesIllustration />
        <span className={styles.noScheduleText}>
          You do not have any schedule, create a new one
        </span>
        <Button
          className={styles.addSchedule}
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={() => {
            setShowSchedules(true);
            handleAddSchedule();
          }}
        >
          Add Schedule
        </Button>
      </div>
    </div>
  );
};

const CustomSchedule = ({
  values: timeSlotValues,
  handleClose,
  scheduleData,
}) => {
  const { incomingCalls, notification } = useStores();
  const [schedule, setSchedule] = useState([]);
  const [initialValues, setInitialValues] = useState(initialState);
  const [showSchedules, setShowSchedules] = useState(false);
  const queryClient = useQueryClient();
  const { state } = useLocation();
  const { numberId } = useParams();

  const {
    data: customScheduleData = [],
    isLoading: isLoadingScheduleData,
    isFetching,
  } = useQuery(
    'getScheduleSlots',
    () => incomingCalls.getScheduleSlots(scheduleData?.[0]?.uuid),
    {
      enabled: !!scheduleData?.[0]?.uuid,
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the schedule',
        );
      },
      cacheTime: 0,
      retry: false,
    },
  );

  const { mutateAsync: updatePosition } = useMutation(
    'updatePosition',
    (payload) => incomingCalls.updatePosition(payload),
    {
      onSuccess: () => {
        notification.showSuccess('Schedule positions updated successfully!');
        queryClient.invalidateQueries('getScheduleSlots');
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the positions',
        ),
      retry: false,
    },
  );

  const { mutateAsync: addSchedule, isLoading: isLoadingAddSchedule } =
    useMutation(
      'addSchedule',
      (payload) => incomingCalls.addSchedule(payload),
      {
        onSuccess: () => {
          notification.showSuccess('Schedule settings updated successfully!');
          queryClient.invalidateQueries('getScheduleSlots');
        },
        onError: () =>
          notification.showError(
            'An unexpected error occurred while attempting to update the schedule',
          ),
        retry: false,
      },
    );

  const { mutateAsync: updateSchedule, isLoading: isLoadingUpdateSchedule } =
    useMutation(
      'updateSchedule',
      (payload) => incomingCalls.updateSchedule(payload),
      {
        onSuccess: () => {
          notification.showSuccess('Schedule settings updated successfully!');
          queryClient.invalidateQueries('getScheduleSlots');
        },
        onError: () =>
          notification.showError(
            'An unexpected error occurred while attempting to update the schedule',
          ),
        retry: false,
      },
    );

  useEffect(() => {
    if (state && state.fallbackAction) {
      setInitialValues((prevState) => ({
        ...prevState,
        fallbackAction: state.fallbackAction,
        rotatingSchedule: state.rotatingSchedule,
      }));
    }
  }, [state]);

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      setInitialValues((prevState) => ({
        ...prevState,
        fallbackAction: scheduleData?.[0]?.fallback_action,
        rotatingSchedule:
          scheduleData?.[0]?.rotating_schedule === 1 ? true : false,
        activeSchedule: scheduleData?.[0]?.active_schedule,
      }));
    }
  }, [scheduleData]);

  useEffect(() => {
    if (customScheduleData.length > 0) {
      setSchedule(customScheduleData);
    }
  }, [customScheduleData]);

  const moveItem = async (from, to) => {
    const swappedPositions = [from, to];

    if (from === 0 && to === -1) {
      return;
    }
    if (from === schedule.length - 1 && to === schedule.length) {
      return;
    }
    const arr = [...schedule];
    const element = arr.splice(from, 1)[0];
    arr.splice(to, 0, element);
    setSchedule(arr);
    const filteredData = arr.filter((_, index) =>
      swappedPositions.includes(index),
    );
    if (filteredData && filteredData.length > 0) {
      const payload = [
        { id: filteredData?.[0]?.id, position: filteredData?.[1]?.position },
        { id: filteredData?.[1]?.id, position: filteredData?.[0]?.position },
      ];

      await updatePosition(payload);
    }
  };

  const handleAddSchedule = () => {
    setSchedule((prevSchedules) => {
      return [
        ...prevSchedules,
        {
          id: prevSchedules.length,
          schedule: [
            {
              day: 1,
              schedule: [],
            },
            {
              day: 2,
              schedule: [],
            },
            {
              day: 3,
              schedule: [],
            },
            {
              day: 4,
              schedule: [],
            },
            {
              day: 5,
              schedule: [],
            },
          ],
        },
      ];
    });
  };

  const handleSubmitForm = async (values) => {
    const payload = {
      ...values,
      number: numberId,
    };

    if (scheduleData?.length > 0) {
      payload.id = scheduleData?.[0]?.id;
      await updateSchedule(payload);
    } else {
      await addSchedule(payload);
    }
  };

  const isMutationScheduleLoading = isFetching || isLoadingAddSchedule;

  const isSaving = isLoadingAddSchedule || isLoadingUpdateSchedule;

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={(values) => handleSubmitForm(values)}
    >
      {({ values, handleChange, setFieldValue }) => {
        return (
          <Form>
            {customScheduleData.length > 0 || showSchedules ? (
              <>
                <ScheduleActions
                  handleAddSchedule={handleAddSchedule}
                  values={values}
                  onSettingChange={(event) => handleChange(event)}
                />
                <Info
                  fallbackAction={values.fallbackAction}
                  rotatingSchedule={values.rotatingSchedule}
                />
                {(isMutationScheduleLoading || isSaving) && (
                  <LinearProgress color="secondary" />
                )}
                <Reorder.Group
                  axis="y"
                  onReorder={setSchedule}
                  values={schedule}
                  layoutScroll
                  style={{
                    overflowY: 'auto',
                    listStyle: 'none',
                    height: 430,
                    marginBottom: 0,
                    paddingLeft: 0,
                  }}
                >
                  {schedule.map(
                    (
                      {
                        id,
                        name,
                        uuid,
                        schedule,
                        schedule_uuid,
                        position,
                        ...rest
                      },
                      index,
                    ) => (
                      <EditCustomSchedule
                        key={id}
                        id={id}
                        name={name}
                        position={index}
                        schedule={Object.keys(rest).map((key) => ({
                          [key]: rest[key],
                        }))}
                        changePosition={moveItem}
                        timeSlotValues={timeSlotValues}
                        scheduleData={scheduleData}
                        schedule_uuid={uuid}
                        setFieldValue={setFieldValue}
                        values={values}
                      />
                    ),
                  )}
                </Reorder.Group>
              </>
            ) : isLoadingScheduleData ? (
              <div className="d-flex justify-content-center align-items-center">
                <CircularProgress color="secondary" />
              </div>
            ) : (
              <NoSchedules
                setShowSchedules={setShowSchedules}
                handleAddSchedule={handleAddSchedule}
              />
            )}

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
        );
      }}
    </Formik>
  );
};

export default CustomSchedule;
