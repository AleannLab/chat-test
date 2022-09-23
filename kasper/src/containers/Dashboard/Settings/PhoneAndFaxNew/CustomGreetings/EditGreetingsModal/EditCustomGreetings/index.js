import { Button, LinearProgress, TextField } from '@material-ui/core';
import React, { useState } from 'react';
import styles from './index.module.css';
import AddIcon from '@material-ui/icons/Add';
import ListManager from 'components/ListManager';
import { observer } from 'mobx-react';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { ReactComponent as DownloadIcon } from 'assets/images/download.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import { useStores } from 'hooks/useStores';
import { ReactComponent as GreenCheck } from 'assets/images/green-check-round.svg';
import Divider from '@material-ui/core/Divider';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import clsx from 'clsx';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import CallForwardingSkeleton from 'containers/Dashboard/Settings/PhoneAndFax/CallForwarding/CallForwardingSkeleton';
import PhoneNumber from 'awesome-phonenumber';
import { useAuthToken } from 'hooks/useAuthToken';

const EditCustomGreetings = () => {
  const history = useHistory();
  const { customGreetings, notification, utils } = useStores();
  const { Id, greetingType } = useParams();
  const authToken = useAuthToken();
  const QueryClient = useQueryClient();
  const GreetingName = greetingType.split('-')?.[0];
  const isMiscellaneous = GreetingName === 'Miscellaneous';
  const [editingItem, setEditingItem] = useState(null);

  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/custom-greetings/edit-greetings/:greetingType/:Id',
  );

  const NoGreetingsText = (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
      <div className={styles.noMessageText}>No greetings available</div>
    </div>
  );

  const {
    data: greetingData = [],
    isLoading,
    isFetched,
    isFetching,
  } = useQuery('getGreetings', () => customGreetings.getGreetings(Id || ''), {
    onError: () => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the number list.',
      );
    },
    onSuccess: () => {
      if (editingItem) setEditingItem(null);
    },
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync, isLoading: isDeleting } = useMutation(
    'deleteGreeting',
    (payload) => customGreetings.deleteGreeting(payload),
    {
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to delete.',
        );
      },
      onSuccess: () => {
        QueryClient.invalidateQueries('getGreetings');
      },
    },
  );

  const { mutateAsync: UpdateGreeting, isLoading: isUpdating } = useMutation(
    'updateGreetingName',
    (payload) => customGreetings.updateGreetingName(payload),
    {
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to update the greeting name',
        );
        setEditingItem(null);
      },
      onSuccess: () => {
        QueryClient.invalidateQueries('getGreetings');
      },
    },
  );

  const handleGreetingPlay = async (uuid, shouldPlay) => {
    if (uuid !== customGreetings.currentlyPlaying.uuid) {
      if (customGreetings.currentlyPlaying.uuid !== null) {
        if (customGreetings.currentlyPlaying.file !== null) {
          customGreetings.currentlyPlaying.file.pause();
          customGreetings.setCurrentlyPlaying({
            uuid: null,
            shouldPlay: false,
          });
        }
      }
    }

    customGreetings.setCurrentlyPlaying({
      uuid,
      shouldPlay,
    });

    if (shouldPlay) {
      const audioFile = new Audio(utils.prepareMediaUrl({ uuid, authToken }));
      audioFile.play();
      customGreetings.setCurrentlyPlaying({
        file: audioFile,
      });
      audioFile.addEventListener('ended', () => {
        customGreetings.setCurrentlyPlaying({
          uuid: null,
          shouldPlay: false,
          downloadUrl: null,
          file: null,
        });
      });
    } else {
      customGreetings.currentlyPlaying.file.pause();
      customGreetings.setCurrentlyPlaying({
        uuid: null,
        shouldPlay: false,
        downloadUrl: null,
        file: null,
      });
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
    <>
      <div className={styles.titleText}>{`${GreetingName} Greetings`}</div>
      {!isMiscellaneous && (
        <div className={styles.info}>
          Choose the default greeting that will apply to each of your numbers.
          This greeting will be played for slots that have selected this
          greeting category.
        </div>
      )}
      <div className="d-flex justify-content-end mt-4">
        <Button
          variant={isMiscellaneous ? 'outlined' : 'contained'}
          className={`${
            isMiscellaneous ? styles.addButtonOutlined : styles.addButton
          }`}
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => history.push(`${match.url}/add-greeting`)}
        >
          <span>Add Greeting</span>
        </Button>
      </div>

      <div>
        <div className={styles.sectionContainer}>
          <div style={{ height: '10px' }}>
            {(isLoading || isFetching || isDeleting || isUpdating) && (
              <LinearProgress
                color="secondary"
                className={styles.tableProgressBar}
              />
            )}
          </div>
          <ListManager
            loading={isLoading}
            loaded={isFetched}
            data={greetingData}
            render={React.memo(CallForwardingItem)}
            skeletonItems={3}
            handleGreetingPlay={handleGreetingPlay}
            handleDownload={handleDownload}
            handleDeleteGreeting={mutateAsync}
            greetingType={customGreetings}
            renderLoading={<CallForwardingSkeleton />}
            emptyMessage={NoGreetingsText}
            setEditingItem={setEditingItem}
            editingItem={editingItem}
            UpdateGreeting={UpdateGreeting}
            isUpdating={isUpdating}
            isFetching={isFetching}
          />
        </div>
      </div>
    </>
  );
};

