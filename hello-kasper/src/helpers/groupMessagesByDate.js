import moment from 'moment-timezone';
import { uniq } from 'lodash';

const groupMessagesByDate = (messages, user) => {
  let groups = {};
  if (messages.length > 0) {
    const dates = uniq(
      messages.map((message) => {
        return moment
          .utc(message.createdTime)
          .tz(user.timezone)
          .format('dddd, MMMM Do');
      }),
    );
    dates.forEach((date) => {
      const nMessages = messages.filter((message) => {
        const messageDate = moment
          .utc(message.createdTime)
          .tz(user.timezone)
          .format('dddd, MMMM Do');
        return messageDate == date;
      });
      groups[date] = nMessages;
    });
  }
  return groups;
};

export { groupMessagesByDate };
