import { Button, IconButton, LinearProgress } from '@material-ui/core';
import Table from 'components/Core/Table';
import React, { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import moment from 'moment-timezone';
import { useStores } from 'hooks/useStores';
import { ReactComponent as NoCallsIcon } from 'assets/images/no-calls-selected.svg';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { ReactComponent as GreenCheck } from 'assets/images/green-check-round.svg';
import Menu from '../../../PhoneAndFax/IvrSettings/IvrList/Menu';
import styles from './index.module.css';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuthToken } from 'hooks/useAuthToken';
import PhoneNumber from 'awesome-phonenumber';

const COLUMNS = [
  { id: 'name', width: '30%', disablePadding: false, label: 'Name' },
  {
    id: 'fromTo',
    width: '30%',
    disablePadding: false,
    label: 'From / To',
  },
  {
    id: 'activeNumbers',
    width: '30%',
    disablePadding: false,
    label: 'Active Numbers',
  },
  {
    id: 'action',
    width: '10%',
    disablePadding: false,
    label: 'Action',
    align: 'center',
  },
];

const createDataItem = (
  item,
  index,
  handleGreetingPlay,
  greetingIndex,
  timezone,
  handleDeleteVacation,
) => {
  const {
    label,
    from,
    assigned_numbers: ItemActiveNumbers,
    to,
    greeting_uuid,
    id: vacationID,
  } = item;
  const history = useHistory();
  const match = useRouteMatch('/dashboard/settings/phone-and-fax/vacations');

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

  const GreetingItem = (
    <span className={styles.greetings}>
      {greetingIndex !== null && index === greetingIndex ? (
        <PauseCircleFilledIcon
          className={styles.playPause}
          onClick={() => handleGreetingPlay(greeting_uuid, false, index)}
        />
      ) : (
        <PlayCircleFilledIcon
          className={styles.playPause}
          onClick={() => handleGreetingPlay(greeting_uuid, true, index)}
        />
      )}
    </span>
  );

  const name = (
    <>
      {GreetingItem} {label}
    </>
  );

  const fromTo = (
    <>
      <div className={styles.GreetingNumbers}>
        <div className={styles.number}>
          <span className={styles.numberDigit}>
            {moment.utc(from).tz(timezone).format('MM/DD/YYYY, LT')}
          </span>
        </div>
      </div>

      <div className={styles.GreetingNumbers}>
        <div key={index} className={styles.number}>
          <span className={styles.numberDigit}>
            {moment.utc(to).tz(timezone).format('MM/DD/YYYY, LT')}
          </span>
        </div>
      </div>
    </>
  );

  const activeNumbers = (
    <div className={styles.GreetingNumbers}>
      {handleNumberRender(ItemActiveNumbers)}
    </div>
  );

  const action = (
    <Menu
      id={index}
      handleEditIvr={() =>
        history.push(`${match.url}/edit-vacation/${vacationID}`, item)
      }
      handleDeleteIvr={() => handleDeleteVacation(vacationID)}
    />
  );

  return { name, fromTo, activeNumbers, action };
};

const VacationList = () => {
  const { notification, vacationGreeting, utils, authentication } = useStores();
  const authToken = useAuthToken();
  const queryClient = useQueryClient();
  const greetingType = vacationGreeting;

  const [greetingIndex, setGreetingIndex] = useState(null);
  const { timezone } = authentication.user || '';

  const {
    data: vacations = [],
    isLoading,
    isFetching,
  } = useQuery('vacationList', () => vacationGreeting.getVacations(), {
    onError: (error) => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the vacations',
      );
    },
  });

  const { mutateAsync: handleDeleteVacation, isLoading: isDeleting } =
    useMutation('deleteVacation', (id) => vacationGreeting.deleteVacation(id), {
      onSuccess: () => {
        notification.showSuccess('Vacation deleted successfully');
        queryClient.invalidateQueries('vacationList');
      },
      onError: (error) => {
        notification.showError(
          error.message ??
            'An unexpected error occurred while attempting to delete the vacation',
        );
      },
    });

  const handleGreetingPlay = async (uuid, shouldPlay, index) => {
    if (shouldPlay) {
      setGreetingIndex(index);
    } else {
      setGreetingIndex(null);
    }
    if (uuid !== vacationGreeting.currentlyPlaying.uuid) {
      if (greetingType.currentlyPlaying.uuid !== null) {
        if (vacationGreeting.currentlyPlaying.file !== null) {
          vacationGreeting.currentlyPlaying.file.pause();
          vacationGreeting.setCurrentlyPlaying({
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
  const NoVacationsText = (
    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center position-relative">
      <div className={styles.noMessageText}>No vacations available</div>
    </div>
  );

  const tableRows = vacations.map((item, index) => {
    return createDataItem(
      item,
      index,
      handleGreetingPlay,
      greetingIndex,
      timezone,
      handleDeleteVacation,
    );
  });

  return (
    <>
      {(isLoading || isDeleting || isFetching) && (
        <LinearProgress color="secondary" />
      )}
      {!isLoading && !vacations.length ? (
        NoVacationsText
      ) : (
        <Table
          noScroll={true}
          columns={COLUMNS}
          rows={tableRows}
          isEmpty={!isLoading && !vacations.length}
          allowSelectAll={false}
          isSelectable={false}
        />
      )}
    </>
  );
};

export default VacationList;
