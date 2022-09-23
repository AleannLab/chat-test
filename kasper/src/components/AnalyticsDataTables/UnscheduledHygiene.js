import React from 'react';
import Table from 'components/Core/Table';
import Avatar from '@material-ui/core/Avatar';
import { generateColor } from 'helpers/misc';
import styles from './index.module.css';

const UserAvatar = ({ id, userName }) => {
  const [firstName, lastName] = userName.split(' ');
  const avatarInitials =
    (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '');

  return (
    <div className={styles.avatarName}>
      <Avatar style={{ backgroundColor: generateColor(id) }}>
        <span className={styles.avatarInitials}>{avatarInitials}</span>
      </Avatar>
      <span className={styles.name}>{userName}</span>
    </div>
  );
};

const unscheduledHygiene = ({ data }) => {
  const tableColumns = [
    {
      id: 'patient',
      label: 'Patient',
      width: '100%',
    },
    // {
    //   id: 'potentialFees',
    //   label: 'Potential Fees',
    //   width: '50%',
    // },
  ];

  function createData(patientId, patientName) {
    const patient = <UserAvatar id={patientId} userName={patientName} />;
    return {
      id: patientId,
      patient,
    };
  }

  let rows = data.map(({ patientId, patientName }) => {
    return createData(patientId, patientName);
  });

  return (
    <div>
      <div className={styles.subTitle}>
        The below {rows.length} patients are scheduled today, but have
        unscheduled hygiene appointments.
      </div>
      <div className={styles.container}>
        <Table
          isSelectable={false}
          allowSelectAll={false}
          columns={tableColumns}
          rows={rows}
        />
      </div>
    </div>
  );
};

export default unscheduledHygiene;
