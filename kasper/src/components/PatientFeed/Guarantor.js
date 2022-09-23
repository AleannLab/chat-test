import { makeStyles } from '@material-ui/core';
import React from 'react';
import { ReactComponent as GuarantorIcon } from 'assets/images/guarantor.svg';

const useStyles = makeStyles({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
    bottom: '0',
    left: '0',
    zIndex: '1',
    background: 'linear-gradient(238.22deg, #5739B8 -52.33%, #F1709D 90.37%)',
    border: '0.4px solid #243656',
  },
});
const Guarantor = () => {
  const styles = useStyles();
  return (
    <div className={styles.icon}>
      <GuarantorIcon width="10px" height="10px" />
    </div>
  );
};

export default Guarantor;
