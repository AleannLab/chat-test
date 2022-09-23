import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

const COLOR = '#5f5f5f';

export default function SideBarItemSkeleton() {
  return (
    <ListItem button className="mb-2">
      <ListItemIcon>
        <Skeleton
          variant="circle"
          style={{ backgroundColor: COLOR }}
          width={32}
          height={32}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Skeleton
            variant="text"
            style={{ backgroundColor: COLOR }}
            width={100}
            height={20}
          />
        }
      />
    </ListItem>
  );
}
