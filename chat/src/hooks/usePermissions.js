import { useQuery } from 'react-query';
import { useStores } from './useStores';
import { PERMISSION_IDS } from '../helpers/constants';

export function usePermissions() {
  const { permissions, notification, authentication } = useStores();
  const user = authentication.user || {};
  return useQuery(
    ['userPermissions', user.id],
    () => permissions.getUserPermissions(user.id),
    {
      refetchOnMount: false,
      enabled: !!user.id,
      select: (data) => {
        // if permissions doesn't exists, returns true
        const getPermission = (permissionId) => {
          return (
            data.find((permission) => permission.permission_id === permissionId)
              ?.enabled ?? true
          );
        };

        return {
          canViewTasks: getPermission(PERMISSION_IDS.TASKS),
          canViewCalendar: getPermission(PERMISSION_IDS.CALENDAR),
          canViewSwell: getPermission(PERMISSION_IDS.SWELL),
          canViewPaperlessForms: getPermission(PERMISSION_IDS.PAPERLESS_FORMS),
          canViewPaperlessFormsAutomation: getPermission(
            PERMISSION_IDS.PAPERLESS_FORMS_SETTINGS,
          ),
        };
      },
      onError: (err) => {
        // notification.showError(err.message);
      },
    },
  );
}
