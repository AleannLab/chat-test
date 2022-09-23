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

const UnscheduledFamily = ({ data }) => {
  const tableColumns = [
    {
      id: 'guarantor',
      label: 'Patient Coming In Today',
      width: '50%',
    },
    {
      id: 'patient',
      label: 'Unscheduled Relative',
      width: '50%',
    },
  ];

  function createData(patientId, patientName, guarantorId, guarantorName) {
    const patient = <UserAvatar id={patientId} userName={patientName} />;

    const guarantor = <UserAvatar id={guarantorId} userName={guarantorName} />;

    return {
      id: patientId,
      guarantor,
      patient,
    };
  }

  let rows = data.map(
    ({ patientId, patientName, guarantorId, guarantorName }) => {
      return createData(patientId, patientName, guarantorId, guarantorName);
    },
  );

  return (
    <div>
      <div className={styles.subTitle}>
        The {rows.length} patients coming in today have unscheduled family
        members with outstanding procedures.
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

export default UnscheduledFamily;
