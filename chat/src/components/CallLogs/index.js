import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useStores } from "hooks/useStores";
import { observer } from "mobx-react";
import { IconButton } from "@material-ui/core";
import PrintIcon from "assets/images/print.svg";
import MarkAsReadIcon from "assets/images/mark-as-read.svg";
import VoicemailIcon from "assets/images/voicemail.svg";
import CallsIcon from "assets/images/call.svg";
import LogslistHeader from "components/Logs/LogslistHeader";
import LogsList from "components/Logs/LogsList";
import PrintActivityLogs from "components/Logs/PrintActivityLogs";
import VerticalTabs from "components/Core/Tabs/VerticalTabs";
import { useMutation } from "react-query";
import LogsFilterMenu from "components/Logs/LogsFilterMenu";
import useCallLogs from "./queries/useCallLogs";
import useVoicemailLogs from "./queries/useVoiceMails";
import { LOGS_ENDPOINTS } from "stores/activityLog";

const CallLogsList = (props) => {
  return <LogsList {...props} />;
};

const VoicemailList = (props) => {
  return <LogsList {...props} />;
};

const callLogsInitialFilters = {
  incoming_call: true,
  outgoing_call: true,
  missed_call: true,
  filterType: "Lifetime",
};

const voicemailInitialFilters = {
  voicemail_call: true,
  filterType: "Lifetime",
};

const CallLogs = () => {
  const [callLogFilters, setCallLogFilters] = useState(callLogsInitialFilters);
  const [voicemailFilters, setVoicemailFilters] = useState(
    voicemailInitialFilters
  );
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const { activityLogs } = useStores();
  const [tabIndex, setTabIndex] = useState(0);

  const isCallLogs = tabIndex === 0;
  const isVoicemails = tabIndex === 1;

  useEffect(() => {
    activityLogs.setSelectedActivity({});
  }, [activityLogs, callLogFilters, voicemailFilters]);

  const {
    data: callLogs,
    fetchNextPage: fetchMoreCallLogs,
    isFetchingNextPage: isFetchingMoreCallLogs,
    isLoading: loadingCallLogs,
    isFetching: fetchingCallLogs,
    isFetched: callLogsFetched,
    refetch: refetchCallLogs,
  } = useCallLogs({
    ...callLogFilters,
    enabled: isCallLogs,
  });

  const {
    data: voicemails,
    fetchNextPage: fetchMoreVoicemails,
    isFetchingNextPage: fetchingMoreVoicemails,
    isLoading: loadingVoicemails,
    isFetching: fetchingVoicemails,
    isFetched: voicemailsFetched,
    refetch: refetchVoicemails,
  } = useVoicemailLogs({
    ...voicemailFilters,
    enabled: isVoicemails,
  });

  const markAllAsSeenMutation = useMutation(
    ["markAllCallsAsSeen"],
    (endpoint) => activityLogs.markAllAsSeen(endpoint),
    {
      onSuccess: () => {
        refetchCallLogs();
        refetchVoicemails();
      },
    }
  );

  const { data } = activityLogs.useUnseenCounts();

  const callsCount = data?.data?.calls?.Count || 0;
  const voicemailsCount = data?.data?.voicemails?.Count || 0;

  const isMarkAsSeenDisabled = () => {
    if (
      markAllAsSeenMutation.isLoading ||
      fetchingCallLogs ||
      fetchingVoicemails
    )
      return true;
    if (isCallLogs && !callsCount && !voicemailsCount) return true;
    if (isVoicemails && !voicemailsCount) return true;
    return false;
  };

  const canPrint = () => {
    switch (tabIndex) {
      case 0:
        return !callLogs?.pages?.[0]?.length;
      case 1:
        return !voicemails?.pages?.[0]?.length;
      default:
        return false;
    }
  };

  const TABS_CONFIG = [
    {
      index: 0,
      label: "Calls",
      icon: <CallsIcon fill="#02122F" />,
      component: (
        <CallLogsList
          data={callLogs?.pages.flat()}
          loadMore={fetchMoreCallLogs}
          loadingMore={isFetchingMoreCallLogs}
          isLoading={fetchingCallLogs}
          isLoaded={callLogsFetched}
        />
      ),
    },
    {
      index: 1,
      label: "Voicemail",
      icon: <VoicemailIcon fill="#02122F" />,
      component: (
        <VoicemailList
          data={voicemails?.pages.flat()}
          loadMore={fetchMoreVoicemails}
          loadingMore={fetchingMoreVoicemails}
          isLoading={fetchingVoicemails}
          isLoaded={voicemailsFetched}
        />
      ),
      notificationBlip: !!voicemailsCount,
    },
  ];

  const HEADER_CONFIG = [
    {
      id: 1,
      component: (
        <IconButton>
          <RefreshIcon style={{ color: "#02122F", fontSize: "18px" }} />
        </IconButton>
      ),
      onClick: isCallLogs ? refetchCallLogs : refetchVoicemails,
      tooltipText: "Refresh List",
    },
    {
      id: 2,
      component: (
        <IconButton
          style={{ opacity: isMarkAsSeenDisabled() ? 0.5 : 1 }}
          disabled={isMarkAsSeenDisabled()}
          onClick={() => {
            if (isCallLogs) {
              markAllAsSeenMutation.mutateAsync(LOGS_ENDPOINTS.calls);
              markAllAsSeenMutation.mutateAsync(LOGS_ENDPOINTS.voicemail);
            } else {
              markAllAsSeenMutation.mutateAsync(LOGS_ENDPOINTS.voicemail);
            }
          }}
        >
          <MarkAsReadIcon />
        </IconButton>
      ),
      tooltipText: "Mark All as Read",
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
      tooltipText: "Print Logs",
    },
    {
      id: 4,
      component: isCallLogs ? (
        <LogsFilterMenu
          filters={callLogFilters}
          setFilters={setCallLogFilters}
        />
      ) : (
        <LogsFilterMenu
          rangesOnly
          filters={voicemailFilters}
          setFilters={setVoicemailFilters}
        />
      ),
    },
  ];
  return (
    <>
      <div className={styles.container}>
        <LogslistHeader title={"Calls & VM"} config={HEADER_CONFIG} />
        <VerticalTabs
          config={TABS_CONFIG}
          defaultTabIndex={0}
          onChange={setTabIndex}
        />
      </div>
      {showPrintDialog && (
        <PrintActivityLogs
          endpoint={
            isCallLogs ? LOGS_ENDPOINTS.calls : LOGS_ENDPOINTS.voicemail
          }
          filters={{
            ...(isCallLogs ? callLogFilters : voicemailFilters),
          }}
          onClose={() => {
            setShowPrintDialog(false);
          }}
        />
      )}
    </>
  );
};

export default observer(CallLogs);
