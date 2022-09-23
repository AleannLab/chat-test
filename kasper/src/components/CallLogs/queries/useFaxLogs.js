import { useStores } from 'hooks/useStores';
import { useInfiniteQuery } from 'react-query';
import { LOGS_ENDPOINTS } from 'stores/activityLog';

export default function useFaxLogs({ ...filters }) {
  const { activityLogs } = useStores();
  const mutateFilters = { ...filters };
  delete mutateFilters?.filterType;
  return useInfiniteQuery(
    [activityLogs.queryKeys.faxLogs, filters],
    ({ pageParam = 0 }) =>
      activityLogs.listApiHandler(
        {
          offset: pageParam,
          rows: 20,
          ...mutateFilters,
        },
        LOGS_ENDPOINTS.faxes,
        false,
      ),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 20) return undefined;
        return allPages.flat().length;
      },
    },
  );
}
