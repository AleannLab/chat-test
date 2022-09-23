import Modal from 'components/Core/Modal';
import React, { useEffect } from 'react';
import PhoneNumber from 'awesome-phonenumber';
import {
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ButtonBase } from '@material-ui/core';
import { useState } from 'react';
import styles from './index.module.css';
import CustomSchedule from './CustomSchedule';
import TwentyFourSevenSchedule from './TwentyFourSevenSchedule/index';
import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';

var ayt = PhoneNumber.getAsYouType('US');

const TABS = [
  { value: '24_7', label: '24/7' },
  {
    value: 'custom',
    label: 'Custom Schedule',
  },
];

const ScheduleType = ({ config, selected, onChange }) => {
  const getTabStyles = (index) => {
    if (index === 0) return styles.tabStart;
    if (index === config.length - 1) return styles.tabEnd;
    return styles.tab;
  };

  return (
    <div>
      <span className={styles.sectionHeader}>Schedule Type</span>
      <div className={styles.tabsContainer}>
        {config.map(({ label, value }, index) => (
          <ButtonBase
            onClick={() => onChange(value)}
            style={{
              ...(selected === value
                ? { background: '#D9E2F3', border: '1px solid #293D63' }
                : {}),
            }}
            className={getTabStyles(index)}
            key={config.label}
          >
            {label}
          </ButtonBase>
        ))}
      </div>
    </div>
  );
};

const Header = ({ number }) => {
  const formattedNumber = '+1 ' + ayt.reset(number.toString().split('+1')[1]);
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mb-4">
      <span>Inbound Call Schedule</span>
      <span
        style={{
          fontWeight: 400,
          fontSize: 14,
          fontFamily: 'Montserrat',
          marginTop: '.5em',
        }}
      >{`Phone Number ${formattedNumber}`}</span>
    </div>
  );
};

const CallSchedule = () => {
  const [selectedTab, setSelectedTab] = useState(TABS[0].value);
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing',
  );
  const history = useHistory();
  const { numberId } = useParams();
  const { incomingCalls, notification } = useStores();
  const { state } = useLocation();
  const numberUuid = state?.uuid ?? null;

  const {
    data: scheduleData,
    isFetching,
    isLoading,
  } = useQuery(
    'getScheduleById',
    () => incomingCalls.getScheduleById(numberUuid),
    {
      enabled: !!numberUuid,
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the schedule',
        );
      },
      cacheTime: 0,
      retry: false,
    },
  );

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      if (scheduleData?.[0]?.schedule_type === 'custom') {
        setSelectedTab(TABS[1].value);
      } else {
        setSelectedTab(TABS[0].value);
      }
    }
  }, [scheduleData]);

  const handleClose = () => {
    history.push(match.url);
  };

  const isLoadingScheduleData = isLoading || isFetching;

  return (
    <Modal
      onClose={handleClose}
      header={<Header number={numberId} />}
      body={
        <div style={{ height: '100%' }}>
          {isLoadingScheduleData ? (
            <div className="d-flex justify-content-center align-items-center">
              <CircularProgress color="secondary" />
            </div>
          ) : (
            <>
              <ScheduleType
                selected={selectedTab}
                onChange={setSelectedTab}
                config={TABS}
              />
              {selectedTab === TABS[1].value ? (
                <CustomSchedule
                  scheduleData={scheduleData}
                  handleClose={handleClose}
                />
              ) : (
                <TwentyFourSevenSchedule
                  scheduleData={scheduleData}
                  handleClose={handleClose}
                />
              )}
            </>
          )}
        </div>
      }
    />
  );
};

export default observer(CallSchedule);
