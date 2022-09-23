import React from 'react';
import styles from './index.module.css';
import { buildWaitTime } from './helper';
import { convertCustomTime } from 'helpers/timezone';

export default function WaitTimePopover({ item }) {
  return (
    <div className={styles.container}>
      <div>
        <strong>Appointment time:</strong>
        <span>
          {convertCustomTime({
            dateTime: item.appointment_time,
            format: 'h:mm A',
          })}
        </span>
      </div>
      <div>
        <strong>Arrival time:</strong>
        <span>
          {convertCustomTime({ dateTime: item.arrival_time, format: 'h:mm A' })}
        </span>
      </div>
      <div>
        <strong>Total waited time:</strong>
        <span>{buildWaitTime(item.arrival_time)}</span>
      </div>
    </div>
  );
}
