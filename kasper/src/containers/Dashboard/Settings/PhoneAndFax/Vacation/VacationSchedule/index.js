import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { observer } from 'mobx-react';
import { LinearProgress } from '@material-ui/core';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import moment from 'moment-timezone';

import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Tooltip from 'components/Core/Tooltip';
import ListManager from 'components/ListManager';
import Schedule from 'components/Schedule';
import ScheduleSkeleton from 'components/Schedule/ScheduleSkeleton';
import styles from './index.module.css';
import AwayGreeting from '../../OutOfOfficeSettings/AwayGreeting';

const VacationSchedule = () => {
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [editingScheduleInfo, setEditingScheduleInfo] = useState({
    from: null,
    to: null,
    previousVacationName: null,
    greetingId: null,
    greetingName: null,
  });
  const [currentlyEditingId, setCurrentlyEditingId] = useState(null);
  const [singleEditing, setSingleEditing] = useState(false);
  const [greetings, setGreetings] = useState([]);

  const {
    phoneFaxSchedule,
    notification,
    authentication,
    utils,
    phoneFaxVacationGreeting,
  } = useStores();

  const { timezone } = authentication.user || {};
  const authToken = useAuthToken();

  useEffect(() => {
    phoneFaxSchedule.fetchList();
    if (phoneFaxVacationGreeting.data.length === 0) {
      phoneFaxVacationGreeting.fetchList();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addNewSchedule = () => {
    setGreetings([]);
    phoneFaxVacationGreeting.data.forEach((id) => {
      const data = phoneFaxVacationGreeting.get([{}, id]);
      setGreetings((greetings) => [...greetings, data]);
    });
    setAddingSchedule(true);
  };

  const editingChanges = (id, from, to, vacationName, greetingId) => {
    setGreetings([]);
    phoneFaxVacationGreeting.data.forEach((greetingId) => {
      const data = phoneFaxVacationGreeting.get([{}, greetingId]);
      setGreetings((greetings) => [...greetings, data]);
    });
    if (singleEditing && editingSchedule) {
      notification.showError(
        'Cannot edit more than one vacation schedule simultaneously',
      );
      return;
    }
    setEditingSchedule(true);
    setSingleEditing(true);

    setEditingScheduleInfo({
      from,
      to,
      previousVacationName: vacationName,
      greetingId,
      greetingName: phoneFaxVacationGreeting.getGreetingById({
        id: greetingId,
      }),
    });
    setCurrentlyEditingId(id);
  };

  const doneAdding = async (value, addedSchedule, vacationName, greetingId) => {
    if (addedSchedule !== null) {
      try {
        await phoneFaxSchedule.addSchedule(
          addedSchedule.from,
          addedSchedule.to,
          vacationName,
          greetingId,
        );
        notification.showSuccess('Schedule was added successfully');
        setTimeout(() => {
          notification.hideNotification();
        }, 2500);
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to add the schedule',
        );
      }
    }
    setAddingSchedule(!value);
  };

  const doneEditing = async (
    value,
    editedSchedule,
    id,
    vacationName,
    greetingId,
  ) => {
    if (editedSchedule !== null) {
      try {
        await phoneFaxSchedule.updateSchedule(
          id,
          editedSchedule.from,
          editedSchedule.to,
          vacationName,
          greetingId,
        );
        notification.showSuccess('Schedule was edited successfully');
        setTimeout(() => {
          notification.hideNotification();
        }, 2500);
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to edit the schedule',
        );
      }
    }
    setEditingSchedule(!value);
  };

  const removeSchedule = async (id) => {
    if (singleEditing && editingSchedule) {
      notification.showError(
        'Cannot delete a schedule when editing is in progress',
      );
      return;
    }
    try {
      await phoneFaxSchedule.removeSchedule(id);
      notification.showSuccess('Schedule was removed successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
    } catch (e) {
      console.error(e);
      notification.showError(
        'An unexpected error occurred while attempting to delete the schedule',
      );
    }
  };

  const handleGreetingPlay = async (uuid, shouldPlay, id) => {
    // If another greeting is played while the first is playing
    if (
      id !== phoneFaxSchedule.currentlyPlaying.id &&
      phoneFaxSchedule.currentlyPlaying.uuid !== null
    ) {
      phoneFaxSchedule.currentlyPlaying.file.pause();
    }

    phoneFaxSchedule.setCurrentlyPlaying({
      uuid,
      shouldPlay,
      id,
    });

    if (shouldPlay) {
      const audioFile = new Audio(utils.prepareMediaUrl({ uuid, authToken }));
      audioFile.play();
      phoneFaxSchedule.setCurrentlyPlaying({
        uuid,
        shouldPlay,
        file: audioFile,
        id,
      });
      audioFile.addEventListener('ended', () => {
        phoneFaxSchedule.setCurrentlyPlaying({
          uuid,
          shouldPlay: false,
          downloadUrl: null,
        });
      });
    } else {
      phoneFaxSchedule.currentlyPlaying.file.pause();
    }
  };

  return (
    <div>
      {phoneFaxSchedule.loaded === true && phoneFaxSchedule.loading && (
        <LinearProgress className="mb-3" />
      )}
      <ListManager
        loading={phoneFaxSchedule.loading}
        loaded={phoneFaxSchedule.loaded}
        data={phoneFaxSchedule.data}
        render={React.memo(VacationScheduleItem)}
        removeSchedule={removeSchedule}
        editingChanges={editingChanges}
        handleGreetingPlay={handleGreetingPlay}
        skeletonItems={2}
        timezone={timezone}
        renderLoading={<ScheduleSkeleton />}
        current={true}
      />
      {!addingSchedule ? (
        !editingSchedule ? (
          <div className={styles.awayGreetingSingleGreeting}>
            <p className={styles.empty} />
            <div className={styles.createNewGreetingButton}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={addNewSchedule}
              >
                Add Vacation
              </Button>
            </div>
          </div>
        ) : null
      ) : (
        <Schedule
          doneAdding={doneAdding}
          newSchedule={true}
          greetings={greetings}
          timezone={timezone}
        />
      )}
      {editingSchedule ? (
        <Schedule
          doneEditing={doneEditing}
          editingSchedule={true}
          currentlyEditingId={currentlyEditingId}
          greetings={greetings}
          previousVacationName={editingScheduleInfo.previousVacationName}
          timezone={timezone}
          from={editingScheduleInfo.from}
          to={editingScheduleInfo.to}
          greetingId={editingScheduleInfo.greetingId}
          greetingName={editingScheduleInfo.greetingName}
        />
      ) : null}

      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>Vacation Greeting</span>
        </div>
        <AwayGreeting
          greetingStore={phoneFaxVacationGreeting}
          name="phoneFaxVacationGreeting"
        />
      </div>

      <div className={styles.sectionTitleContainer}>
        <span className={styles.sectionTitle}>Past Vacation History</span>
      </div>
      <ListManager
        loading={phoneFaxSchedule.loading}
        loaded={phoneFaxSchedule.loaded}
        data={phoneFaxSchedule.data}
        render={React.memo(VacationScheduleItem)}
        removeSchedule={removeSchedule}
        editingChanges={editingChanges}
        handleGreetingPlay={handleGreetingPlay}
        skeletonItems={2}
        timezone={timezone}
        renderLoading={<ScheduleSkeleton />}
        past={true}
      />
    </div>
  );
};

export default observer(VacationSchedule);

const VacationScheduleItem = observer(
  ({
    id,
    payload: {
      removeSchedule,
      editingChanges,
      handleGreetingPlay,
      timezone,
      current,
      past,
    },
  }) => {
    const { phoneFaxSchedule, phoneFaxVacationGreeting } = useStores();
    let schedule = null;
    if (current) {
      const result = phoneFaxSchedule.compareTime({ id, timezone, current });
      if (result) {
        schedule = phoneFaxSchedule.datum[id];
      }
    } else if (past) {
      const result = phoneFaxSchedule.compareTime({ id, timezone, past });
      if (result) {
        schedule = phoneFaxSchedule.datum[id];
      }
    }

    return (
      schedule && (
        <Grid
          container
          direction="row"
          className="mb-3 justify-content-between"
          key={schedule.id}
        >
          <Grid item xs={6}>
            <Grid container direction="column">
              <Grid container direction="row">
                <Grid item xs={3}>
                  <span>Name</span>
                </Grid>
                <Grid item xs={9}>
                  <span className={styles.schedule}>{schedule.label}</span>
                </Grid>
              </Grid>
              <Grid container direction="row">
                <Grid item xs={3}>
                  <span>From:</span>
                </Grid>
                <Grid item xs={9}>
                  <span className={styles.schedule}>
                    {moment
                      .utc(schedule.from)
                      .tz(timezone)
                      .format('MM/DD/YYYY, LT')}
                  </span>
                </Grid>
              </Grid>
              <Grid container direction="row">
                <Grid item xs={3}>
                  <span>To:</span>
                </Grid>
                <Grid item xs={9}>
                  <span className={styles.schedule}>
                    {moment
                      .utc(schedule.to)
                      .tz(timezone)
                      .format('MM/DD/YYYY, LT')}
                  </span>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {current && (
            <Grid item xs={6}>
              <Grid
                container
                className="justify-content-end align-items-center flex-end"
              >
                {schedule.greeting !== null ? (
                  schedule.greeting.length !== 0 ? (
                    <Grid item>
                      {schedule.id === phoneFaxSchedule.currentlyPlaying.id &&
                      phoneFaxSchedule.currentlyPlaying.shouldPlay ? (
                        <Tooltip
                          title={phoneFaxVacationGreeting.getGreetingById({
                            id: schedule.greeting,
                          })}
                          placement="top"
                          arrow={true}
                          centerAlign={true}
                        >
                          <PauseCircleFilledIcon
                            className={styles.playPause}
                            onClick={() =>
                              handleGreetingPlay(
                                schedule.greeting,
                                false,
                                schedule.id,
                              )
                            }
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title={phoneFaxVacationGreeting.getGreetingById({
                            id: schedule.greeting,
                          })}
                          placement="top"
                          arrow={true}
                          centerAlign={true}
                        >
                          <PlayCircleFilledIcon
                            className={styles.playPause}
                            onClick={() =>
                              handleGreetingPlay(
                                schedule.greeting,
                                true,
                                schedule.id,
                              )
                            }
                          />
                        </Tooltip>
                      )}
                    </Grid>
                  ) : (
                    <PlayCircleFilledIcon
                      className={styles.playPause}
                      style={{ visibility: 'hidden' }}
                    />
                  )
                ) : (
                  <PlayCircleFilledIcon
                    className={styles.playPause}
                    style={{ visibility: 'hidden' }}
                  />
                )}
                <Grid item>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    className="me-3"
                    onClick={() => removeSchedule(schedule.id)}
                  >
                    Remove
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      editingChanges(
                        schedule.id,
                        schedule.from,
                        schedule.to,
                        schedule.label,
                        schedule.greeting,
                      )
                    }
                  >
                    Edit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      )
    );
  },
);
