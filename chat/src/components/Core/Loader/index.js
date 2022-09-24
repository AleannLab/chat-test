import React from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import LoaderIcon from 'assets/images/loader.gif';

const Loader = ({ children, show, message, showMessage }) => {
  return (
    <div className={styles.container}>
      {show ? (
        <div className={styles.loaderContainer}>
          <img src={LoaderIcon} alt="loader" />
          {showMessage ? <div>{message}</div> : null}
        </div>
      ) : (
        <div className={styles.childContainer}>{children}</div>
      )}
    </div>
  );
};

Loader.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string,
  showMessage: PropTypes.bool,
};

Loader.defaultProps = {
  show: true,
  message: 'Loading...',
  showMessage: true,
};

export default Loader;
