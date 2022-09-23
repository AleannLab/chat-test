import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { ReactComponent as NoDataIcon } from 'assets/images/form-with-pencil.svg';

const useStyles = makeStyles(() => ({
  wrapper: {
    backgroundColor: '#f0f3f8',
    width: '51px',
    height: '51px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const NoDataAvailable = ({ icon, message }) => {
  const styles = useStyles();
  return (
    <div className="h-100 d-flex align-items-center justify-content-center flex-column">
      <div className={styles.wrapper}>{icon || <NoDataIcon />}</div>
      {message && (
        <Typography
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#999999',
            marginTop: '1rem',
          }}
        >
          {message}
        </Typography>
      )}
    </div>
  );
};

export default NoDataAvailable;
