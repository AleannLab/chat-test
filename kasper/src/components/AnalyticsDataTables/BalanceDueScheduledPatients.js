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

const BalanceDueScheduledPatients = ({ data }) => {
  const tableColumns = [
    {
      id: 'patient',
      label: 'Patient',
      width: '50%',
    },
    {
      id: 'balanceDue',
      label: 'Balance Due',
      width: '50%',
    },
  ];

  function createData(patientId, patientName, balanceDue) {
    const patient = <UserAvatar id={patientId} userName={patientName} />;
    return {
      id: patientId,
      patient,
      balanceDue: convertToCurrency(balanceDue),
    };
  }

  const rows = data.map(({ patientId, patientName, balanceDue }) => {
    return createData(patientId, patientName, balanceDue);
  });

  const totalDues = data.reduce((acc, curr) => acc + curr.balanceDue, 0);

  return (
    <div>
      <div className={styles.subTitle}>
        The below {rows.length} patients have unpaid balances totaling{' '}
        {convertToCurrency(totalDues)}.
      </div>
      <div className={styles.container}>
        <Table
          isSelectable={false}
          allowSelectAll={false}
          columns={tableColumns}
          rows={rows}
        />
      </div>
      <div className={styles.totalContainer}>
        <div className={styles.label}>TOTAL</div>
        <div className={styles.value}>{convertToCurrency(totalDues)}</div>
      </div>
    </div>
  );
};

export default BalanceDueScheduledPatients;
