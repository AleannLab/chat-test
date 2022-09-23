import { Button, IconButton, LinearProgress } from '@material-ui/core';
import { Check, Settings } from '@material-ui/icons';
import Table from 'components/Core/Table';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import PhoneNumber from 'awesome-phonenumber';
import { ReactComponent as NoCallsIcon } from 'assets/images/no-calls-selected.svg';
import styles from './index.module.css';

const COLUMNS = [
  { id: 'number', width: '20%', disablePadding: false, label: 'Number' },
  {
    id: 'status',
    width: '30%',
    disablePadding: false,
    label: 'Status',
    align: 'center',
  },
  {
    id: 'schedule',
    width: '30%',
    disablePadding: false,
    label: 'Inbound Call Schedule',
    align: 'center',
  },
  {
    id: 'action',
    width: '30%',
    disablePadding: false,
    label: 'Settings',
    align: 'center',
  },
];

const createDataItem = (item, action, scheduleAction) => {
  const ayt = PhoneNumber.getAsYouType('US');
  const { number, number_type, default: isDefault } = item;
  const formattedNumber = '+1 ' + ayt.reset(number.toString().split('+1')[1]);
  const numberItem = (
    <div className="d-flex flex-column">
      <span>{formattedNumber}</span>
      {isDefault ? (
        <span
          style={{
            fontSize: 11,
            color: '#3baa53',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Check style={{ fontSize: 12, marginBottom: 2 }} /> Default
        </span>
      ) : null}
    </div>
  );

  const statusItem = <span>{number_type}</span>;

  const scheduleItem = (
    <Button
      onClick={scheduleAction}
      variant="outlined"
      color="secondary"
      style={{ width: '50%' }}
    >
      View/Edit
    </Button>
  );
  const settings = (
    <IconButton onClick={action}>
      <Settings style={{ color: '#9a9a9a' }} />
    </IconButton>
  );

  return { numberItem, statusItem, scheduleItem, settings };
};

const PhoneNumbers = () => {
  const { incomingCalls, notification } = useStores();
  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing',
  );

  const { data: numbers = [], isLoading } = useQuery(
    ['voiceNumbers'],
    () => incomingCalls.getNumbers(),
    {
      onError: (error) => {
        notification.showError(error.message);
      },
    },
  );

  const NoPhonesText = (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
      <div className="p-3">
        <NoCallsIcon />
      </div>
      <div className={styles.noMessageText}>No phone numbers available</div>
    </div>
  );

  return (
    <>
      {isLoading && <LinearProgress color="secondary" />}
      {!isLoading && !numbers.length ? (
        NoPhonesText
      ) : (
        <Table
          noScroll={true}
          columns={COLUMNS}
          rows={numbers?.map((item) =>
            createDataItem(
              item,
              () =>
                history.push(
                  `${match.url}/settings/${item.number}/${item.uuid}`,
                ),
              () => history.push(`${match.url}/schedule/${item.number}`, item),
            ),
          )}
          sortBy={COLUMNS[0].id}
          isEmpty={!isLoading && !numbers.length}
          allowSelectAll={false}
          isSelectable={false}
        />
      )}
    </>
  );
};

export default PhoneNumbers;
