import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';

import { useStores } from 'hooks/useStores';
import { ReactComponent as BellIcon } from '../assets/bell.svg';

const NotificationCard = ({
  delivery_method,
  unit,
  notificationTime,
  notificationId,
  patientSecret,
}) => {
  const notificationTypes = [
    { id: 1, label: 'SMS', value: 'SMS' },
    { id: 2, label: 'Email', value: 'EMAIL' },
    { id: 3, label: 'SMS and Email', value: 'SMS_EMAIL' },
  ];
  const timeDurationTypes = [
    { id: 1, label: 'Minutes', value: 'minutes' },
    { id: 2, label: 'Hours', value: 'hours' },
    { id: 3, label: 'Days', value: 'days' },
    { id: 4, label: 'Weeks', value: 'weeks' },
  ];
  const { mobileNotificationSettings, notification } = useStores();

  const [deliveryMethod, setDeliveryMethod] = useState(delivery_method);
  const [time, setTime] = useState(notificationTime);
  const [timeDurationType, setTimeDurationType] = useState(unit);

  const handleEditNotification = (changedValue, changedValueType) => {
    if (changedValueType === 'delivery_methods') {
      setDeliveryMethod(changedValue);
    }
    if (changedValueType === 'unit') {
      setTimeDurationType(changedValue);
    }
    if (changedValueType === 'time') {
      if (changedValue <= 0) {
        setTime(1);
      } else {
        setTime(changedValue);
      }
    }
    mobileNotificationSettings.editNotificationSetting(
      notificationId,
      changedValue,
      changedValueType,
    );
  };

  const handleRemoveNotification = () => {
    mobileNotificationSettings
      .removeNotificationSetting({ notificationId, patientSecret })
      .catch((err) => {
        console.error(err.message);
        notification.showError(
          'An unexpected error occurred while attempting to delete the notification',
        );
      });
  };

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
            onClick={handleRemoveNotification}
          />
        }
      />
      <CardContent>
        <Grid container>
          <Grid item xs={12} className="mt-0 mb-0 pb-0">
            <InputLabel>NOTIFICATION</InputLabel>
            <Select
              variant="outlined"
              style={{ width: '100%', height: '36px' }}
              value={deliveryMethod}
              onChange={(e) =>
                handleEditNotification(e.target.value, 'delivery_methods')
              }
            >
              {notificationTypes.map((notificationType) => (
                <MenuItem
                  key={notificationType.id}
                  value={notificationType.value}
                >
                  {notificationType.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid container className="mt-4">
            <Grid item xs={6} className="mt-0 mb-0 pe-2">
              <InputLabel>TIME</InputLabel>
              <TextField
                type="number"
                inputProps={{ style: { height: '14px' } }}
                variant="outlined"
                size="small"
                value={time}
                onChange={(e) => handleEditNotification(e.target.value, 'time')}
              />
            </Grid>
            <Grid item xs={6} className="mt-0 mb-0 ps-2">
              <InputLabel style={{ visibility: 'hidden' }}>
                {' '}
                PLACEHOLDER
              </InputLabel>
              <Select
                variant="outlined"
                style={{ width: '100%', height: '36px' }}
                value={timeDurationType}
                onChange={(e) => handleEditNotification(e.target.value, 'unit')}
              >
                {timeDurationTypes.map((tdurationType) => (
                  <MenuItem key={tdurationType.id} value={tdurationType.value}>
                    {tdurationType.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default observer(NotificationCard);
