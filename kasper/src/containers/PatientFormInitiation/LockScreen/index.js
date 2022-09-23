import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';

import { useStores } from 'hooks/useStores';
import { useAuthenticated } from 'hooks/useAuthenticated';
import Notification from 'components/Notification';
import { ReactComponent as PoweredByKasper } from 'assets/images/powered-by-kasper.svg';
import { ReactComponent as PasswordFilledDot } from 'assets/images/password-filled-dot.svg';
import { ReactComponent as PasswordEmptyDot } from 'assets/images/password-empty-dot.svg';
import styles from './index.module.css';

const PIN_LENGTH = 4;

const LockScreen = () => {
  useAuthenticated();
  const [password, setPassword] = useState('');
  const { formInitiation, notification } = useStores();
  const history = useHistory();

  const keypad = [
    { id: 1, label: '1', value: '1' },
    { id: 2, label: '2', value: '2' },
    { id: 3, label: '3', value: '3' },
    { id: 4, label: '4', value: '4' },
    { id: 5, label: '5', value: '5' },
    { id: 6, label: '6', value: '6' },
    { id: 7, label: '7', value: '7' },
    { id: 8, label: '8', value: '8' },
    { id: 9, label: '9', value: '9' },
    { id: 10, label: null, value: null },
    { id: 11, label: '0', value: 0 },
    { id: 12, label: 'Cancel', value: 'Cancel' },
  ];

  const handleKeypadClick = async (value) => {
    if (value === 'Cancel') {
      setPassword('');
    } else {
      setPassword(password.concat(value));
      if (password.concat(value).length === PIN_LENGTH) {
        try {
          const response = await formInitiation.verifyPin(
            password.concat(value),
          );
          if (response.data) {
            formInitiation.setIsAuthorized(true);
            history.replace('/forms');
          } else {
            formInitiation.setIsAuthorized(false);
            notification.showError('The entered pin is incorrect');
            setTimeout(() => {
              notification.hideNotification();
              setPassword('');
            }, 2000);
          }
        } catch (err) {
          notification.showError(err.message);
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ height: '100%' }}>
        <div className={styles.contentContainer}>
          <span className={styles.title}>
            Please enter PIN to return to Patient selection list
          </span>
        </div>
        <Grid container justify="center" className="mt-4">
          <Grid item xs={4} />
          <Grid container item xs={4}>
            <Grid
              container
              item
              xs={12}
              style={{ marginTop: '45px', marginBottom: '90px' }}
              justify="space-evenly"
            >
              {Array.apply(null, Array(PIN_LENGTH)).map((ele, index) => (
                <Grid key={index} item>
                  {password.length === 0 ? (
                    <PasswordEmptyDot />
                  ) : index + 1 <= password.length ? (
                    <PasswordFilledDot />
                  ) : (
                    <PasswordEmptyDot />
                  )}
                </Grid>
              ))}
            </Grid>
            {keypad.map((ele) => (
              <Grid
                item
                xs={4}
                key={ele.id}
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {ele.label === 'Cancel' ? (
                  password.length === PIN_LENGTH ? null : (
                    <span
                      className={styles.cancel}
                      onClick={() => handleKeypadClick(ele.value)}
                    >
                      {ele.label}
                    </span>
                  )
                ) : (
                  <Fab
                    disabled={password.length === PIN_LENGTH}
                    size="large"
                    style={{
                      boxShadow: 'none',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D2D2D2',
                      visibility: ele.label === null ? 'hidden' : 'visible',
                    }}
                    onClick={() => handleKeypadClick(ele.value)}
                  >
                    <span className={styles.number}>{ele.label}</span>
                  </Fab>
                )}
              </Grid>
            ))}
          </Grid>
          <Grid item xs={4} />
        </Grid>
      </div>
      <div className={styles.kapsperLogo}>
        <PoweredByKasper />
      </div>
      <Notification />
    </div>
  );
};

export default observer(LockScreen);
