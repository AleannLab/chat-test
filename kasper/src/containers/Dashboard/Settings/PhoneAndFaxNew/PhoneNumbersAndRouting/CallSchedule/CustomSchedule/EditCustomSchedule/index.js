import React, { useState } from 'react';
import styles from './index.module.css';
import { Add, Check } from '@material-ui/icons';
import moment from 'moment';
import { ButtonBase } from '@material-ui/core';
import { ReactComponent as EditIcon } from 'assets/images/pencil.svg';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as ArrowIcon } from 'assets/images/arrow.svg';
import { Reorder } from 'framer-motion/dist/framer-motion';
import { useHistory, useRouteMatch } from 'react-router-dom';
import FadeMenu from './MenuList';
import DeleteScheduleModal from './MenuList/DeleteScheduleModal';
import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';
import CustomEditable from './CustomEditable';

moment.updateLocale('en', {
  week: {
    dow: 1,
  },
});

const WEEKDAYS = [
  { id: 1, value: 'monday', label: 'Monday' },
  { id: 2, value: 'tuesday', label: 'Tuesday' },
  { id: 3, value: 'wednesday', label: 'Wednesday' },
  { id: 4, value: 'thursday', label: 'Thursday' },
  { id: 5, value: 'friday', label: 'Friday' },
  { id: 6, value: 'saturday', label: 'Saturday' },
  { id: 7, value: 'sunday', label: 'Sunday' },
];

const ROUTING_TYPE = {
  internal: { value: 'INTERNAL', color: '#566F9F' },
  greeting: { value: 'GREETING', color: '#FEA828' },
  external: { value: 'EXTERNAL', color: '#61A6E7' },
};

const getRouting = (value) => {
  if (value === ROUTING_TYPE.internal.value) return ROUTING_TYPE.internal;
  if (value === ROUTING_TYPE.greeting.value) return ROUTING_TYPE.greeting;
  if (value === ROUTING_TYPE.external.value) return ROUTING_TYPE.external;
};

const Header = ({
  position,
  onMoveUp,
  onMoveDown,
  id,
  name,
  schedule_uuid,
  scheduleData,
  setFieldValue,
  values,
}) => {
  const { incomingCalls, notification } = useStores();
  const [scheduleName, setScheduleName] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: updateSlot, isLoading: isUpdating } = useMutation(
    'updateSlot',
    (payload) => incomingCalls.updateTimeSlot(payload),
    {
      onSuccess: () => {
        notification.showSuccess('Schedule settings updated successfully!');
        queryClient.invalidateQueries('getScheduleSlots');
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the slot',
        ),
      retry: false,
    },
  );

  const { mutateAsync: updateName, isLoading } = useMutation(
    'getScheduleSlotData',
    (payload) => incomingCalls.getScheduleSlotData(payload),
    {
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the schedule',
        ),
      retry: false,
    },
  );

  const handleUpdateName = async ({ scheduleId, id, newText }) => {
    setScheduleName(newText);
    try {
      const response = await updateName({ scheduleId, id });
      if (response.success) {
        if (response?.data) {
          const payload = response?.data;
          const { schedule_uuid, name, ...rest } = payload;
          await updateSlot({
            scheduleUuid: schedule_uuid,
            name: newText,
            ...rest,
          });
        }
      }
    } catch (e) {
      notification.showError(
        'An unexpected error occurred while attempting to update the user name',
      );
    }
  };

  return (
    <div className={styles.header}>
      <div className="d-flex align-items-center h-100">
        <div className={styles.arrowButtonsContainer}>
          <ButtonBase
            onClick={onMoveUp}
            className={styles.buttonsContainer}
            style={{ borderBottom: '1px solid #DDDDDD' }}
          >
            <ArrowIcon
              fill="#9A9A9A"
              style={{
                transform: 'rotate(180deg)',
              }}
            />
          </ButtonBase>
          <ButtonBase onClick={onMoveDown} className={styles.buttonsContainer}>
            <ArrowIcon fill="#9A9A9A" />
          </ButtonBase>
        </div>
        <span className="ms-2 d-flex align-items-center">
          <span style={{ marginRight: '5px' }}>{`#${position}`}</span>

          <CustomEditable
            fieldName="label"
            isBlock={true}
            loading={isUpdating || isLoading}
            allowSpecialChars={false}
            text={scheduleName || name || `custom schedule ${position}`}
            onUpdate={(newText) =>
              handleUpdateName({
                scheduleId: scheduleData?.[0]?.scheduleUid,
                id: id,
                newText,
              })
            }
            setIsEdit={setIsEdit}
          />
        </span>
      </div>

      {!isEdit ? (
        <div className="d-flex align-items-center">
          {values?.activeSchedule === schedule_uuid && (
            <span
              className={`${
                values?.activeSchedule !== schedule_uuid
                  ? styles.chipDisabled
                  : styles.chipActive
              }`}
            >
              {values?.activeSchedule === schedule_uuid ? (
                <>
                  <Check
                    className={styles.checkIcon}
                    style={{ fontSize: 12, marginBottom: 2 }}
                  />
                  Active Now
                </>
              ) : (
                'Activates on 6/13/2022'
              )}
            </span>
          )}

          <span style={{ marginLeft: '15px' }}>
            <FadeMenu
              id={id}
              schedule_uuid={schedule_uuid}
              setFieldValue={setFieldValue}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          </span>
        </div>
      ) : null}
    </div>
  );
};

