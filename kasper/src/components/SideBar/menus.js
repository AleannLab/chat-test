import React from 'react';
import { FEATURES } from 'helpers/constants';
import Image from 'assets/images/img.svg';
import Comment from 'assets/images/comment.svg';
import { ReactComponent as CalendarIcon } from 'assets/images/calendar.svg';
import Image1 from 'assets/images/img1.svg';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ChatIcon from '@material-ui/icons/Chat';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { ReactComponent as Inbox } from 'assets/images/inbox.svg';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import CallsAndFaxCounter from './CallsAndFaxCounter';
import { ReactComponent as FaxIcon } from 'assets/images/fax.svg';
import { ReactComponent as CallsIcon } from 'assets/images/call.svg';
import { ReactComponent as AnalyticsIcon } from 'assets/images/graph-trending-up.svg';
import CallsCounter from './CallsCounter';
import FaxCounter from './FaxCounter';
import { ReactComponent as SwellIcon } from 'assets/images/swell-logo.svg';
import { useFlags } from 'launchdarkly-react-client-sdk';
import ForumIcon from '@material-ui/icons/Forum';

import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import CommunicationCounter from './CommunicationCounter';
import { usePermissions } from '../../hooks/usePermissions';

const FaxIconBigger = (props) => <FaxIcon {...props} height={18} width={18} />;
const CallsIconBigger = (props) => (
  <CallsIcon {...props} height={18} width={18} />
);

export const useMenu = () => {
  const { analyticsView, chatKitty } = useFlags();
  const { integrations, notification } = useStores();
  const userPermissionsQuery = usePermissions();
  const menuConfigQuery = useQuery(
    ['officeConfigs', 'integrations'],
    () =>
      integrations.getConfigs(
        'swell_integration_token_id,swell_integration_enabled',
      ),
    {
      enabled: userPermissionsQuery.isSuccess,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  if (userPermissionsQuery.isLoading || menuConfigQuery.isLoading) {
    return { isLoading: true, menuItems: [] };
  } else if (userPermissionsQuery.isSuccess && menuConfigQuery.isSuccess) {
    return {
      isLoading: false,
      menuItems: [
        {
          name: 'Dashboard',
          icon: DashboardIcon,
          selectedIcon: Image,
          to: '/dashboard/office-task',
        },
        {
          name: 'Communication',
          icon: ChatIcon,
          selectedIcon: Comment,
          to: '/dashboard/patient-feed',
          counter: CommunicationCounter,
        },
        {
          name: 'Tasks',
          icon: CheckBoxIcon,
          selectedIcon: Image1,
          to: '/dashboard/tasks',
          hidden: !userPermissionsQuery.data.canViewTasks,
        },
        {
          name: 'Calls & VM',
          icon: CallsIconBigger,
          selectedIcon: CallsIcon,
          to: '/dashboard/calls',
          counter: CallsCounter,
        },
        {
          name: 'Fax',
          icon: FaxIconBigger,
          selectedIcon: FaxIcon,
          to: '/dashboard/fax',
          counter: FaxCounter,
        },
        {
          name: 'Calendar',
          icon: CalendarIcon,
          selectedIcon: CalendarIcon,
          to: '/dashboard/calendar',
          enabled: FEATURES.OFFICE_SCHEDULING,
          hidden: !userPermissionsQuery.data.canViewCalendar,
        },
        {
          name: 'Paperless Forms',
          icon: AssignmentIcon,
          selectedIcon: AssignmentIcon,
          to: '/dashboard/paperless-forms',
          hidden: !userPermissionsQuery.data.canViewPaperlessForms,
        },
        {
          name: 'Settings',
          icon: SettingsIcon,
          selectedIcon: SettingsIcon,
          to: '/dashboard/settings',
        },
        {
          name: 'Analytics',
          icon: AnalyticsIcon,
          selectedIcon: AnalyticsIcon,
          to: '/dashboard/analytics',
          hidden: !analyticsView,
        },
        {
          name: 'Swell',
          icon: SwellIcon,
          selectedIcon: SwellIcon,
          to: '/dashboard/swell',
          enabled: userPermissionsQuery.data.canViewSwell,
          hidden: menuConfigQuery.data.swell_integration_enabled !== 'true',
        },
        {
          name: 'Office Chat',
          icon: ForumIcon,
          selectedIcon: ForumIcon,
          to: '/dashboard/office-chat',
          hidden: !chatKitty,
        },
      ],
    };
  } else {
    return { isLoading: false, menuItems: [] };
  }
};
