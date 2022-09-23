import moment from 'moment-timezone';
import { store } from 'stores';

export const convertCustomTime = ({
  dateTime,
  format = '',
  shouldFormat = true,
}) => {
  const { timezone } = store.authentication.user || {};
  if (shouldFormat) {
    return timezone
      ? moment.utc(dateTime).tz(timezone).format(format)
      : moment.utc(dateTime).format(format);
  } else {
    return timezone ? moment.utc(dateTime).tz(timezone) : moment.utc(dateTime);
  }
};

export const convertCurrentTime = ({ format = '', shouldFormat = true }) => {
  const { timezone } = store.authentication.user || {};
  if (shouldFormat) {
    return timezone
      ? moment.utc().tz(timezone).format(format)
      : moment.utc().format(format);
  } else {
    return timezone ? moment.utc().tz(timezone) : moment.utc();
  }
};

// Convert given dateTime to local dateTime
export const convertToLocalTime = (
  dateTime,
  formatPattern = 'YYYY-MM-DD HH:mm:ss',
) => {
  return moment(moment.utc(dateTime).format('YYYY-MM-DD HH:mm'))
    .local()
    .format(formatPattern);
};
