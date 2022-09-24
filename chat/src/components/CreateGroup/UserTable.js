import { InputBase, LinearProgress } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import styles from './UserTable.module.css';
import Scrollbars from 'react-custom-scrollbars';
import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import HardwarePhoneIcon from 'assets/images/telephone.svg';
import { useAuthToken } from 'hooks/useAuthToken';

const UserTable = ({
  heading,
  rows,
  selected,
  onRowClick,
  disabled,
  loading,
  isEmpty,
  emptyText,
}) => {
  const [searchText, setSearchText] = useState('');
  const { utils } = useStores();
  const authToken = useAuthToken();

  const createDataItem = (id, name, displayImage, macAddress) => {
    const [firstName, lastName] = name.trim().split(' ');
    const userImg =
      utils.prepareMediaUrl({ uuid: displayImage, authToken }) ?? '';
    const avatar = (
      <span title={macAddress && 'Hardware Phone'}>
        <Avatar
          className={macAddress && 'p-2'}
          src={macAddress ? HardwarePhoneIcon : userImg}
          firstName={firstName}
          id={parseInt(id) ?? 100}
          lastName={lastName}
        />
      </span>
    );
    const userName = (
      <div className="d-flex align-items-center">
        {avatar}
        <span className={styles.name}>{name}</span>
      </div>
    );
    return { id, userName };
  };

  const filteredRows = useMemo(() => {
    return (
      searchText.length
        ? rows.filter((row) => {
            const fullName = row.fullname;

            return fullName
              .toLowerCase()
              .trim()
              .includes(searchText.toLowerCase().trim());
          })
        : rows
    ).map(({ userUuid, fullname, displayImage, mac_address }) =>
      createDataItem(userUuid, fullname, displayImage, mac_address),
    );
  }, [searchText, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSelected = (id) => selected.includes(id);

  return (
    <div className="d-flex flex-column w-100 mt-4 mb-4">
      <p className={styles?.subTitle}>{heading}</p>
      <div className={styles?.searchBar}>
        <SearchIcon className="me-1" />
        <InputBase
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
          }}
          className={styles?.inputBox}
          placeholder="Search..."
          disabled={disabled}
        />
      </div>
      <div className={styles?.table}>
        <Scrollbars
          hidden={isEmpty}
          renderTrackHorizontal={(props) => <div {...props} />}
        >
          {loading && (
            <LinearProgress
              color="secondary"
              className={styles?.tableProgressBar}
            />
          )}

          {!filteredRows.length && rows.length && !loading ? (
            <span className={styles.emptyMessage}>No Users Found!</span>
          ) : null}

          {!isEmpty &&
            !loading &&
            filteredRows.map((row) => (
              <div
                role="button"
                onClick={() => onRowClick(row.id)}
                className={isSelected(row.id) ? styles.selectedRow : styles.row}
                key={row.id}
              >
                {row.userName}
              </div>
            ))}
        </Scrollbars>
        {isEmpty && <span className={styles.emptyMessage}>{emptyText}</span>}
      </div>
    </div>
  );
};

export default UserTable;
