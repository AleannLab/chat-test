import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { ReactComponent as PrintIcon } from 'assets/images/print.svg';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { ReactComponent as FaxOutgoing } from 'assets/images/fax-outgoing.svg';
import { ReactComponent as FaxIncoming } from 'assets/images/fax-incoming.svg';
import { ReactComponent as FaxIcon } from 'assets/images/fax.svg';
import LogslistHeader from 'components/Logs/LogslistHeader';
import { ReactComponent as MarkAsReadIcon } from 'assets/images/mark-as-read.svg';
import PrintActivityLogs from 'components/Logs/PrintActivityLogs';
import LogsList from 'components/Logs/LogsList';
import VerticalTabs from 'components/Core/Tabs/VerticalTabs';
import LogsFilterMenu from 'components/Logs/LogsFilterMenu';
import { useMutation } from 'react-query';
import useFaxLogs from 'components/CallLogs/queries/useFaxLogs';
import { LOGS_ENDPOINTS } from 'stores/activityLog';

const FaxList = (props) => {
  return <LogsList {...props} />;
};

const initialFilter = {
  incoming_fax: true,
  outgoing_fax: true,
  filterType: 'Lifetime',
};

const FaxLogs = () => {
  const [faxFilters, setFaxFilters] = useState(initialFilter);
  const [tabIndex, setTabIndex] = useState(0);

  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const history = useHistory();
  const match = useRouteMatch('/dashboard/fax');
  const { activityLogs } = useStores();

  const isAllFax = tabIndex === 0;
  const isSentFax = tabIndex === 1;
  const isReceivedFax = tabIndex === 2;

  useEffect(() => {
    activityLogs.setSelectedActivity({});
  }, [activityLogs, faxFilters]);

  const commonFilter = {
    filterType: faxFilters?.filterType ?? 'Lifetime',
    start_date: faxFilters?.start_date,
    end_date: faxFilters?.end_date,
  };

  const allFaxFilter = {
    incoming_fax: true,
    outgoing_fax: true,
    ...commonFilter,
  };

  const sentFaxFilter = {
    outgoing_fax: true,
    ...commonFilter,
  };

  const receivedFaxFilter = {
    incoming_fax: true,
    ...commonFilter,
  };

  const updateFilters = () => {
    if (isAllFax) {
      setFaxFilters(allFaxFilter);
    }
    if (isSentFax) {
      setFaxFilters(sentFaxFilter);
    }
    if (isReceivedFax) {
      setFaxFilters(receivedFaxFilter);
    }
    return;
  };

  useEffect(() => {
    updateFilters();
  }, [tabIndex]); // eslint-disable-line

  const {
    data: faxLogs,
    fetchNextPage: fetchMoreFaxLogs,
    isFetchingNextPage: fetchingMoreFaxLogs,
    isLoading: faxLogsLoading,
    isLoaded: faxLogsLoaded,
    isFetching: fetchingFaxLogs,
    isFetched: faxLogsFetched,
    refetch: refetchFaxLogs,
  } = useFaxLogs({ ...faxFilters });

  const markAllAsSeenMutation = useMutation(
    ['markAllCallsAsSeen'],
    () => activityLogs.markAllAsSeen(LOGS_ENDPOINTS.faxes),
    {
      onSuccess: refetchFaxLogs,
    },
  );

  const { data: countsData } = activityLogs.useUnseenCounts();

  const faxCount = countsData?.data?.fax?.Count || 0;

  const triggerSendFaxModal = () => history.push(`${match.url}/send-fax`);

  const canPrint = () => {
    if ([0, 1, 2].includes(tabIndex)) {
      return !faxLogs?.pages?.[0]?.length;
    }
    return false;
  };

  const HEADER_CONFIG = [
    {
      id: 1,
      component: (
        <IconButton>
          <RefreshIcon style={{ color: '#02122F', fontSize: '18px' }} />
        </IconButton>
      ),
      onClick: refetchFaxLogs,
      tooltipText: 'Refresh List',
    },
    {
      id: 2,
      component: (
        <IconButton
          style={{ opacity: !faxCount ? 0.5 : 1 }}
          disabled={!faxCount}
          onClick={markAllAsSeenMutation.mutateAsync}
        >
          <MarkAsReadIcon />
        </IconButton>
      ),
      tooltipText: 'Mark All as Read',
    },
    {
      id: 3,
      component: (
        <IconButton
          onClick={() => setShowPrintDialog(true)}
          style={{ opacity: canPrint() ? 0.5 : 1 }}
          disabled={canPrint()}
        >
          <PrintIcon />
        </IconButton>
      ),

      tooltipText: 'Print Logs',
    },
    {
      id: 4,
      component: (
        <LogsFilterMenu
          filters={faxFilters}
          setFilters={setFaxFilters}
          rangesOnly
        />
      ),
    },
  ];

  const List = (
    <FaxList
      data={faxLogs?.pages.flat()}
      loadMore={fetchMoreFaxLogs}
      loadingMore={fetchingMoreFaxLogs}
      isLoading={fetchingFaxLogs}
      isLoaded={faxLogsFetched}
      fabLabel="Send Fax"
      fabIcon={<FaxIcon />}
      onFabClick={triggerSendFaxModal}
    />
  );

  const TABS_CONFIG = [
    {
      index: 0,
      label: 'All',
      component: List,
    },
    {
      index: 1,
      label: 'Sent',
      icon: <FaxOutgoing fill="#02122F" />,
      component: List,
    },
    {
      index: 2,
      label: 'Received',
      icon: <FaxIncoming fill="#02122F" />,
      component: List,
    },
  ];

  return (
    <div className={styles.container}>
      <LogslistHeader title="Fax" config={HEADER_CONFIG} />
      <VerticalTabs
        config={TABS_CONFIG}
        onChange={setTabIndex}
        defaultTabIndex={0}
      />
      {showPrintDialog && (
        <PrintActivityLogs
          filters={{ ...faxFilters }}
          onClose={() => {
            setShowPrintDialog(false);
          }}
          endpoint={'/faxes'}
        />
      )}
    </div>
  );
};

export default observer(FaxLogs);