const WeekDaySchedule = ({
  weekday,
  schedule,
  number,
  weekdayValue,
  id,
  name,
  index: weekdayIndex,
  scheduleData,
  position,
}) => {
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );
  const history = useHistory();
  return (
    <div
      style={{ background: number % 2 === 0 ? '#fff' : '#F0F3F8' }}
      className="d-flex flex-column flex-grow-1"
    >
      <span
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '.5em 0',
          color: '#999',
        }}
      >
        {weekday.substring(0, 2)}
      </span>
      <div className={styles.column}>
        <ButtonBase
          onClick={() =>
            history.push(`${match.url}/time-slot`, {
              scheduleData,
              type: 'add',
              particularScheduleId: id,
              weekdayValue,
              position,
            })
          }
          className={styles.addButton}
        >
          <Add /> Add
        </ButtonBase>

        {schedule?.[weekdayValue] &&
          schedule?.[weekdayValue].map((daySchedule, index) => (
            <ScheduleItem
              key={index}
              daySchedule={daySchedule}
              id={id}
              scheduleData={scheduleData}
              name={name}
              itemIndex={index}
              weekdayIndex={weekdayIndex}
              weekdayValue={weekdayValue}
              position={position}
            />
          ))}
      </div>
    </div>
  );
};

const ScheduleItem = ({
  daySchedule,
  id,
  name,
  itemIndex,
  weekdayIndex,
  weekdayValue,
  scheduleData,
  position,
}) => {
  const [DeleteSchedule, setDeleteSchedule] = useState(false);
  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );

  return (
    <div
      className={styles.scheduleItem}
      style={{ background: getRouting(daySchedule.rule)?.color }}
    >
      <div>
        {moment(daySchedule?.start_time, ['HH:mm:ss']).format('hh:mmA')}
      </div>
      <div>{moment(daySchedule?.end_time, ['HH:mm:ss']).format('hh:mmA')}</div>
      <CloseIcon
        className={styles.closeIcon}
        onClick={() => setDeleteSchedule(true)}
      />
      <EditIcon
        height={8}
        width={8}
        fill="#fff"
        className={styles.editIcon}
        onClick={() =>
          history.push(`${match.url}/time-slot`, {
            ediTimeSlot: {
              ...daySchedule,
              weekday: weekdayValue,
              id,
              name,
              scheduleData,
              type: 'edit',
              itemIndex,
              weekdayValue,
              position,
            },
          })
        }
      />
      {DeleteSchedule && (
        <DeleteScheduleModal
          setDeleteSchedule={setDeleteSchedule}
          id={id}
          scheduleData={scheduleData}
          weekdayValue={weekdayValue}
          itemIndex={itemIndex}
          weekdayIndex={weekdayIndex}
        />
      )}
    </div>
  );
};

const Schedule = React.memo(function Schedule({
  schedule,
  id,
  name,
  scheduleData,
  position,
}) {
  return (
    <div className="d-flex">
      {WEEKDAYS.map((weekday, index) => {
        return (
          <WeekDaySchedule
            key={weekday.label}
            weekday={weekday.label}
            number={index + 1}
            schedule={schedule[index]}
            weekdayValue={weekday.value}
            id={id}
            name={name}
            index={index}
            scheduleData={scheduleData}
            position={position}
          />
        );
      })}
    </div>
  );
});

const EditCustomSchedule = ({
  id,
  position,
  schedule,
  changePosition,
  name,
  scheduleData,
  schedule_uuid,
  setFieldValue,
  values,
}) => {
  return (
    <Reorder.Item value={schedule} id={id} dragListener={false}>
      <div className={styles.editScheduleContainer}>
        <Header
          position={position + 1}
          onMoveUp={() => changePosition(position, position - 1)}
          onMoveDown={() => changePosition(position, position + 1)}
          id={id}
          name={name}
          schedule_uuid={schedule_uuid}
          scheduleData={scheduleData}
          setFieldValue={setFieldValue}
          values={values}
        />
        <Schedule
          schedule={schedule}
          id={id}
          name={name}
          scheduleData={scheduleData}
          position={position + 1}
        />
      </div>
    </Reorder.Item>
  );
};

export default EditCustomSchedule;
