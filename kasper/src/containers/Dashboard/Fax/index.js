import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import LogHeader from '../../../components/Logs/LogHeader/index';
import PDFViewer from '../../../components/Core/PDFViewer';
import { Route, Redirect } from 'react-router-dom';
import SendFax from 'components/SendFax';
import AddTask from 'containers/Dashboard/PatientFeed/AddTask';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useAuthToken } from 'hooks/useAuthToken';
import HeadComp from 'components/SEO/HelmetComp';
import FaxLogs from 'components/FaxLogs';
import { getActivityType } from 'components/Logs/activityType';
import NoFaxSelected from 'components/FaxLogs/NoFaxSelected';
import { FAX_LOADING_STATUS } from 'helpers/constants';

const Fax = observer(function ({ id, ...props }) {
  const { activityLogs, utils, notification } = useStores();
  const selectedActivity = activityLogs.selectedActivity || {};
  const noFaxSelected = !Object.keys(selectedActivity).length;
  const activityType = getActivityType(Number(selectedActivity.log_type_id));
  const authToken = useAuthToken();

  const file = utils.prepareMediaUrl({
    uuid: selectedActivity.media_uuid,
    authToken,
  });

  const status = selectedActivity?.status?.toLowerCase() ?? '';

  return (
    <>
      <HeadComp title="Fax" />
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={12} sm={3} className={styles.listContainer}>
          <FaxLogs />
        </Grid>
        <Grid item xs={12} sm={9} className={styles.detailsPane}>
          {noFaxSelected ? (
            <NoFaxSelected />
          ) : (
            <>
              <div className={styles.headerContainer}>
                <LogHeader />
              </div>
              <div className={styles.bodyContainer}>
                {activityType &&
                (activityType.value === 6 || activityType.value === 7) ? (
                  <PDFViewer
                    allowDelete={!FAX_LOADING_STATUS.includes(status)}
                    showControls={Boolean(file)}
                    onPrint={() => notification.showInfo('Generating File')}
                    onPrinted={() => notification.hideNotification()}
                    file={file}
                  />
                ) : null}
              </div>
            </>
          )}
        </Grid>
      </Grid>
      <Route exact path="/dashboard/fax/send-fax" component={SendFax} />
      <Route exact path="/dashboard/office-task/add-task" component={AddTask} />
    </>
  );
});

export default Fax;
