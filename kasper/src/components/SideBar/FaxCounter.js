import React from 'react';
import { useStores } from 'hooks/useStores';

export default React.memo(function FaxCounter({ className }) {
  const { activityLogs } = useStores();

  const { data } = activityLogs.useUnseenCounts();

  const count = data?.data?.fax?.Count || 0;
  if (count <= 0) {
    return null;
  }

  return <div className={className}>{count > 9 ? '9+' : count}</div>;
});
