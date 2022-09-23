import React, { useMemo } from 'react';
import styles from './index.module.css';
import {
  Route,
  useRouteMatch,
  Redirect,
  Link,
  useLocation,
} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import MyProfile from './MyProfile';
import UserManagement from './UserManagement';
import InviteUser from 'components/InviteUser';
import PhoneAndFax from './PhoneAndFax';
import OfficeSettings from './OfficeSettings';
import AddTime from 'components/AddTime/index';
// import PaperlessFormsSettings from "./PaperlessFormsSettings/index";
import OfficeAutomation from './OfficeAutomation';
import OnlineScheduling from './OnlineScheduling';
import Support from './Support';
import AutoReminders from './AutoReminders';
import ServerSettings from './ServerSettings';
import PaperlessForms from './PaperlessForms';
import Integrations from './Integrations';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react-lite';
import CreateIvr from 'components/CreateIvr';
import CreateGroup from 'components/CreateGroup';
import { useQuery } from 'react-query';
import HeadComp from 'components/SEO/HelmetComp';
import { ReactComponent as HelpIcon } from 'assets/images/help-outlined.svg';
import Tooltip from 'components/Core/Tooltip';
import PermissionsOverlay from 'components/PermissionsOverlay';
import { useFlags } from 'launchdarkly-react-client-sdk';
import PhoneAndFaxNew from './PhoneAndFaxNew';

const getCategories = (accountType, ...flags) => {
  if (accountType === 'Admin') {
    const [localServerAppStatusPage, formAutomation] = flags;
    //Admin categories
    return [
      { label: 'My Profile', path: '/my-profile' },
      // { label: "Security & Compliance", path: "/security-and-compliance" },
      { label: 'User Management', path: '/user-management' },
      ...(!formAutomation
        ? [{ label: 'Office Automation', path: '/office-automation' }]
        : []),
      { label: 'Online Scheduling', path: '/online-scheduling' },
      { label: 'Phone & Fax', path: '/phone-and-fax' },
      { label: 'Office Settings', path: '/office-settings' },
      // { label: "Paperless Forms", path: "/paperless-forms-settings" }
      { label: 'Support', path: '/support' },
      { label: 'Auto Reminders', path: '/auto-reminders' },
      ...(localServerAppStatusPage
        ? [{ label: 'Kasper Server App', path: '/server-settings' }]
        : []),
      { label: 'Paperless Forms', path: '/paperless-forms' },
    ];
  } else {
    //General categories
    return [
      { label: 'My Profile', path: '/my-profile' },
      // { label: "Security & Compliance", path: "/security-and-compliance" },
      { label: 'Support', path: '/support' },
    ];
  }
};

const CategoryItem = ({ label, path, active, disabled }) => (
  <Link
    className={`${styles.category} ${active && styles.selectedCategory} ${
      disabled && styles.disabledCategory
    }`}
    to={path}
  >
    {label}
    {disabled && (
      <Tooltip
        title="Contact admin to enable permissions."
        color="#000000"
        maxWidth={500}
        placement="top-start"
        style={{
          cursor: 'pointer',
          position: 'absolute',
          right: '5px',
          top: '5px',
        }}
      >
        <HelpIcon />
      </Tooltip>
    )}
  </Link>
);

const Settings = observer(() => {
  const { authentication, permissions, notification } = useStores();
  const match = useRouteMatch('/dashboard/settings');
  const location = useLocation();
  var user = authentication.user || {};

  const { localServerAppStatusPage, formAutomation, multiNumberSupport } =
    useFlags();

  const categories = useMemo(
    () =>
      getCategories(
        user.account_type,
        localServerAppStatusPage,
        formAutomation,
      ),
    [user.account_type, localServerAppStatusPage, formAutomation],
  );

  // React query to fetch user permission by user id
  const userPermissionsQuery = useQuery(
    ['userPermissions', user.id],
    () => permissions.getUserPermissions(user.id),
    {
      enabled: !!user.id,
      select: (data) => {
        return data.find((p) => p.permission_id === 4);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const isCurrentRoute = (path) => {
    return location.pathname.indexOf(`${match.url}${path}`) > -1;
  };

  return (
    <>
      <HeadComp title="Settings" />
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={12} sm={3} className={styles.listContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.listHeader}>Settings</div>
            <div className={styles.listSubHeader}>Categories</div>
          </div>
          <div className="d-flex flex-column overflow-auto">
            {categories.map((category, i) => (
              <CategoryItem
                key={i}
                label={category.label}
                active={isCurrentRoute(category.path)}
                path={`${match.url}${category.path}`}
                disabled={category?.disabled}
              />
            ))}
            <CategoryItem
              label="Integrations"
              key={userPermissionsQuery?.data?.id}
              active={isCurrentRoute('/integrations')}
              path={`${match.url}/integrations`}
              disabled={!userPermissionsQuery?.data?.enabled}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={9} className={styles.detailsPane}>
          <Route exact path={`${match.url}`}>
            <Redirect to={`${match.url}${categories[0].path}`} />
          </Route>
          <Route path={`${match.url}/my-profile`} component={MyProfile} />
          <Route
            path={`${match.url}/user-management`}
            component={UserManagement}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/user-management/invite-user`}
            component={InviteUser}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/phone-and-fax/ivr-settings/create-ivr/:id?`}
            component={CreateIvr}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/phone-and-fax/call-groups/create-group/:id?`}
            component={CreateGroup}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/phone-and-fax`}
            component={multiNumberSupport ? PhoneAndFaxNew : PhoneAndFax}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/online-scheduling`}
            component={OnlineScheduling}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/phone-and-fax/out-of-office/add-time`}
            component={AddTime}
          />
          <Route
            path={`${match.url}/office-settings`}
            component={OfficeSettings}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          {/* <Route path={`${match.url}/paperless-forms-settings`} component={PaperlessFormsSettings} /> */}
          <Route
            path={`${match.url}/office-automation`}
            component={OfficeAutomation}
          >
            {(user.account_type !== 'Admin' || formAutomation) && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route path={`${match.url}/support`} component={Support} />
          <Route
            path={`${match.url}/auto-reminders`}
            component={AutoReminders}
          />
          <Route
            path={`${match.url}/server-settings`}
            component={ServerSettings}
          >
            {!localServerAppStatusPage && (
              <Redirect to={`${match.url}/my-profile`} />
            )}
          </Route>

          <Route
            path={`${match.url}/paperless-forms`}
            component={PaperlessForms}
          />
          <Route
            path={`${match.url}/integrations`}
            component={
              userPermissionsQuery?.data?.enabled
                ? Integrations
                : PermissionsOverlay
            }
          />
        </Grid>
      </Grid>
    </>
  );
});

export default Settings;
