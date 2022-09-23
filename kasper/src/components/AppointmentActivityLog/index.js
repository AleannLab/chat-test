import moment from 'moment-timezone';

import { Tooltip } from '@material-ui/core';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CustomTooltip from 'components/Core/Tooltip';
import { useStores } from 'hooks/useStores';

import styles from './index.module.css';

const AppointmentActivityLog = ({
  log: {
    firstname,
    lastname,
    datetime,
    activity_json,
    activity_json: {
      provider,
      procedures,
      appointment_status,
      start,
      confirmed_date,
    },
  },
}) => {
  const { authentication } = useStores();
  const scheduledDate = moment(start);
  const date = scheduledDate.format('MMMM DD, YYYY');
  const time = scheduledDate.format('h:mm a');
  const isCanceled = appointment_status === 5;

  return (
    <div className={styles.activityLogAppointmentWrapper}>
      <div className={styles.activityLogAppointmentHeader}>
        {isCanceled ? (
          <CancelIcon htmlColor="#F4266E" />
        ) : (
          <EventAvailableIcon />
        )}
        <div className={styles.activityLogAppointmentHeaderText}>
          Appointment scheduled for &nbsp;
          <b>{date}</b>
          &nbsp; at &nbsp;
          <b>{time}</b>
        </div>
        {confirmed_date ? (
          <div style={{ marginLeft: 'auto' }}>
            <CustomTooltip
              title={`Appointment marked as confirmed at ${confirmed_date}`}
              color="#000000"
              maxWidth={500}
              placement="top-end"
              className="appointment-confirmed-tooltip"
              style={{ cursor: 'pointer' }}
            >
              <CheckCircleSharpIcon htmlColor="#3BAA53" />
            </CustomTooltip>
          </div>
        ) : null}
      </div>
      <hr />
      <div className={styles.activityLogAppoinmentBody}>
        <table>
          <tbody>
            <tr>
              <td className={styles.activityLogAppoinmentLabel}>Patient:</td>
              <td>
                <span>{`${firstname || ''} ${lastname || ''}`}</span>
              </td>
            </tr>
            <tr>
              <td className={styles.activityLogAppoinmentLabel}>Provider:</td>
              <td>
                <span>{provider}</span>
              </td>
            </tr>
            <tr>
              <td className={styles.activityLogAppoinmentLabel}>Procedures:</td>
              <td>
                <span>{procedures}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentActivityLog;
