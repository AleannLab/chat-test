import { useStores } from 'hooks/useStores';
import { useInfiniteQuery } from 'react-query';
import { LOGS_ENDPOINTS } from 'stores/activityLog';

export default function useVoicemailLogs({ enabled = false, ...filters }) {
  const { activityLogs } = useStores();
  const mutateFilters = { ...filters };
  delete mutateFilters?.filterType;
  delete mutateFilters?.voicemail_call;
  return useInfiniteQuery(
    [activityLogs.queryKeys.voicemailLogs, filters],
    ({ pageParam = 0 }) =>
      activityLogs.listApiHandler(
        {
          offset: pageParam,
          rows: 20,
          ...mutateFilters,
        },
        LOGS_ENDPOINTS.voicemail,
        false,
      ),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 20) return undefined;
        return allPages.flat().length;
      },
      enabled: enabled,
    },
  );
}
