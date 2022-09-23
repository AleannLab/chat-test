import React, { useState, useRef, useMemo, useEffect } from 'react';
import styles from './index.module.css';
import InputBase from '@material-ui/core/InputBase';
import PhoneNumber from 'awesome-phonenumber';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import Skeleton from '@material-ui/lab/Skeleton';
import ChatIcon from '@material-ui/icons/Chat';
import { normalizeNumber } from 'helpers/misc';

const PatientsLoader = () =>
  [...new Array(2)].map((a, index) => {
    return (
      <div key={index} className="d-flex m-2">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-grow-1 d-flex flex-column m-2">
          <Skeleton variant="text" height={14} width="80%" />
          <Skeleton variant="text" height={14} width="60%" />
        </div>
      </div>
    );
  });

const PhoneNumberInput = () => {
  const { patients, patientsFeed } = useStores();
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [phoneNumberDisplayValue, setPhoneNumberDisplayValue] = useState('');
  const [userSuggestionsOpen, setUserSuggestionOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  var ayt = PhoneNumber.getAsYouType('US');
  const anchorRef = useRef(null);

  useEffect(() => {
    return () => {
      patients.setFilters(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phoneNumber) {
      setLoading(true);
      const timeout = setTimeout(() => {
        patients.setFilters({ search: phoneNumber });
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [phoneNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(patients.loading);
  }, [patients.loading]);

  const filteredPatients = useMemo(() => {
    return patients.pagerData.map((id) => {
      return patients.get([{}, id]);
    });
  }, [patients.pagerData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhoneNumberChange = (event) => {
    const inputValue = normalizeNumber(event.target.value);
    setPhoneNumberDisplayValue(ayt.reset(normalizeNumber(inputValue)));
    const number = inputValue.length ? `+1${inputValue}` : '';

    const ph = new PhoneNumber(event.target.value, 'US');
    if (ph.isValid()) {
      patientsFeed.setNewSMSPhoneNumber(number);
      setUserSuggestionOpen(false);
    } else {
      // Disable text input field to prevent sending SMS to previously entered number
      patientsFeed.setNewSMSPhoneNumber(null);
    }
    setPhoneNumber(number);
    if (number && number.length) {
      !userSuggestionsOpen && setUserSuggestionOpen(true);
    } else {
      setUserSuggestionOpen(false);
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setUserSuggestionOpen(false);
  };

  const handleUserSelect = (user) => {
    user.displayName = user.firstname + ' ' + user.lastname;
    patientsFeed.setNewSMSPhoneNumber(null);
    patientsFeed.setIsNewSMS(false);
    patientsFeed.setSelectedPatient(user);
    setUserSuggestionOpen(false);
  };

  const handleNewNumberSelect = () => {
    patientsFeed.setNewSMSPhoneNumber(phoneNumber);
    setUserSuggestionOpen(false);
  };

  return (
    <div className={styles.phoneNumInputContainer}>
      <span>+1</span>
      <InputBase
        inputProps={{ maxLength: 14 }}
        autoFocus
        value={phoneNumberDisplayValue}
        className={styles.phoneNumInputText}
        placeholder="Start Typing Number"
        onChange={handlePhoneNumberChange}
        ref={anchorRef}
      />

      <Popper
        open={userSuggestionsOpen}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement="bottom-start"
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
            <Paper
              elevation={4}
              style={{
                maxHeight: 350,
                minWidth: 350,
                maxWidth: 350,
                overflow: 'auto',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList className="p-0">
                  <MenuItem key="new-number" onClick={handleNewNumberSelect}>
                    <div className="d-flex">
                      <ChatIcon style={{ color: '#9A9A9A' }} />
                      <div className="ms-3">
                        Send to {phoneNumberDisplayValue}
                      </div>
                    </div>
                  </MenuItem>
                  <hr className="m-0" />
                  {loading ? (
                    <PatientsLoader />
                  ) : (
                    <div className={styles.menuItemContainer}>
                      {filteredPatients.length ? (
                        <>
                          <div className={styles.allContactText}>
                            ALL CONTACTS
                          </div>
                          {filteredPatients.map((user, index) => (
                            <MenuItem
                              key={index}
                              onClick={() => handleUserSelect(user)}
                              value=""
                              className={styles.menuItem}
                            >
                              <div className="d-flex">
                                <Avatar
                                  className={styles.userAvatar}
                                  id={user.id}
                                  firstName={user.firstname}
                                  lastName={user.lastname}
                                  mobileNo={user.phone_no}
                                />
                                <div className="ms-3">
                                  <div>
                                    {user.firstname} {user.lastname}
                                  </div>
                                  <div>{user.phone_no}</div>
                                </div>
                              </div>
                            </MenuItem>
                          ))}
                        </>
                      ) : null}
                    </div>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default observer(PhoneNumberInput);
