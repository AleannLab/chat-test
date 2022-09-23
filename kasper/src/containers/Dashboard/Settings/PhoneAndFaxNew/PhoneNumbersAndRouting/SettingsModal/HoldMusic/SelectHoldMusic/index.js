import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import ListManager from 'components/ListManager';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useAuthToken } from 'hooks/useAuthToken';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import { LinearProgress, TextField } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import IvrGreetingSkeleton from 'components/AddNewIvrVoiceFile/IvrGreetingSkeleton';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

const SelectHoldMusic = observer(({ onAudioFileSelection }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState();
  const { uuid } = useParams();
  const QueryClient = useQueryClient();

  const {
    notification,
    utils,
    holdMusicGreeting,
    phoneFaxOptions,
    authentication,
  } = useStores();
  const greetingType = holdMusicGreeting;
  const authToken = useAuthToken();
  const { data } = useQuery(
    ['recordingOptions'],
    () => phoneFaxOptions.fetchRecordingOptions(uuid || ''),
    {
      retry: false,
      cacheTime: 0,
    },
  );

  const { mutateAsync: updateSettings } = useMutation(
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
        QueryClient.invalidateQueries('recordingOptions');
      },
    },
  );
  useEffect(() => {
    greetingType.fetchList().catch((err) => {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to fetch the away greetings',
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGreetingPlay = async (uuid, shouldPlay) => {
    if (uuid !== holdMusicGreeting.currentlyPlaying.uuid) {
      if (greetingType.currentlyPlaying.uuid !== null) {
        if (holdMusicGreeting.currentlyPlaying.file !== null) {
          holdMusicGreeting.currentlyPlaying.file.pause();
          holdMusicGreeting.setCurrentlyPlaying({
            uuid: null,
            shouldPlay: false,
          });
        }
      }
    }

    greetingType.setCurrentlyPlaying({
      uuid,
      shouldPlay,
    });

    if (shouldPlay) {
      const audioFile = new Audio(utils.prepareMediaUrl({ uuid, authToken }));
      audioFile.play();
      greetingType.setCurrentlyPlaying({
        file: audioFile,
      });
      audioFile.addEventListener('ended', () => {
        greetingType.setCurrentlyPlaying({
          uuid: null,
          shouldPlay: false,
          downloadUrl: null,
          file: null,
        });
      });
    } else {
      greetingType.currentlyPlaying.file.pause();
      greetingType.setCurrentlyPlaying({
        uuid: null,
        shouldPlay: false,
        downloadUrl: null,
        file: null,
      });
    }
  };

  const handleUpdateSettings = async () => {
    const payload = {
      holdMusicUuid: holdMusicGreeting?.selectedHoldMusic?.uuid,
      id: data?.id ?? '',
      method: data ? 'PATCH' : 'POST',
      uuid,
    };
    await updateSettings(payload);
  };

  return (
    <>
      <div className={styles.list_row}>
        <div style={{ height: '10px' }}>
          {greetingType.loading && <LinearProgress className="mb-3" />}
        </div>
        <Scrollbars
          style={{ height: '250px' }}
          renderTrackHorizontal={(props) => <div {...props} />}
        >
          <ListManager
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            loading={greetingType.loading}
            loaded={greetingType.loaded}
            data={greetingType.data}
            render={React.memo(IvrGreeting)}
            handleGreetingPlay={handleGreetingPlay}
            skeletonItems={3}
            renderLoading={<IvrGreetingSkeleton />}
            greetingType={greetingType}
            emptyMessage={
              <p className="text-center pt-5">No File is available</p>
            }
          />
        </Scrollbars>
      </div>
      <div className={styles.flexButtons}>
        <Button
          className="me-auto primary-btn"
          variant="outlined"
          color="primary"
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="secondary-btn"
          variant="contained"
          color="secondary"
          style={{ width: 'auto' }}
          onClick={() => handleUpdateSettings()}
        >
          Submit
        </Button>
      </div>
    </>
  );
});

export default SelectHoldMusic;

const IvrGreeting = observer(
  ({
    id,
    payload: {
      handleGreetingPlay,
      greetingType,
      editingItem,
      setEditingItem,
      isSaving,
      setIsSaving,
    },
  }) => {
    const { notification, holdMusicGreeting } = useStores();
    const greeting = greetingType.datum[id];
    const handleSelect = ({ name, uuid }, value) => {
      if (value) holdMusicGreeting.setSelectedHoldMusic({ name, uuid });
      else holdMusicGreeting.setSelectedHoldMusic('');
    };

    const handleDelete = async (greetingId) => {
      try {
        await greetingType.deleteGreeting(greetingId);
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to delete the greeting',
        );
      }
    };

    const handleUpdate = async (greetingId, name) => {
      try {
        setIsSaving(true);
        await greetingType.updateGreetingName(greetingId, name);
        setIsSaving(false);
        setEditingItem(undefined);
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to update the greeting name',
        );
      }
    };

    const isActive = holdMusicGreeting.selectedHoldMusic.uuid === greeting.uuid;
    const isEditingFile = editingItem?.id === greeting?.id;
    return (
      <div className={clsx(styles.list_row_inner, isActive && styles.active)}>
        <div className={styles.awayGreetingSingleGreeting}>
          <div className="d-flex align-items-center ">
            <span>
              {greeting.uuid === greetingType.currentlyPlaying.uuid &&
              greetingType.currentlyPlaying.shouldPlay ? (
                <PauseCircleFilledIcon
                  className={styles.playPause}
                  onClick={() => handleGreetingPlay(greeting.uuid, false)}
                />
              ) : (
                <PlayCircleFilledIcon
                  className={styles.playPause}
                  onClick={() => handleGreetingPlay(greeting.uuid, true)}
                />
              )}
            </span>

            {isEditingFile ? (
              <div
                className={clsx('d-flex align-items-center', styles.greeting)}
              >
                <TextField
                  inputProps={{ style: { height: 10 }, maxLength: 50 }}
                  disabled={isSaving}
                  autoFocus
                  variant="outlined"
                  value={editingItem?.name}
                  onChange={(event) => {
                    event.persist();
                    setEditingItem((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }));
                  }}
                />
                <button
                  className="ms-1"
                  onClick={() => {
                    !isSaving && handleUpdate(greeting.id, editingItem?.name);
                  }}
                  disabled={editingItem?.name === ''}
                  style={{
                    background: 'transparent',
                    margin: 0,
                    padding: 0,
                    outline: 'none',
                    border: 'none',
                    cursor: editingItem?.name === '' && 'not-allowed',
                  }}
                >
                  <CheckIcon style={{ color: '#9A9A9A' }} />
                </button>{' '}
                <button
                  className="ms-1"
                  onClick={() => setEditingItem(undefined)}
                  style={{
                    background: 'transparent',
                    margin: 0,
                    padding: 0,
                    outline: 'none',
                    border: 'none',
                  }}
                >
                  <ClearIcon style={{ color: '#9A9A9A' }} />
                </button>
              </div>
            ) : (
              <span title={greeting.name} className={styles.greeting}>
                {greeting.name}
              </span>
            )}
          </div>

          <div>
            {isActive ? (
              <Button
                className={styles.selected}
                onClick={() => handleSelect(greeting.id, false)}
              >
                <CheckIcon
                  fontSize="small"
                  style={{ color: '#1ABA17', marginRight: '2px' }}
                />
                Selected
              </Button>
            ) : (
              <Button
                className={styles.select}
                variant="outlined"
                onClick={() => handleSelect(greeting, true)}
              >
                Select
              </Button>
            )}
            <PencilIcon
              className={styles.action}
              onClick={() => {
                setEditingItem(greeting);
              }}
            />
            <DeleteIcon
              className={styles.action}
              onClick={() => handleDelete(greeting.id)}
            />
          </div>
        </div>
      </div>
    );
  },
);
