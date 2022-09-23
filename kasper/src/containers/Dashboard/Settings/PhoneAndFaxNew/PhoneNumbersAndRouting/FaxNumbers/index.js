import { LinearProgress } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import Table from 'components/Core/Table';
import { useStores } from 'hooks/useStores';
import React from 'react';
import { useQuery } from 'react-query';
import PhoneNumber from 'awesome-phonenumber';
import { ReactComponent as NoFaxIcon } from 'assets/images/no-fax-selected.svg';
import styles from './index.module.css';

const COLUMNS = [
  { id: 'number', width: '80%', disablePadding: false, label: 'Number' },
];

const createDataItem = (item) => {
  const ayt = PhoneNumber.getAsYouType('US');
  const { number, default: isDefault = false } = item;
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

  return { numberItem };
};

const FaxNumbers = () => {
  const { notification, incomingCalls } = useStores();
  const { data: faxNumbers = [], isLoading: loadingFaxNumbers } = useQuery(
    ['faxNumbers'],
    () => incomingCalls.getFaxNumbers(),
    {
      onError: (error) => {
        notification.showError(error.message);
      },
    },
  );

  const NoFaxText = (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <div className="p-3">
        <NoFaxIcon />
      </div>
      <div className={styles.noMessageText}>No fax numbers available</div>
    </div>
  );
  return (
    <>
      {loadingFaxNumbers && <LinearProgress color="secondary" />}
      {!loadingFaxNumbers && !faxNumbers.length ? (
        NoFaxText
      ) : (
        <Table
          noScroll={true}
          columns={COLUMNS}
          rows={faxNumbers?.map((item) => createDataItem(item))}
          sortBy={COLUMNS[0].id}
          emptyText={NoFaxText}
          allowSelectAll={false}
          isSelectable={false}
          isEmpty={!loadingFaxNumbers && !faxNumbers.length}
        />
      )}
    </>
  );
};

export default FaxNumbers;
