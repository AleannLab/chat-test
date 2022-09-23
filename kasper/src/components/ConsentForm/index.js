import React from 'react';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import Skeleton from '@material-ui/lab/Skeleton';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import DisclosureInfo from './DisclosureInfo';
import { ReactComponent as PoweredByKasper } from 'assets/images/powered-by-kasper.svg';
import styles from './index.module.css';

const ConsentForm = (props) => {
  const { paperlessForm } = useStores();

  const handleOpenDisclosure = () => {
    paperlessForm.setOpenDisclosure(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.greetUser}>Hi!</span>
        <span className={styles.info}>
          Welcome to our <strong>practice</strong>. We have a few forms for you
          to fill out to give you the best experience possible.
        </span>
        <span className={styles.encryption}>
          Your answers will be encrypted and sent securely to the office.
        </span>
        <span className={styles.consentText}>
          By filling out these paperless forms, you agree to our{' '}
          <span
            className={styles.popupLink}
            onClick={() => handleOpenDisclosure()}
          >
            electronic records and signatures disclosure.
          </span>
        </span>
        <Button
          className={clsx(styles.agreeButton, 'secondary-btn')}
          variant="contained"
          color="secondary"
        >
          I Agree
        </Button>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>
            If you have questions, please call
            {props.phoneNo ? (
              <a href={`tel:${props.phoneNo}`} className={styles.phone}>
                <strong> {props.phoneNo} </strong>
              </a>
            ) : (
              <Skeleton
                className="d-inline-flex"
                variant="text"
                width={100}
                height={20}
              />
            )}
            {/* Commented due to KAS-2060 */}
            {/* or email
            <a className={styles.email} href={`mailto:${props.email}`}>
              {props.email ? (
                ' ' + props.email + ' '
              ) : (
                <Skeleton
                  className="d-inline-flex"
                  variant="text"
                  width={100}
                  height={20}
                />
              )}
            </a> */}
          </div>
          <div className={styles.logo}>
            <PoweredByKasper />
          </div>
        </div>
      </div>
      {paperlessForm.openDisclosure ? <DisclosureInfo /> : null}
    </div>
  );
};

export default observer(ConsentForm);
