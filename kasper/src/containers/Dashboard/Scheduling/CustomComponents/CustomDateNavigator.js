import React from 'react';
import styles from '../index.module.css';
import { DateNavigator } from '@devexpress/dx-react-scheduler-material-ui';
import IconButton from '@material-ui/core/IconButton';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import moment from 'moment';

const CustomDateNavigator = ({ navigatorText, ...restProps }) => {
  return (
    <div className="d-flex align-items-center">
      <IconButton
        aria-label="back"
        size="small"
        {...restProps}
        onClick={() => restProps.onNavigate('back')}
        className={styles.dateNavigationButton}
      >
        <ArrowLeftIcon />
      </IconButton>
      <DateNavigator.Root
        {...restProps}
        className="mx-4"
        navigationButtonComponent={() => <></>}
        navigatorText={moment(navigatorText).format('dddd, MMMM D, YYYY')}
      />
      <IconButton
        aria-label="forward"
        size="small"
        {...restProps}
        onClick={() => restProps.onNavigate('forward')}
        className={styles.dateNavigationButton}
      >
        <ArrowRightIcon />
      </IconButton>
    </div>
  );
};

export default React.memo(CustomDateNavigator);
