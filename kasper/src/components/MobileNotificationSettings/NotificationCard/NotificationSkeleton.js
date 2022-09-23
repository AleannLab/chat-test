import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Skeleton from '@material-ui/lab/Skeleton';

import { ReactComponent as BellIcon } from '../assets/bell.svg';

const NotificationSkeleton = () => {
  return (
    <Card>
      <CardHeader
        style={{ background: '#D9E2F3', height: '50px' }}
        avatar={<BellIcon />}
        action={
          <CloseIcon
            style={{
              color: '#9A9A9A',
              marginTop: '8px',
              marginRight: '8px',
              cursor: 'pointer',
            }}
          />
        }
      />
      <CardContent>
        <Grid container>
          <Grid item xs={12} className="mt-0 mb-0 pb-0">
            <InputLabel>NOTIFICATION</InputLabel>
            <Skeleton
              variant="rect"
              animation="wave"
              width="100%"
              height={20}
            />
          </Grid>
          <Grid container className="mt-4">
            <Grid item xs={6} className="mt-0 mb-0 pe-2">
              <InputLabel>TIME</InputLabel>
              <Skeleton
                variant="rect"
                animation="wave"
                width="100%"
                height={20}
              />
            </Grid>
            <Grid item xs={6} className="mt-0 mb-0 ps-2">
              <InputLabel style={{ visibility: 'hidden' }}>
                {' '}
                PLACEHOLDER
              </InputLabel>
              <Skeleton
                variant="rect"
                animation="wave"
                width="100%"
                height={20}
              />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NotificationSkeleton;
