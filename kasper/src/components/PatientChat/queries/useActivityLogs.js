import { useStores } from 'hooks/useStores';
import { useInfiniteQuery } from 'react-query';

export default function useActivityLogs({
  patientId,
  phoneNo,
  enabled = false,
}) {
  const { activityLogs } = useStores();
  return useInfiniteQuery(
    [activityLogs.queryKeys.activityLogs],
    ({ pageParam = 0 }) =>
      activityLogs.getActivityLogs({
        patientId: patientId,
        phoneNo: phoneNo,
        offset: pageParam,
        rows: 20,
      }),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.length < 20) return undefined;
        return allPages.flat().length;
      },
      enabled: enabled,
    },
  );
}
