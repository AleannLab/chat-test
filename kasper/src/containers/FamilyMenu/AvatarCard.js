import React from 'react';
import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Avatar from 'components/Avatar';

const useStyles = makeStyles({
  container: {
    display: 'flex',
  },
  textContent: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '10px',
  },
  primaryContent: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '18px',
    color: '#02122F',
  },
  secondaryContent: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    color: '#999999',
  },
});

const sizeChart = {
  sm: '40px',
  md: '50px',
};

export default function AvatarCard({
  id,
  firstName,
  lastName,
  textInfo,
  size,
}) {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Avatar
        id={id}
        firstName={firstName}
        lastName={lastName}
        width={sizeChart[size]}
        height={sizeChart[size]}
      />
      <div className={styles.textContent}>
        <div
          className={styles.primaryContent}
        >{`${firstName} ${lastName}`}</div>
        <p className={styles.secondaryContent}>{textInfo}</p>
      </div>
    </div>
  );
}

AvatarCard.defaultProps = {
  size: 'md',
  textInfo: '',
};

AvatarCard.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  size: PropTypes.string,
  textInfo: PropTypes.string,
};
