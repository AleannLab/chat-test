import { LinearProgress } from '@material-ui/core';
import Table from 'components/Core/Table';
import React, { useState } from 'react';
import moment from 'moment-timezone';
import { useStores } from 'hooks/useStores';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { ReactComponent as GreenCheck } from 'assets/images/green-check-round.svg';
import { useQuery } from 'react-query';
import { useAuthToken } from 'hooks/useAuthToken';
import PhoneNumber from 'awesome-phonenumber';
import styles from './index.module.css';

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
    label: 'Phone Numbers',
  },
];

const createDataItem = (
  item,
  index,
  handleGreetingPlay,
  greetingIndex,
  timezone,
) => {
  const {
    label,
    from,
    assigned_numbers: ItemActiveNumbers,
    to,
    greeting_uuid,
  } = item;

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

  return { name, fromTo, activeNumbers };
};

const VacationHistory = () => {
  const { notification, vacationGreeting, utils, authentication } = useStores();
  const authToken = useAuthToken();
  const greetingType = vacationGreeting;
  const [greetingIndex, setGreetingIndex] = useState(null);
  const { timezone } = authentication.user || '';

  const {
    data: history = [],
    isLoading,
    isFetching,
  } = useQuery(
    'vacationListHistory',
    () => vacationGreeting.getVacationsHistory(),
    {
      onError: (error) => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the vacations',
        );
      },
    },
  );

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

  const tableRows = history.map((item, index) => {
    return createDataItem(
      item,
      index,
      handleGreetingPlay,
      greetingIndex,
      timezone,
    );
  });

  return (
    <>
      {(isLoading || isFetching) && <LinearProgress color="secondary" />}
      {!isLoading && !history.length ? (
        NoVacationsText
      ) : (
        <Table
          noScroll={true}
          columns={COLUMNS}
          rows={tableRows}
          isEmpty={!isLoading && !history.length}
          allowSelectAll={false}
          isSelectable={false}
        />
      )}
    </>
  );
};

export default VacationHistory;
