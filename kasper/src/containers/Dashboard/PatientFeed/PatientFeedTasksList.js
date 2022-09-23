import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import Uparrow from 'assets/images/uparrow.svg';
import Button from '@material-ui/core/Button';
import { Scrollbars } from 'react-custom-scrollbars';
import { useStyles } from './index';
import { PatientFeedTasksListItem } from './PatientFeedTasksListItem';
import ListManager from 'components/ListManager';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import AddTask from 'containers/Dashboard/PatientFeed/AddTask';
import { Route } from 'react-router-dom';
import PatientFeedTaskListLoading from './PatientFeedTaskListLoading';
import { useQueryClient } from 'react-query';

export const PatientFeedTasksList = observer((props) => {
  const classes = useStyles();
  const history = useHistory();

  const queryClient = useQueryClient();

  const [expanded, setExpanded] = React.useState(true);
  const { patientsFeed, tasks } = useStores();
  let selectedPatient = patientsFeed.selectedPatient;

  if (!selectedPatient) selectedPatient = {};

  useEffect(() => {
    tasks.fetchList({ withCategories: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Route
        exact
        path="/dashboard/patient-feed/add-task"
        component={AddTask}
      />
      <Route
        exact
        path="/dashboard/patient-feed/edit-task"
        component={AddTask}
      />
      <Card
        style={{
          borderRadius: '0px',
          boxShadow: 'none',
          maxHeight: '300px',
          overflow: 'auto',
        }}
      >
        <CardActions disableSpacing style={{ background: '#E8E8E8' }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: '800',
              marginLeft: '16px',
              fontFamily: 'Playfair Display',
              fontSize: '18px',
              color: '#0D2145',
            }}
          >
            Patient Tasks
          </Typography>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <img src={Uparrow} alt="kasper" style={{ height: '7px' }} />
          </IconButton>
        </CardActions>
        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          style={{ marginRight: '14px' }}
        >
          {!!queryClient.getQueryData('patientFeed') &&
            queryClient.getQueryData('patientFeed').pages[0].length > 0 && (
              <div style={{ marginTop: '5px', marginLeft: '25px' }}>
                <Button
                  onClick={() => {
                    history.push({
                      pathname: '/dashboard/patient-feed/add-task',
                      state: {
                        patient: patientsFeed.selected,
                      },
                    });
                  }}
                  style={{
                    color: '#F4266E',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'none',
                    fontFamily: 'Montserrat',
                    visibility:
                      selectedPatient.is_patient === 0 ? 'hidden' : 'visible',
                  }}
                >
                  + Add Task
                </Button>
              </div>
            )}

          <Scrollbars
            style={{ height: '150px' }}
            renderTrackHorizontal={(props) => <div {...props} />}
          >
            <CardContent className="py-1">
              <Grid
                container
                className="py-2"
                style={{ marginTop: '-5px', marginLeft: '5px' }}
              >
                {selectedPatient.is_patient === 1 && (
                  <ListManager
                    loading={tasks.loading}
                    loaded={tasks.loaded}
                    data={tasks.getTasksByPatient(selectedPatient.id)}
                    render={React.memo(PatientFeedTasksListItem)}
                    emptyMessage={
                      <p
                        style={{ width: '100%', textAlign: 'center' }}
                        className="pt-5"
                      >
                        No tasks here.
                      </p>
                    }
                    renderLoading={<PatientFeedTaskListLoading />}
                  />
                )}
              </Grid>
            </CardContent>
          </Scrollbars>
        </Collapse>
      </Card>
    </div>
  );
});
