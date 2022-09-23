import React from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { ListPatientFeedItem } from './ListPatientFeedItem';
import { ListPatientFeedHeader } from './ListPatientFeedHeader';
import { Scrollbars } from 'react-custom-scrollbars';
import PatientItemLoading from './PatientItemLoading';
import { observer } from 'mobx-react';
import {
  restoreSelectedPosition,
  useLoadPatientFeed,
  useUnseenCounts,
} from './patientFeedService';
import { useStores } from 'hooks/useStores';
import { ReactComponent as UnreadMessagesIcon } from 'assets/images/unread-messages.svg';
import RefreshIcon from '@material-ui/icons/Refresh';
import { useQueryClient } from 'react-query';

const StyledPatientList = styled.div`
  .patient-badge [class^='MuiBadge-badge-'] {
    background: #ff0000;
    border: 0.4px solid #0d2145;
    box-sizing: border-box;
    border-radius: 3px;
  }
`;

export default observer(function () {
  const classes = useStyles();
  const scrollbarsRef = React.useRef();
  const { data, fetchNextPage, isFetchingNextPage, status, isRefetching } =
    useLoadPatientFeed();
  const { data: unseenCounts = {} } = useUnseenCounts(data);

  React.useEffect(() => {
    if (status === 'success' && isRefetching) {
      restoreSelectedPosition(scrollbarsRef.current.view);
    }
  }, [data, status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StyledPatientList>
      <Box
        height="calc(100vh - 64px)"
        className={classes.root}
        style={{
          display: 'flex',
          flexFlow: 'column',
        }}
      >
        <ListPatientFeedHeader />
        <Scrollbars
          ref={scrollbarsRef}
          style={{ height: 'calc(100vh - 64px)' }}
          renderTrackHorizontal={(props) => <div {...props} />}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...style,
                backgroundColor: '#BBC1CD',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: 0.5,
              }}
            />
          )}
          onScroll={(event) => {
            if (
              event.target.scrollTop + event.target.clientHeight >=
              event.target.scrollHeight - 500
            ) {
              if (!isFetchingNextPage) {
                fetchNextPage();
              }
            }
          }}
        >
          {status === 'success' ? (
            data.pages[0].length > 0 ? (
              data.pages.map((page) =>
                page.map((patient, i) => (
                  <ListPatientFeedItem
                    key={i}
                    patient={patient}
                    unseenCount={unseenCounts[patient.phone_no]}
                  />
                )),
              )
            ) : (
              <NoMsgPlaceholder />
            )
          ) : (
            [...Array(5)].map((x, i) => (
              <PatientItemLoading variant="rect" height={70} key={i} />
            ))
          )}
        </Scrollbars>
      </Box>
    </StyledPatientList>
  );
});

export const useStyles = makeStyles((theme) => ({
  root: { backgroundColor: '#243656f0' },
}));

const NoMsgPlaceholder = () => {
  const { patientsFeed } = useStores();
  const queryClient = useQueryClient();

  const handleRefreshBtnClick = async () => {
    patientsFeed.refetchPatientFeed();
    await queryClient.refetchQueries([
      'patient-chat',
      patientsFeed.selectedPatient.phone_no,
    ]);
    patientsFeed.setPendingUnseenSms(false);
  };

  return (
    <div className="text-center pt-5">
      {patientsFeed.smsUnseenOnly ? (
        patientsFeed.pendingUnseenSms ? (
          <>
            <RefreshIcon
              style={{
                height: '2rem',
                width: '2rem',
                marginBottom: '1rem',
                color: '#cccccc',
              }}
              onClick={handleRefreshBtnClick}
            />
            <div style={{ color: '#cccccc', padding: '0 1rem' }}>
              Click to refresh unread messages or disable filter
            </div>
          </>
        ) : (
          <>
            <UnreadMessagesIcon
              style={{ height: '2rem', width: '2rem', marginBottom: '1rem' }}
            />
            <div style={{ color: '#cccccc' }}>No unread messages!</div>
          </>
        )
      ) : (
        <>
          <UnreadMessagesIcon
            style={{ height: '2rem', width: '2rem', marginBottom: '1rem' }}
          />
          <div style={{ color: '#cccccc' }}>No messages found!</div>
        </>
      )}
    </div>
  );
};
