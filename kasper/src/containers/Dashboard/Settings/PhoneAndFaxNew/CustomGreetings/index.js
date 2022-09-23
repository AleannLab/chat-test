import { Button, LinearProgress } from '@material-ui/core';
import React from 'react';
import Table from 'components/Core/Table';
import styles from './index.module.css';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';

const tableColumns = [
  {
    id: 'category',
    label: 'Category',
    width: '20%',
    disablePadding: false,
  },
  {
    id: 'greetings',
    label: 'Greetings',
    width: '60%',
    disablePadding: false,
    align: 'center',
  },
  {
    id: 'action',
    label: 'Action',
    numeric: false,
    width: '20%',
    disablePadding: false,
    align: 'center',
  },
];
const CustomGreetings = () => {
  const { customGreetings, notification } = useStores();

  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/custom-greetings',
  );
  const { data: greetingData = [], isLoading } = useQuery(
    'getCustomGreetings',
    () => customGreetings.getCustomGreetings(),
    {
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the number list.',
        );
      },
    },
  );

  const createData = (type, id, count) => {
    const newType = type.replace(' ', '-');
    const action = (
      <Button
        type="button"
        className={`secondary-btn ${styles.editButton}`}
        variant="outlined"
        color="secondary"
        onClick={() =>
          history.push(`${match.url}/edit-greetings/${newType}/${id}`)
        }
      >
        Edit
      </Button>
    );
    return { type, count, action };
  };

  const tableRows = greetingData.map(({ type, id, count }) => {
    return createData(type, id, count);
  });
  return (
    <div className={styles.root}>
      <div className={styles.header}>Custom Greetings</div>
      <div className={styles.info}>
        Greetings can be used for various circumstances to inform callers about
        your status. You may assign one <strong> default greeting</strong> per
        category for each phone number. Miscellaneous greetings can be uploaded
        for unique cases.
      </div>

      <div className={styles.tableContainer}>
        {isLoading && (
          <LinearProgress
            color="secondary"
            className={styles.tableProgressBar}
          />
        )}

        <Table
          columns={tableColumns}
          rows={tableRows}
          isSelectable={false}
          height={600}
          isEmpty={!isLoading && !greetingData.length}
          emptyText="No greetings found"
        />
      </div>
    </div>
  );
};

export default CustomGreetings;