export default EditCustomGreetings;

const CallForwardingItem = observer(
  ({
    id,
    payload: {
      handleGreetingPlay,
      greetingType,
      handleDownload,
      handleDeleteGreeting,
      isMiscellaneous,
      setEditingItem,
      editingItem,
      UpdateGreeting,
      isUpdating,
      isFetching,
    },
  }) => {
    const history = useHistory();
    const match = useRouteMatch(
      '/dashboard/settings/phone-and-fax/custom-greetings/edit-greetings/:greetingType/:Id',
    );
    const isEditingFile = editingItem?.id === id.id;

    const handleNumberRender = (numbers) => {
      if (numbers) {
        return numbers.split(',').map((number, index) => {
          const ayt = PhoneNumber.getAsYouType('US');
          const formattedNumber =
            '+1 ' + ayt.reset(number.toString().split('+1')[1]);
          return (
            <div key={index} className={styles.number}>
              <GreenCheck />
              <span className={styles.numberDigit}>{formattedNumber}</span>
            </div>
          );
        });
      } else {
        return '---';
      }
    };

    return (
      <div>
        <div className={styles.awayGreetingSingleGreeting}>
          <div className={styles.GreetingName}>
            <span className={styles.greetings}>
              {id.greeting_uuid === greetingType.currentlyPlaying.uuid &&
              greetingType.currentlyPlaying.shouldPlay ? (
                <PauseCircleFilledIcon
                  className={styles.playPause}
                  onClick={() => handleGreetingPlay(id.greeting_uuid, false)}
                />
              ) : (
                <PlayCircleFilledIcon
                  className={styles.playPause}
                  onClick={() => handleGreetingPlay(id.greeting_uuid, true)}
                />
              )}
            </span>

            {isEditingFile ? (
              <div
                className={clsx('d-flex align-items-center', styles.greeting)}
              >
                <TextField
                  inputProps={{ style: { height: 10 }, maxLength: 50 }}
                  disabled={isUpdating || isFetching}
                  autoFocus
                  variant="outlined"
                  value={editingItem?.file_name}
                  onChange={(event) => {
                    event.persist();
                    setEditingItem((prev) => ({
                      ...prev,
                      file_name: event.target.value,
                    }));
                  }}
                />
                <button
                  className="ms-1"
                  onClick={() => {
                    !isUpdating &&
                      UpdateGreeting({
                        id: id.id,
                        name: editingItem?.file_name,
                      });
                  }}
                  disabled={editingItem?.file_name === ''}
                  style={{
                    background: 'transparent',
                    margin: 0,
                    padding: 0,
                    outline: 'none',
                    border: 'none',
                    cursor: editingItem?.file_name === '' && 'not-allowed',
                  }}
                >
                  <CheckIcon style={{ color: '#9A9A9A' }} />
                </button>{' '}
                <button
                  className="ms-1"
                  onClick={() => setEditingItem(null)}
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
              <>
                <span className={styles.greetingText}>{id.file_name}</span>
                <PencilIcon
                  className={styles.action}
                  onClick={() => {
                    setEditingItem(id);
                  }}
                />
              </>
            )}
          </div>
          {!isMiscellaneous && (
            <div className={styles.GreetingNumbers}>
              {handleNumberRender(id.assigned_numbers)}
            </div>
          )}

          <div className={styles.GreetingActions}>
            {!isMiscellaneous && (
              <Button
                type="button"
                className={styles.action}
                variant="outlined"
                color="secondary"
                onClick={() =>
                  history.push(`${match.url}/add-numbers/${id.greeting_uuid}`, {
                    numbers: id.assigned_numbers,
                    name: id.file_name,
                  })
                }
              >
                Set defaults...
              </Button>
            )}

            <DeleteIcon
              className={styles.action}
              onClick={() => handleDeleteGreeting(id.id)}
            />

            <DownloadIcon
              className={styles.action}
              onClick={() => handleDownload(id.greeting_uuid)}
            />
          </div>
        </div>
        <Divider className={styles.divider} />
      </div>
    );
  },
);
