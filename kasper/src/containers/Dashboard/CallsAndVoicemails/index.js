import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import CallLogs from 'components/CallLogs';
import LogHeader from '../../../components/Logs/LogHeader/index';
import CallAudio from '../../../components/CallLogs/CallAudio/index';
import { Route } from 'react-router-dom';
import AddTask from 'containers/Dashboard/PatientFeed/AddTask';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useAuthToken } from 'hooks/useAuthToken';
import HeadComp from 'components/SEO/HelmetComp';
import { getActivityType, isVoicemail } from 'components/Logs/activityType';
import NoCallsSelected from 'components/CallLogs/NoCallsSelected';
import MissedCallIllustration from 'components/CallLogs/MissedCallIllustration';

const CallsAndVoicemails = observer(function ({ id, ...props }) {
  const { activityLogs, utils } = useStores();
  const selectedActivity = activityLogs.selectedActivity || {};
  const noCallsSelected = !Object.keys(selectedActivity).length;
  const activityType = getActivityType(Number(selectedActivity.log_type_id));
  const authToken = useAuthToken();

  const isMissedCallVM =
    selectedActivity?.log_type_id === 4 && selectedActivity.media_uuid;

  return (
    <>
      <HeadComp title="Calls & VM" />
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={12} sm={3} className={styles.listContainer}>
          <CallLogs />
        </Grid>
        <Grid item xs={12} sm={9} className={styles.detailsPane}>
          {noCallsSelected ? (
            <NoCallsSelected />
          ) : (
            <>
              <div className={styles.headerContainer}>
                <LogHeader />
              </div>
              <div className={styles.bodyContainer}>
                {(isVoicemail(activityType?.value) ||
                  isMissedCallVM ||
                  activityType?.value === 2 ||
                  activityType?.value === 3) && (
                  <CallAudio
                    file={utils.prepareMediaUrl({
                      uuid: selectedActivity.media_uuid,
                      authToken,
                    })}
                    recording_type={
                      activityType &&
                      (activityType.value === 5 || isMissedCallVM)
                        ? 'Voicemail'
                        : 'Call Recording'
                    }
                    seen={selectedActivity.seen}
                    providerId={selectedActivity.provider_id}
                    uuid={selectedActivity.uuid}
                    callType={activityType}
                    callNum={{
                      from_did: selectedActivity.from_did,
                      to_did: selectedActivity.to_did,
                    }}
                    callDate={selectedActivity.datetime}
                  />
                )}
                {activityType?.value === 4 && !isMissedCallVM && (
                  <MissedCallIllustration />
                )}
              </div>
            </>
          )}
        </Grid>
      </Grid>
      <Route exact path="/dashboard/office-task/add-task" component={AddTask} />
    </>
  );
});

export default CallsAndVoicemails;
