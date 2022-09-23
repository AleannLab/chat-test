import React, { useState } from 'react';
import styles from './Users.module.css';
// import { ReactComponent as CallMergeIcon } from 'assets/images/call-merge.svg';
import DialerRoundButton from './DialerRoundButton';
import { Scrollbars } from 'react-custom-scrollbars';
// import { ReactComponent as MoveRightIcon } from "assets/images/move-right.svg";
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { useStores } from 'hooks/useStores';
import { observer, useObserver } from 'mobx-react-lite';
import { LinearProgress } from '@material-ui/core';
import { useQuery } from 'react-query';
import { ReactComponent as HardwarePhoneIcon } from 'assets/images/telephone.svg';

const Users = observer(({ onSubmit, icon }) => {
  const { users } = useStores();

  const [selectedUser, setSelectedUser] = useState(null);

  const [searchText, setSearchText] = React.useState('');

  const { data: usersData, isLoading } = useQuery(
    'usersWithPhoneAccess',
    () => users.getUsersWithPhoneAccess(),
    {
      select: (data) =>
        data.filter(({ fullname }) =>
          fullname.trim().toLowerCase().includes(searchText),
        ),
    },
  );

  return useObserver(() => (
    <div>
      <div className={styles.searchBoxContainer}>
        <SearchIcon className={styles.searchBoxIcon} />
        <InputBase
          className={styles.searchText}
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {isLoading && <LinearProgress />}
      <div className={styles.userListContainer}>
        <Scrollbars
          style={{ height: '100%' }}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...style,
                width: 6,
                backgroundColor: '#DDDDDD',
                borderRadius: '10px',
                opacity: 0.15,
                cursor: 'pointer',
              }}
            />
          )}
        >
          {usersData?.map((user, index) => (
            <div
              key={index}
              className={`${styles.userItem} ${
                user === selectedUser ? styles.selectedUserItem : ''
              }`}
              onClick={() =>
                setSelectedUser(user === selectedUser ? null : user)
              }
            >
              {user.mac_address ? <HardwarePhoneIcon className="me-2" /> : null}
              <span>{user.fullname}</span>
              {/* <MoveRightIcon className="ms-auto" /> */}
            </div>
          ))}
        </Scrollbars>
      </div>
      <div className="mt-3 row no-gutters align-items-center">
        <div className="col-4" />
        <div className="col-4 d-flex justify-content-center">
          <DialerRoundButton
            icon={icon}
            backgroundColor={selectedUser ? '#1ABA17' : '#ffffff45'}
            onClick={
              selectedUser === null
                ? null
                : () => {
                    onSubmit({
                      sip_username: selectedUser.id,
                      username: selectedUser.fullname,
                    });
                  }
            }
          />
        </div>
      </div>
    </div>
  ));
});

export default Users;
