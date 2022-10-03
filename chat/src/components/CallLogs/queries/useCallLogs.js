import { isVoicemail } from 'components/Logs/activityType';
import { useStores } from 'hooks/useStores';
import { useInfiniteQuery } from 'react-query';
import { LOGS_ENDPOINTS } from 'stores/activityLog';

export default function useCallLogs({ enabled = false, ...filters }) {
  const { activityLogs } = useStores();
  const mutateFilters = { ...filters };
  delete mutateFilters?.filterType;
  return useInfiniteQuery(
    [activityLogs.queryKeys.callLogs, filters],
    ({ pageParam = 0 }) =>
      activityLogs.listApiHandler(
        {
          offset: pageParam,
          rows: 20,
          ...mutateFilters,
        },
        LOGS_ENDPOINTS.calls,
        false,
      ),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 20) return undefined;
        return allPages.flat().length;
      },
      enabled: enabled,
      select: (data) => {
        const pages = data?.pages.map((page) =>
          page.map((log) => {
            //if a voicemail then show it as a missed call
            if (isVoicemail(log?.log_type_id)) {
              return { ...log, log_type_id: 4 };
            }
            return log;
          }),
        );
        return { ...data, pages };
      },
    },
  );
}
