import React from 'react';
import Notification from 'assets/images/bell.svg';
import Badge from '@material-ui/core/Badge';
import { Box } from '@material-ui/core';

// this would house the notification popup also
export default function NotificationBell() {
  return (
    <Box
      mr={2}
      className="d-none" // TODO : KAS-634 - Hide notification bell icon in the header navbar
    >
      <Badge badgeContent={4}>
        <img name="image" src={Notification} alt={'notifications'} />
      </Badge>
    </Box>
  );
}
