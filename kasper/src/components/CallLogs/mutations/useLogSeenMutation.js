import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';

export default function useLogSeenMutation() {
  const { activityLogs } = useStores();
  const queryClient = useQueryClient();

  return useMutation(
    'selectLogMutation',
    () => {
      activityLogs.onSelectLog();
    },
    {
      onMutate: () => {
        const activity = activityLogs.selectedActivity;
        if (activity.seen) return;
        const logsQueryKeys = activityLogs.getQueryKeysByLogType(
          activity.log_type_id,
        );
        const [queryKeys, prevData] =
          queryClient.getQueriesData([logsQueryKeys])?.[0] ?? [];
        const newPagesArray =
          prevData?.pages.map((page) =>
            page.map((val) => {
              if (val.uuid === activity.uuid) {
                return { ...val, seen: true };
              } else return val;
            }),
          ) ?? [];
        queryClient.setQueryData(queryKeys, (prevData) => ({
          ...prevData,
          pages: newPagesArray,
        }));
      },
    },
  );
}
