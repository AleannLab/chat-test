import { useStores } from 'hooks/useStores';
import { useInfiniteQuery } from 'react-query';

export default function useActivityCallLogs({ enabled = false, ...filters }) {
  const { activityLogs } = useStores();
  const mutateFilters = { ...filters };
  delete mutateFilters?.filterType;
  return useInfiniteQuery(
    [activityLogs.queryKeys.activityCallLogs, filters],
    ({ pageParam = 0 }) =>
      activityLogs.getActivityLogs(
        {
          offset: pageParam,
          rows: 20,
          ...mutateFilters,
        },
        true,
        'calls',
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
