import React, { useEffect, useRef, useState } from 'react';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { LinearProgress } from '@material-ui/core';
import { observer } from 'mobx-react';

import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import AwayGreetingSkeleton from './AwayGreetingSkeleton';
import UploadAudioFileGreeting from 'components/UploadAudioFileGreeting';
import CreateNewAwayGreeting from 'components/CreateNewAwayGreeting';
import ListManager from 'components/ListManager';
import { ReactComponent as DownloadIcon } from 'assets/images/download.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import styles from './index.module.css';

const AwayGreeting = ({ greetingStore, name }) => {
  const [open, setOpen] = useState(false);
  const [uploadAudioDialog, setUploadAudioDialog] = useState(false);
  const [createNewGreetingDialog, setCreateNewGreetingDialog] = useState(false);
  const greetingType = greetingStore;
  const {
    utils,
    notification,
    phoneFaxAwayGreeting,
    phoneFaxVoicemailGreeting,
    phoneFaxIVRVoicemailGreeting,
    phoneFaxVacationGreeting,
  } = useStores();
  const authToken = useAuthToken();

  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  useEffect(() => {
    greetingType.fetchList().catch((err) => {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to fetch the away greetings',
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen); //NOSONAR
  };

  const handleClose = (e) => {
    if (anchorRef.current && anchorRef.current.contains(e.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleItemClick = (option) => {
    setOpen(false);
    if (option === 'Create New') {
      setCreateNewGreetingDialog(true);
    } else if (option === 'Upload') {
      setUploadAudioDialog(true);
    }
  };

  const stopAudioInstance = (store) => {
    if (store.currentlyPlaying.file !== null) {
      store.currentlyPlaying.file.pause();
      store.setCurrentlyPlaying({
        uuid: null,
        shouldPlay: false,
      });
    }
  };

  const stores = [
    phoneFaxAwayGreeting,
    phoneFaxVoicemailGreeting,
    phoneFaxIVRVoicemailGreeting,
    phoneFaxVacationGreeting,
  ];

  const uuids = stores.map((store) => store.currentlyPlaying.uuid);

  const handleGreetingPlay = async (uuid, shouldPlay) => {
    // Below block is to check if another greeting is played while the first is playing
    if (!uuids.includes(uuid)) {
      // if a previous greeting is being played of the same store instance
      if (greetingType.currentlyPlaying.uuid !== null) {
        stores.map(stopAudioInstance);

        // This block will be executed when the greeting is played 1st time
      } else if (greetingType.currentlyPlaying.uuid === null) {
        // pause the greeting of the instance other than the one which user wants to play
        if (name === 'phoneFaxAwayGreeting') {
          stopAudioInstance(phoneFaxVoicemailGreeting);
          // pause the greeting of the instance other than the one which user wants to play
        }
        stopAudioInstance(phoneFaxAwayGreeting);
        stopAudioInstance(phoneFaxIVRVoicemailGreeting);
        stopAudioInstance(phoneFaxVacationGreeting);
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

  return (
    <div>
      <div style={{ height: '10px' }}>
        {greetingType.loaded === true && greetingType.loading && (
          <LinearProgress className="mb-3" />
        )}
      </div>
      <ListManager
        name={name}
        loading={greetingType.loading}
        loaded={greetingType.loaded}
        data={greetingType.data}
        render={React.memo(AwayGreetingItem)}
        handleGreetingPlay={handleGreetingPlay}
        skeletonItems={3}
        renderLoading={<AwayGreetingSkeleton />}
        greetingType={greetingType}
      />
      <div className={styles.awayGreetingItems}>
        <div className={styles.awayGreetingSingleGreeting}>
          <span className={styles.empty} />
          <div className={styles.createNewGreetingButton}>
            <Button
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              endIcon={<ArrowDropDownIcon />}
              variant="outlined"
              color="secondary"
              onClick={handleToggle}
            >{`Create New ${
              name === 'phoneFaxVoicemailGreeting'
                ? 'Voicemail'
                : name === 'phoneFaxIVRVoiceMailGreeting'
                ? 'IVR'
                : name === 'phoneFaxVacationGreeting'
                ? 'Vacation'
                : 'Away'
            } Greeting`}</Button>
          </div>
        </div>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          placement="bottom"
          className="mt-1"
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'center top' }}
            >
              <Paper elevation={4} style={{ width: '248px' }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    className="p-0"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem
                      key={1}
                      onClick={() => handleItemClick('Create New')}
                      value=""
                      className={styles.menuItem}
                    >
                      <div className="d-flex">
                        <span>Create New</span>
                      </div>
                    </MenuItem>
                    <MenuItem
                      key={2}
                      onClick={() => handleItemClick('Upload')}
                      value=""
                      className={styles.menuItem}
                    >
                      <div className="d-flex">
                        <span>Upload</span>
                      </div>
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
      {uploadAudioDialog === true && (
        <UploadAudioFileGreeting
          onClose={() => setUploadAudioDialog(false)}
          greetingStore={greetingType}
        />
      )}
      {createNewGreetingDialog === true && (
        <CreateNewAwayGreeting
          onClose={() => setCreateNewGreetingDialog(false)}
          greetingStore={greetingType}
          name={name}
        />
      )}
    </div>
  );
};

export default observer(AwayGreeting);

const AwayGreetingItem = observer(
  ({ id, payload: { handleGreetingPlay, greetingType, name } }) => {
    const { notification, utils } = useStores();
    const greeting = greetingType.datum[id];
    const authToken = useAuthToken();

    const handleSelect = async (greetingId, value) => {
      try {
        await greetingType.updateDefaultGreeting(greetingId, value);
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to set the default greeting',
        );
      }
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

    const handleDownload = async (uuid) => {
      try {
        window.open(utils.prepareMediaUrl({ uuid, authToken }), '_blank');
      } catch (e) {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to download the greeting',
        );
      }
    };

    return (
      <div>
        <div className={styles.awayGreetingSingleGreeting}>
          <span>{greeting.name}</span>
          <div className={styles.awayGreetingActions}>
            {name !== 'phoneFaxIVRVoiceMailGreeting' &&
              name !== 'phoneFaxVacationGreeting' &&
              (greeting.default ? (
                <span
                  className={styles.selected}
                  onClick={() => handleSelect(greeting.id, false)}
                >
                  <CheckIcon
                    fontSize="small"
                    style={{ color: '#1ABA17', marginRight: '2px' }}
                  />
                  Selected
                </span>
              ) : (
                <Button
                  className={styles.select}
                  size="medium"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleSelect(greeting.id, true)}
                >
                  Select
                </Button>
              ))}
            {!greeting.global && (
              <DeleteIcon
                className={styles.action}
                onClick={() => handleDelete(greeting.id)}
              />
            )}
            <DownloadIcon
              className={styles.action}
              onClick={() => handleDownload(greeting.uuid)}
            />
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
          </div>
        </div>
        <Divider className={styles.divider} />
      </div>
    );
  },
);
