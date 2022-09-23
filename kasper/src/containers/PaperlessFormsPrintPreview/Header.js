import React from 'react';
import { Grid } from '@material-ui/core';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import { ReactComponent as PoweredByKasper } from 'assets/images/powered-by-kasper.svg';
import RoomIcon from '@material-ui/icons/Room';
import CallIcon from '@material-ui/icons/Call';

export default function Header() {
  const { patientForm, notification } = useStores();

  const { data, isSuccess } = useQuery(
    'officeInfo',
    () => patientForm.fetchOfficeInformation(),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const {
    office_profile_pic_url = {},
    office_name,
    office_phone_number,
    office_address,
  } = data || {};

  return (
    isSuccess && (
      <Grid container justify="space-between" spacing={3} className="mb-4">
        {office_profile_pic_url.url && (
          <Grid item xs={3}>
            <img
              src={office_profile_pic_url.url}
              width="100%"
              style={{ maxHeight: '12rem', maxWidth: '12rem' }}
            ></img>
          </Grid>
        )}
        <Grid item xs={7}>
          {office_name && <h6>{office_name}</h6>}
          {office_address && (
            <div>
              <RoomIcon style={{ height: '1rem', width: '1rem' }} />
              <span className="ms-1">{office_address}</span>
            </div>
          )}
          {office_phone_number && (
            <div>
              <CallIcon style={{ height: '1rem', width: '1rem' }} />
              <span className="ms-1">{office_phone_number.trim()}</span>
            </div>
          )}
        </Grid>
        <Grid item xs={2} justify="flex-end" alignItems="flex-start">
          <PoweredByKasper />
        </Grid>
      </Grid>
    )
  );
}
