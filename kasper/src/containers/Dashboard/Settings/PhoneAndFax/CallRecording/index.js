import Table from 'components/Core/Table';
import React, { useEffect, useState } from 'react';
import Switch from '../../../../../components/Core/Switch';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import RecordingDisclaimerAudio from '../../../../../assets/sounds/call-recorded-monitored.mp3';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery } from 'react-query';
import { queryClient } from 'App';
import { LinearProgress } from '@material-ui/core';
import ConfirmCallRecordModal from './ConfirmCallRecordModal';
import { useParams } from 'react-router-dom';

const ControlledSwitch = ({ name, checked, onChange, disabled }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(event.target.checked);
  };

  return (
    <Switch
      name={name}
      checked={isChecked}
      onClick={handleChange}
      disabled={disabled}
    />
  );
};

const tableColumns = [
  {
    id: 'settings',
    numeric: false,
    disablePadding: false,
    label: 'Settings',
    canSort: false,
    width: '85%',
  },
  { id: 'action', numeric: false, disablePadding: false, label: 'Enabled' },
];

const audio = new Audio(RecordingDisclaimerAudio);

const CallRecording = ({ showHeading = true, disablePadding = false }) => {
  const { uuid } = useParams();
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);
  const [isUpdateRecordingConfirmed, setConfirmUpdateRecording] =
    useState(false);
  const { phoneFaxOptions, notification, authentication } = useStores();

  const {
    data: recordingOptions,
    isFetching,
    isLoading,
  } = useQuery(
    ['recordingOptions'],
    () => phoneFaxOptions.fetchRecordingOptions(uuid || ''),
    {
      retry: false,
      cacheTime: 0,
    },
  );

  const updateRecordingOptionsQuery = useMutation(
    ['updateRecordingOptions'],
    (options) => phoneFaxOptions.updateRecordingOptions(options),
    {
      onError: (err) => {
        notification.showError(
          err.message ||
            'An unexpected error occurred while attempting to update the recording options',
        );
      },
      onSuccess: () => {
        authentication.refreshUser();
        notification.showSuccess('Recording options updated successfully!');
        queryClient.invalidateQueries('recordingOptions');
      },
    },
  );

  const updateRecordingOptions = async (options = null) => {
    if (options) {
      await updateRecordingOptionsQuery.mutateAsync(options);
      return;
    }
  };

  const { isLoading: isUpdating } = updateRecordingOptionsQuery;

  audio.onended = () => {
    setIsAudioPlayed(false);
  };

  const toggleAudio = () => {
    if (!isAudioPlayed) {
      audio.play();
      setIsAudioPlayed(true);
    } else {
      audio.pause();
      audio.currentTime = 0;
      setIsAudioPlayed(false);
    }
  };

  const isDisabled =
    !recordingOptions?.call_recording_enable || isFetching || isUpdating;

  const handleUpdateRecordingOptions = (updateConfirmation) => {
    setConfirmUpdateRecording(updateConfirmation);
  };

  const handleCallRecordUpdate = (shouldUpdate, type) => {
    if (type === 'recording') {
      if (shouldUpdate) {
        updateRecordingOptions({
          callRecordEnable: shouldUpdate,
          id: recordingOptions?.id ?? '',
          method: recordingOptions ? 'PATCH' : 'POST',
          uuid,
        });
      } else {
        updateRecordingOptions({
          callRecordEnable: shouldUpdate,
          playRecordingEnable: shouldUpdate,
          id: recordingOptions?.id ?? '',
          method: recordingOptions ? 'PATCH' : 'POST',
          uuid,
        });
      }
    } else {
      if (shouldUpdate) {
        updateRecordingOptions({
          playRecordingEnable: shouldUpdate,
          id: recordingOptions?.id ?? '',
          method: recordingOptions ? 'PATCH' : 'POST',
          uuid,
        });
      } else {
        updateRecordingOptions({
          playRecordingEnable: shouldUpdate,
          id: recordingOptions?.id ?? '',
          method: recordingOptions ? 'PATCH' : 'POST',
          uuid,
        });
      }
    }
  };

  const tableRows = [
    {
      settings: 'Enable high quality call recording',
      id: 1,
      action: (
        <ControlledSwitch
          disabled={isFetching || isUpdating}
          checked={
            !!recordingOptions?.call_recording_enable ||
            isUpdateRecordingConfirmed
          }
          onChange={(callRecordEnable) => {
            if (callRecordEnable) {
              handleUpdateRecordingOptions(callRecordEnable);
            } else {
              handleCallRecordUpdate(false, 'recording');
            }
          }}
          name="recording"
        />
      ),
    },
    {
      settings: (
        <div
          aria-disabled={isDisabled}
          style={{
            userSelect: isDisabled ? 'none' : 'auto',
            opacity: isDisabled ? 0.5 : 1,
            pointerEvents: isDisabled ? 'none' : 'auto',
          }}
          className="d-flex justify-content-between align-items-center"
        >
          <div style={{ maxWidth: 360 }}>
            Play standard call recording disclaimer at the start of each call
          </div>
          {!isAudioPlayed && (
            <PlayCircleFilledIcon
              className={styles.playPause}
              onClick={toggleAudio}
            />
          )}
          {isAudioPlayed && (
            <PauseCircleFilledIcon
              className={styles.playPause}
              onClick={toggleAudio}
            />
          )}
        </div>
      ),
      id: 2,
      action: (
        <ControlledSwitch
          disabled={isDisabled}
          checked={!!recordingOptions?.play_recording_enable}
          onChange={(playRecordingEnable) =>
            handleCallRecordUpdate(playRecordingEnable, 'standard')
          }
          name="disclaimer"
        />
      ),
    },
  ];
  return (
    <div className={`${styles.root} ${disablePadding ? '' : styles.padding}`}>
      <div className={styles.container}>
        {showHeading && <div className={styles.header}>Call Recording</div>}
        {(isLoading || isUpdating) && (
          <LinearProgress
            color="secondary"
            className={styles.tableProgressBar}
          />
        )}

        <Table
          showHeader={false}
          columns={tableColumns}
          rows={tableRows}
          isSelectable={false}
        />
      </div>
      {isUpdateRecordingConfirmed && (
        <ConfirmCallRecordModal
          handleCallRecordUpdate={handleCallRecordUpdate}
          setConfirmUpdateRecording={setConfirmUpdateRecording}
        />
      )}
    </div>
  );
};

export default CallRecording;
