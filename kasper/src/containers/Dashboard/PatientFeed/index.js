import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ListPatientFeed from 'components/PatientFeed/_UIPatientFeed';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import styled from 'styled-components';
import { useStores } from 'hooks/useStores';
import PatientChat from 'components/PatientChat';
import { PatiendFeedPatientInfo } from './PatiendFeedPatientInfo';
import { PatientFeedTasksList } from './PatientFeedTasksList';
import { PatientFeedAppointmentsList } from './PatientFeedAppointmentsList';
import { Route, useHistory, useParams } from 'react-router-dom';
import AddTask from './AddTask';
import { observer } from 'mobx-react-lite';
import HeadComp from 'components/SEO/HelmetComp';
import NotificationPermissionHelper from 'components/NotificationPermissionHelper';
import { openPatientChat } from '../../../components/PatientFeed/patientFeedService';

import PatientPanel from './PatientPanel';

export default observer(function () {
  const classes = useStyles();
  const { patientsFeed } = useStores();
  const selectedPatient = patientsFeed.selectedPatient;
  const [OpenNotificationAlert, SetOpenNotificationAlert] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') SetOpenNotificationAlert(true);
    }
  }, []);

  let { patientName, patientID } = useParams();
  if (patientName != null && patientID != null) {
    openPatientChat({
      patientName: patientName,
      patientId: patientID,
      patientsFeed,
      history,
    });
  }

  return (
    <>
      <HeadComp title="Patient Communication" />
      <Route
        path="/dashboard/patient-feed/add-task/:operation"
        component={AddTask}
      />
      <Grid item component={Box} width="18%" minWidth={250}>
        <ListPatientFeed />
      </Grid>
      <Grid
        item
        xs
        component={Box}
        style={{ borderRight: '1px solid #BBC1CD', height: '100%' }}
      >
        <PatientChat />
      </Grid>
      <Grid
        item
        style={{ backgroundColor: 'white' }}
        minWidth={350}
        width="30%"
        height="100%"
        component={Box}
      >
        <PatientPanel />
      </Grid>
      {OpenNotificationAlert && patientsFeed.notificationAlert && (
        <NotificationPermissionHelper
          onClose={() => {
            SetOpenNotificationAlert(false);
            patientsFeed.setNotificationAlert(false);
          }}
        />
      )}
    </>
  );
});

const StyledRightSideBar = styled.div`
  .text:hover {
          color: yellow;
        text-align: left;
        font-weight: bold;
        margin-left: -8px;
        font-size: 14px;
        font-family: Montserrat;
      }
    
  .text {
          text - align: left;
        font-weight: bold;
        margin-left: -8px;
        font-size: 14px;
        font-family: Montserrat;
        max-width: 80%;
        min-width: 80%;
      }
    
  .icon {
          color: transparent;
      }
    
  .icon:hover {
          color: red;
      }
    
      /* textAlign: "left",
     fontWeight: "bold",
     // paddingLeft: "10px",
     marginLeft: "-8px",
     fontSize: "14px",
     fontFamily: "Montserrat", */
  .top {
          height: 50vh;
        background-color: white;
        left: 0;
      }
    
  .bottom {
          height: 50vh;
        background-color: #e5e5e5;
        border-top: 1px solid #bbc1cd;
      }
    
  .kanban-text {
          font - family: Playfair Display;
        font-style: normal;
        font-weight: bold;
        font-size: 15px;
        text-align: center;
        color: #0d2145;
        padding-bottom: 10px;
      }
    
  .task-label > p {
          font - weight: 500;
      }
    
  .task-label > p:hover {
          font - weight: bold;
      }
    
  .MuiCollapse-wrapper {
          flex: 1;
      }
    `;

export const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
  infoMessage: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#354159',
    fontFamily: 'Montserrat',
    color: '#F2F2F2',
    fontSize: '1.43rem',
    opacity: 0.9,
    padding: '2rem',
  },
}));
