import CustomTooltip from 'components/Core/Tooltip';
import React from 'react';
import { ReactComponent as HelpIcon } from 'assets/images/help-outlined.svg';
import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import moment from 'moment';

const days = [
  { id: 1, day: 'Mon' },
  { id: 2, day: 'Tue' },
  { id: 3, day: 'Wed' },
  { id: 4, day: 'Thu' },
  { id: 5, day: 'Fri' },
  { id: 6, day: 'Sat' },
  { id: 7, day: 'Sun' },
];

const PreviewItem = ({ day, scheduleArray }) => {
  return (
    <div className="d-flex">
      <div style={{ width: 50 }}>
        <b>{day}</b>
      </div>
      <div>
        {scheduleArray?.length ? (
          scheduleArray.map((scheduleObj) => (
            <div key={scheduleObj.id}>
              {`${moment(scheduleObj?.from, 'HH:mm:ss')
                .format('LT')
                .slice(
                  0,
                  moment(scheduleObj?.from, 'HH:mm:ss').format('LT').length - 1,
                )} - ${moment(scheduleObj?.to, 'HH:mm:ss')
                .format('LT')
                .slice(
                  0,
                  moment(scheduleObj?.to, 'HH:mm:ss').format('LT').length - 1,
                )}`}
            </div>
          ))
        ) : (
          <span style={{ color: '#bbb' }}>Closed</span>
        )}
      </div>
    </div>
  );
};

const OfficeSchedulePreview = () => {
  const { phoneFaxOptions } = useStores();
  const { data: schedule = [], isFetching: isFetchingSchedule } = useQuery(
    'officeSchedule',
    () => phoneFaxOptions.fetchSchedule(),
  );

  const { data: config = [], isFetching: isFetchingConfig } = useQuery(
    'officeConfig',
    () => phoneFaxOptions.fetchConfig(),
  );

  const scheduleType = config[1]?.value;

  const getHoursArray = (id) => {
    if (!schedule.length) return;
    let scheduleArray = [];
    schedule.map((item) => {
      if (item.day === id) scheduleArray.push(item);
    });
    return scheduleArray;
  };

  const tooltipTitle = (
    <div className="d-flex flex-column">
      {schedule.length
        ? days.map(({ id, day }) => (
            <PreviewItem key={id} day={day} scheduleArray={getHoursArray(id)} />
          ))
        : undefined}
    </div>
  );

  const getTitle = () => {
    switch (true) {
      case isFetchingSchedule || isFetchingConfig:
        return 'loading...';
      case scheduleType === '24_7':
        return 'The office is open 24/7';
      case Boolean(schedule.length):
        return tooltipTitle;
      default:
        return 'No office schedule';
    }
  };

  return (
    <CustomTooltip title={getTitle()} maxWidth={500} placement="top-start">
      <HelpIcon />
    </CustomTooltip>
  );
};

export default OfficeSchedulePreview;
