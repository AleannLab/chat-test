import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react';
import moment from 'moment';

import { useStores } from 'hooks/useStores';
import ConfigSkeleton from './ConfigSkeleton';
import TimeChip from 'components/TimeChip';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import styles from './index.module.css';

const Options = () => {
  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/out-of-office',
  );

  const awayGreetingOptionValues = [
    { id: 1, label: 'Always play', value: 'always' },
    {
      id: 2,
      label: 'Play when we are closed or on vacation',
      value: 'closed_or_vacation',
    },
    { id: 3, label: 'Never play', value: 'never' },
  ];

  const openHoursOptionValues = [
    { id: 1, label: 'Custom Schedule', value: 'custom' },
    { id: 2, label: '24/7', value: '24_7' },
  ];

  const [awayGreetingOption, setAwayGreetingOption] = useState('');
  const [openHoursOption, setOpenHoursOption] = useState('');
  const [timingsSaved, setTimingsSaved] = useState(true);

  // Sunday is given id 0 since moment uses 0 for Sunday
  const schedules = [
    { id: 0, day: 'Sunday', label: 'SUN', timings: [], timingsCount: null },
    { id: 1, day: 'Monday', label: 'MON', timings: [], timingsCount: null },
    { id: 2, day: 'Tuesday', label: 'TUE', timings: [], timingsCount: null },
    { id: 3, day: 'Wednesday', label: 'WED', timings: [], timingsCount: null },
    { id: 4, day: 'Thursday', label: 'THU', timings: [], timingsCount: null },
    { id: 5, day: 'Friday', label: 'FRI', timings: [], timingsCount: null },
    { id: 6, day: 'Saturday', label: 'SAT', timings: [], timingsCount: null },
  ];
  const { phoneFaxOptions, notification } = useStores();
  const aggregateSchedules = [];

  useEffect(() => {
    phoneFaxOptions.resetConfigOptions();
    phoneFaxOptions
      .fetchConfig()
      .then(() => {
        setAwayGreetingOption(phoneFaxOptions.configOptions[0].value);
        setOpenHoursOption(phoneFaxOptions.configOptions[1].value);
      })
      .catch((e) => {
        notification.showError(e.message);
      });
    phoneFaxOptions.fetchSchedule().catch((e) => {
      notification.showError(e.message);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (awayGreetingOption === 'never' || awayGreetingOption === 'always') {
      setOpenHoursOption('24_7');
    }
  }, [awayGreetingOption]);

  if (phoneFaxOptions.scheduleAdded === true) {
    /**
     * Getting maximum number of timings amongst all the days which will be used for filling aggregateSchedules array to determine row count
     */
    let timingsCount = [];
    Object.entries(phoneFaxOptions.schedule).forEach(([key, value]) => {
      timingsCount.push(phoneFaxOptions.schedule[key].timingsCount);
    });
    const maxTimingsCount = Math.max.apply(
      Math,
      timingsCount.map((t) => t),
    );

    /**
     * Below loop will fill objects according to number of timings occurrences
     * e.g.
     *      - 1st object will contain timings of days which have at least one timing associated. Rest of the days are left
     *        associated with empty objects
     *      - 2nd object will contain timings of days which have 2 or more timings associated, filling only the second time.
     *        Objects will only contain the second time, rest of the days which do not have more than 1 timing associated
     *        will be left empty.
     *      - 3rd object will contain timings of days which have 3 or more timings associated, filling only the third time.
     *        Objects will only contain the third time, rest of the days which do not have more than 2 timing associated
     *        will be left empty.
     * And so on.
     */
    for (let i = 0; i < maxTimingsCount; i++) {
      let timings = [];
      if (i === 0) {
        Object.entries(phoneFaxOptions.schedule).forEach(([key, value]) => {
          if (phoneFaxOptions.schedule[key].timingsCount !== 0) {
            timings.push(phoneFaxOptions.schedule[key].timings[0]);
          } else {
            timings.push({});
          }
        });
      } else if (i >= 1) {
        Object.entries(phoneFaxOptions.schedule).forEach(([key, value]) => {
          if (phoneFaxOptions.schedule[key].timingsCount >= i + 1) {
            timings.push(phoneFaxOptions.schedule[key].timings[i]);
          } else {
            timings.push({});
          }
        });
      }
      aggregateSchedules.push({ id: i, timings: [...timings] });
    }
    // Uncomment below line to see how the data is structured
    // console.debug(mobx.toJS(aggregateSchedules));
  }

  const handleSaveOptions = async () => {
    try {
      await phoneFaxOptions.updateConfig([
        {
          name: 'away_greeting_play',
          value: awayGreetingOption,
        },
        {
          name: 'open_hours',
          value: openHoursOption,
        },
      ]);
      notification.showSuccess('Options were set successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
    } catch (err) {
      console.debug(err);
      notification.showError(err.message);
    }
    if (Object.keys(phoneFaxOptions.schedule).length > 0) {
      setTimingsSaved(true);
    }
  };

  const onEditHandle = () => {
    setTimingsSaved(false);
  };

  const handleDeleteAll = () => {
    let ids = [];
    aggregateSchedules.forEach((aggregateSchedule) => {
      aggregateSchedule.timings.forEach((timing) => {
        if (JSON.stringify(timing) !== '{}') {
          ids.push(timing.id);
        }
      });
    });
    phoneFaxOptions.deleteSchedules({ ids }).catch((err) => {
      notification.showError(err.message);
    });
  };

  return (
    <div>
      {phoneFaxOptions.configOptions.length > 0 ? (
        <>
          <Grid container direction="column">
            <Grid container className="d-flex align-items-center">
              <Grid item xs={5}>
                <span>The away greeting will</span>
              </Grid>
              <Grid item xs={7}>
                <Select
                  style={{ width: '100%', height: '36px' }}
                  variant="outlined"
                  id="awayGreetingOption"
                  value={awayGreetingOption}
                  onChange={(e) => setAwayGreetingOption(e.target.value)}
                >
                  {awayGreetingOptionValues.map((greetingOption) => (
                    <MenuItem
                      key={greetingOption.id}
                      value={greetingOption.value}
                    >
                      {greetingOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
            {awayGreetingOption === 'closed_or_vacation' && (
              <Grid container className="d-flex align-items-center mt-3">
                <Grid item xs={5}>
                  <span>My open hours are</span>
                </Grid>
                <Grid item xs={7}>
                  <Select
                    style={{ width: '100%', height: '36px' }}
                    variant="outlined"
                    id="openHoursOption"
                    value={openHoursOption}
                    onChange={(e) => setOpenHoursOption(e.target.value)}
                  >
                    {openHoursOptionValues.map((openHourOption) => (
                      <MenuItem
                        key={openHourOption.id}
                        value={openHourOption.value}
                      >
                        {openHourOption.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            )}
            <Divider className={styles.divider} />
          </Grid>
          {openHoursOption === '24_7' ? null : openHoursOption === 'custom' ? (
            <>
              <Grid container direction="column">
                <Grid container direction="column" className="mt-4">
                  {
                    <div className={styles.daysContainer}>
                      {schedules.map((schedule) => (
                        <span className={styles.day} key={schedule.day}>
                          {schedule.label}
                        </span>
                      ))}
                    </div>
                  }
                  {phoneFaxOptions.scheduleAdded === true ? (
                    <div className={styles.timingsContainer}>
                      {timingsSaved
                        ? aggregateSchedules.map(
                            (aggregateSchedule, aggregateIndex) => {
                              return aggregateSchedule.timings.map(
                                (timing, timingsIndex) => {
                                  if (JSON.stringify(timing) === '{}') {
                                    return (
                                      <div
                                        className={styles.hiddenElement}
                                        key={aggregateIndex + '' + timingsIndex}
                                      >
                                        <TimeChip
                                          deletable={false}
                                          time="22:00 A - 22:00 P"
                                        />
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div
                                        key={aggregateIndex + '' + timingsIndex}
                                        className={styles.viewTime}
                                      >
                                        <TimeChip
                                          time={`${moment(
                                            timing.fromTime,
                                            'HH:mm:ss',
                                          )
                                            .format('LT')
                                            .slice(
                                              0,
                                              moment(
                                                timing.fromTime,
                                                'HH:mm:ss',
                                              ).format('LT').length - 1,
                                            )} - ${moment(
                                            timing.toTime,
                                            'HH:mm:ss',
                                          )
                                            .format('LT')
                                            .slice(
                                              0,
                                              moment(
                                                timing.toTime,
                                                'HH:mm:ss',
                                              ).format('LT').length - 1,
                                            )}`}
                                          deletable={false}
                                        />
                                      </div>
                                    );
                                  }
                                },
                              );
                            },
                          )
                        : aggregateSchedules.map(
                            (aggregateSchedule, aggregateIndex) => {
                              return aggregateSchedule.timings.map(
                                (timing, timingsIndex) => {
                                  if (JSON.stringify(timing) === '{}') {
                                    return (
                                      <div
                                        className={`${styles.deletableTime} ${styles.hiddenElement}`}
                                        key={aggregateIndex + '' + timingsIndex}
                                      >
                                        <TimeChip
                                          deletable={false}
                                          time="22:00 A - 22:00 P"
                                        />
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div
                                        className={styles.deletableTime}
                                        key={aggregateIndex + '' + timingsIndex}
                                      >
                                        <TimeChip
                                          deletable={true}
                                          deleteSchedule={() => {
                                            phoneFaxOptions
                                              .deleteSchedules({
                                                ids: [timing.id],
                                              })
                                              .catch((err) =>
                                                notification.showError(
                                                  err.message,
                                                ),
                                              );
                                          }}
                                          time={`${moment(
                                            timing.fromTime,
                                            'HH:mm:ss',
                                          )
                                            .format('LT')
                                            .slice(
                                              0,
                                              moment(
                                                timing.fromTime,
                                                'HH:mm:ss',
                                              ).format('LT').length - 1,
                                            )} - ${moment(
                                            timing.toTime,
                                            'HH:mm:ss',
                                          )
                                            .format('LT')
                                            .slice(
                                              0,
                                              moment(
                                                timing.toTime,
                                                'HH:mm:ss',
                                              ).format('LT').length - 1,
                                            )}`}
                                        />
                                      </div>
                                    );
                                  }
                                },
                              );
                            },
                          )}
                    </div>
                  ) : null}
                </Grid>
                {!timingsSaved ? (
                  <div className={styles.formActions}>
                    {aggregateSchedules.length > 0 && (
                      <Button
                        onClick={handleDeleteAll}
                        className=" me-2"
                        variant="outlined"
                        color="primary"
                        startIcon={<DeleteIcon />}
                      >
                        Delete All
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={() => history.push(`${match.url}/add-time`)}
                    >
                      <span>Add Time</span>
                    </Button>
                  </div>
                ) : null}
              </Grid>
              <Divider className={styles.divider} />
            </>
          ) : null}
        </>
      ) : (
        <ConfigSkeleton />
      )}
      {timingsSaved && openHoursOption === 'custom' && (
        <div className={styles.formActions}>
          <div className="d-flex justify-content-end">
            {aggregateSchedules.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                className="primary-btn me-2"
                variant="outlined"
                color="primary"
              >
                Remove
              </Button>
            )}
            {aggregateSchedules.length > 0 ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={onEditHandle}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => history.push(`${match.url}/add-time`)}
              >
                <span>Add Time</span>
              </Button>
            )}
          </div>
        </div>
      )}
      <div className={styles.formActions}>
        {!timingsSaved && (
          <Button
            onClick={() => setTimingsSaved(true)}
            className="primary-btn me-2"
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
        )}
        {
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSaveOptions}
          >
            Save Options
          </Button>
        }
      </div>
    </div>
  );
};

export default observer(Options);
