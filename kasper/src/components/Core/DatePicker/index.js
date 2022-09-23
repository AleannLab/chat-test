import React from 'react';

import {
  Calendar as CalendarComponent,
  utils,
} from '@amir04lm26/react-modern-calendar-date-picker';
import '@amir04lm26/react-modern-calendar-date-picker/lib/DatePicker.css';
import './calender.css';
import styles from './index.module.css';

const DatePicker = ({ minDate, maxDate, value, onChange, className }) => {
  return (
    <CalendarComponent
      calendarClassName={className}
      minimumDate={minDate}
      maximumDate={maxDate}
      value={value}
      onChange={onChange}
      colorPrimary="#F4266E"
      colorPrimaryLight="#F5DBE5"
      calendarTodayClassName={styles.todaysDate}
      calendarRangeStartClassName={styles.calenderRangeStartEnd}
      calendarRangeEndClassName={styles.calenderRangeStartEnd}
    />
  );
};

export default DatePicker;
