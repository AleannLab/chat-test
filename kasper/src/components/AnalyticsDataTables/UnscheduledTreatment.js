import React from 'react';
import Table from 'components/Core/Table';
import Avatar from '@material-ui/core/Avatar';
import { generateColor, convertToCurrency } from 'helpers/misc';
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

const UnscheduledTreatment = ({ data }) => {
  const tableColumns = [
    {
      id: 'patient',
      label: 'Patient',
      width: '50%',
    },
    {
      id: 'potentialFees',
      label: 'Potential Fees',
      width: '50%',
    },
  ];

  function createData(patientId, patientName, potentialFees) {
    const patient = <UserAvatar id={patientId} userName={patientName} />;
    return {
      id: patientId,
      patient,
      potentialFees: convertToCurrency(potentialFees),
    };
  }

  let rows = data.map(({ patientId, patientName, potentialFees }) => {
    return createData(patientId, patientName, potentialFees);
  });

  return (
    <div>
      <div className={styles.subTitle}>
        The below {rows.length} patients are scheduled today, but have
        additional treatments that are not yet scheduled.
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

export default UnscheduledTreatment;
