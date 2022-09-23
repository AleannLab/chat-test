import React, { Suspense } from 'react';
import Switch from 'components/Core/Switch';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
} from '@material-ui/core';
import Accordion from 'components/Core/Accordion';
import styles from './index.module.css';
import Timer from 'react-compound-timer';

const NotificationSettingAccordion = ({ notificationData }) => {
  const {
    isLoading,
    values,
    handleChange,
    changeRadioValue,
    TIME_INTERVALS,
    changeMuteAllSoundPopup,
    setFieldValue,
    switchLabel,
    switchKey,
    radioKey,
    remainingTime,
  } = notificationData;

  const RadioGroupWrapper = [
    {
      section: [
        { label: TIME_INTERVALS.firstTime },
        { label: TIME_INTERVALS.secondTime },
        { label: TIME_INTERVALS.thirdTime },
      ],
    },
    {
      section: [
        { label: TIME_INTERVALS.fourthTime },
        { label: TIME_INTERVALS.fifthTime },
        { label: TIME_INTERVALS.sixthTime },
      ],
    },
  ];

  return (
    <Accordion
      name="panel1"
      header={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className={`ms-2 ${styles.text}`}>
            {switchLabel}
            {remainingTime != '' ? (
              remainingTime != TIME_INTERVALS.sixthTime ? (
                <Timer initialTime={remainingTime} direction="backward">
                  {({ getTime }) => {
                    const minutes = getTime() / 1000 / 60;
                    const hours = minutes / 60;
                    return (
                      <>
                        <span className={styles.remainingTime}>
                          {` (`}
                          <>
                            {parseInt(hours) !== 0 && (
                              <>
                                <Timer.Hours />h
                              </>
                            )}{' '}
                            {parseInt(minutes) !== 0 && (
                              <>
                                <Timer.Minutes />
                                min
                              </>
                            )}{' '}
                            <Timer.Seconds />
                            sec
                          </>
                          )
                        </span>
                      </>
                    );
                  }}
                </Timer>
              ) : (
                <span
                  className={`${styles.remainingTime} ${styles.capitalize}`}
                >
                  {` (${remainingTime})`}
                </span>
              )
            ) : null}
          </span>
          <span>
            <Switch
              disabled={isLoading}
              checked={values[switchKey]}
              className={styles.switch}
              name={switchKey}
              onChange={(e) => {
                handleChange(e);
                changeRadioValue(
                  e.target.checked,
                  setFieldValue,
                  e.target.name,
                );
              }}
            />
          </span>
        </div>
      }
      body={
        <Suspense fallback="Loading content...">
          <FormControl>
            <RadioGroup
              value={values[radioKey]}
              name={radioKey}
              onChange={(e) => {
                handleChange(e);
                changeMuteAllSoundPopup(values, setFieldValue, radioKey);
              }}
            >
              <div className={styles.radioWrapper}>
                {RadioGroupWrapper.map((parentRadioItem, parentIndex) => (
                  <div
                    className={
                      parentIndex === 0
                        ? styles.radioColumn
                        : styles.radioColumn1
                    }
                    key={parentIndex}
                  >
                    {parentRadioItem.section.map((formItem, formIndex) => (
                      <FormControlLabel
                        key={formIndex}
                        value={formItem.label}
                        control={<Radio disabled={isLoading} />}
                        label={
                          <Typography
                            className={`${
                              formItem.label === TIME_INTERVALS.sixthTime &&
                              styles.capitalize
                            } ${styles.formControlLabel}`}
                          >
                            {formItem.label}
                          </Typography>
                        }
                        className={styles.label}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </FormControl>
        </Suspense>
      }
    />
  );
};

export default NotificationSettingAccordion;
