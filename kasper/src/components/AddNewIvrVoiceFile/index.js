import React, { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { observer } from 'mobx-react';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import Scrollbars from 'react-custom-scrollbars';
import { LinearProgress, TextField } from '@material-ui/core';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import ListManager from 'components/ListManager';
import IvrGreetingSkeleton from './IvrGreetingSkeleton';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import UploadIvrAudio from './UploadIvrAudio';
import RecordIvrAudio from './RecordIvrAudio';

const AddNewIvrVoiceFile = observer(
  ({ onClose, greetingStore, onAudioFileSelection }) => {
    const uploadIvrRef = useRef(null);
    const recordIvrRef = useRef(null);
    const [selectedTab, setSelectedTab] = useState('Select');
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState();
    const [isRecording, setIsRecording] = useState(false);
    const greetingType = greetingStore;
    const { notification, phoneFaxIVRVoicemailGreeting, utils, createIvr } =
      useStores();
    const authToken = useAuthToken();

    useEffect(() => {
      greetingType.fetchList().catch((err) => {
        console.error(err);
        notification.showError(
          'An unexpected error occurred while attempting to fetch the away greetings',
        );
      });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectSubmit = () => {
      const selectedGreeting = createIvr.selectedIvrGreeting;
      if (selectedGreeting) {
        onAudioFileSelection(selectedGreeting);
        createIvr.setSelectedIvrGreeting('');

        onClose();
      }
    };

    const handleGreetingPlay = async (uuid, shouldPlay) => {
      if (uuid !== phoneFaxIVRVoicemailGreeting.currentlyPlaying.uuid) {
        if (greetingType.currentlyPlaying.uuid !== null) {
          if (phoneFaxIVRVoicemailGreeting.currentlyPlaying.file !== null) {
            phoneFaxIVRVoicemailGreeting.currentlyPlaying.file.pause();
            phoneFaxIVRVoicemailGreeting.setCurrentlyPlaying({
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

    const callTriggerSubmit = () => {
      selectedTab === 'Upload'
        ? uploadIvrRef.current.triggerSubmit()
        : selectedTab === 'Select'
        ? handleSelectSubmit()
        : recordIvrRef.current.triggerSubmit();
    };

    const handleClose = () => onClose();

    return (
      <Modal
        size="sm"
        header={`Add Voicefile`}
        allowClosing={!isSaving}
        body={
          <div className={clsx(styles.mainContainer, styles.net)}>
            <div className={styles.list_voice}>
              <p className={styles.subtitle}>Voicefile</p>
              <div className={styles.tabbingRadio}>
                <RadioGroup
                  row
                  aria-label="position"
                  name="position"
                  defaultValue="top"
                  value={selectedTab}
                  onChange={(e) => setSelectedTab(e.target.value)}
                >
                  <FormControlLabel
                    value="Select"
                    control={<Radio color="secondary" />}
                    label="Select"
                  />
                  <FormControlLabel
                    value="Upload"
                    control={<Radio color="secondary" />}
                    label="Upload"
                  />
                  <FormControlLabel
                    value="Record"
                    control={<Radio color="secondary" />}
                    label="Record"
                  />
                </RadioGroup>
              </div>
              {selectedTab === 'Select' && (
                <div className={styles.list_row}>
                  <div className={styles.row}>
                    {greetingType.loading && (
                      <LinearProgress className="mb-3" />
                    )}
                  </div>
                  <Scrollbars
                    className={styles.scrollBar}
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
                        <p className="text-center pt-5">
                          No Voicefile is available
                        </p>
                      }
                    />
                  </Scrollbars>
                </div>
              )}
              {selectedTab === 'Upload' && (
                <UploadIvrAudio
                  greetingType={greetingType}
                  ref={uploadIvrRef}
                  handleClose={handleClose}
                  onAudioFileSelection={onAudioFileSelection}
                  handleSaving={() => setIsSaving(true)}
                />
              )}
              {selectedTab === 'Record' && (
                <div className={styles.recorderContainer}>
                  <RecordIvrAudio
                    greetingType={greetingType}
                    ref={recordIvrRef}
                    handleClose={handleClose}
                    onAudioFileSelection={onAudioFileSelection}
                    handleSaving={() => setIsSaving(true)}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                  />
                </div>
              )}
            </div>
            <div className="mt-5 d-flex justify-content-between w-100">
              <Button
                className="me-auto primary-btn"
                variant="outlined"
                color="primary"
                onClick={handleClose}
                disabled={isSaving || isRecording}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={clsx('secondary-btn', styles.buttonSubmit)}
                variant="contained"
                color="secondary"
                onClick={callTriggerSubmit}
                disabled={isSaving || isRecording}
              >
                Submit
              </Button>
            </div>
          </div>
        }
        onClose={handleClose}
        footer={null}
      />
    );
  },
);

export default AddNewIvrVoiceFile;

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
    const { notification, createIvr } = useStores();
    const greeting = greetingType.datum[id];
    const handleSelect = ({ name, uuid }, value) => {
      if (value) createIvr.setSelectedIvrGreeting({ name, uuid });
      else createIvr.setSelectedIvrGreeting('');
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

    const isActive = createIvr.selectedIvrGreeting.uuid === greeting.uuid;
    const isEditingFile = editingItem?.id === greeting?.id;
    return (
      <div className={clsx(styles.list_row_inner, isActive && styles.active)}>
        <div className={styles.awayGreetingSingleGreeting}>
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
            <div className={clsx('d-flex align-items-center', styles.greeting)}>
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
                className={clsx('ms-1', styles.buttonUpdate)}
                onClick={() => {
                  !isSaving && handleUpdate(greeting.id, editingItem?.name);
                }}
                disabled={editingItem?.name === ''}
                style={{ cursor: editingItem?.name === '' && 'not-allowed' }}
              >
                <CheckIcon className={styles.icon} />
              </button>{' '}
              <button
                // className={cxls("ms-1", styles)}
                onClick={() => setEditingItem(undefined)}
                style={{
                  background: 'transparent',
                  margin: 0,
                  padding: 0,
                  outline: 'none',
                  border: 'none',
                }}
              >
                <ClearIcon className={styles.icon} />
              </button>
            </div>
          ) : (
            <span title={greeting.name} className={styles.greeting}>
              {' '}
              {greeting.name}
            </span>
          )}
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
