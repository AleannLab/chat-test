import moment from 'moment';
import { convertCurrentTime } from 'helpers/timezone';

export const IN_NEXT_7_DAYS = 7;
export const IN_LAST_7_DAYS = -7;

export const isDateInRange = (date, offset) => {
  let result = false;
  const today = convertCurrentTime({ shouldFormat: false });
  const inputDate = moment.utc(date);
  if (!offset) {
    return isSameDate(today, inputDate);
  } else if (offset < 0) {
    while (offset && !result) {
      const temp = today.subtract(1, 'days');
      if (isSameDate(temp, inputDate)) {
        result = true;
      }
      offset++;
    }
  } else {
    while (offset && !result) {
      const temp = today.add(1, 'days');
      if (isSameDate(temp, inputDate)) {
        result = true;
      }
      offset--;
    }
  }
  return result;
};

export const isSameDate = (date1, date2) =>
  date1.month() === date2.month() && date1.date() === date2.date();

export const birthdayCheck = (date) => {
  if (isDateInRange(date)) {
    return "Patient's birthday is today!";
  }
  if (isDateInRange(date, IN_NEXT_7_DAYS)) {
    const birthday = moment.utc(date).format('MMM Do');
    return `Patient has an upcoming birthday on ${birthday}`;
  }
  if (isDateInRange(date, IN_LAST_7_DAYS)) {
    const birthday = moment.utc(date).format('MMM Do');
    return `Patient had a recent birthday on  ${birthday}`;
  }
  return null;
};
