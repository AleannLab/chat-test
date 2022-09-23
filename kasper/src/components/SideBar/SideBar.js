import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { ReactComponent as RightArrowIcon } from 'assets/images/double-arrow-right.svg';
import { ReactComponent as LeftArrowIcon } from 'assets/images/double-arrow-left.svg';
import { makeStyles } from '@material-ui/core/styles';
import { useMenu } from './menus';
import { SideBarItem } from './SideBarItem';
import { observer } from 'mobx-react-lite';
import { useStores } from 'hooks/useStores';
import Dialer from 'components/Dialer';
import SideBarItemSkeleton from './SideBarItemSkeleton';

const drawerWidth = 240;

const SideBar = observer((props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(
    parseInt(localStorage.getItem('display_sidebar')),
  );
  const [dialerSize, setDialerSize] = useState('lg');
  const menus = useMenu();
  const { permissions } = useStores();
  const { enableOfficeGroupChat } = useFlags();

  const handleDrawerOpen = () => {
    localStorage.setItem('display_sidebar', 1);
    setOpen(1);
    setDialerSize('lg');
  };

  const handleDrawerClose = () => {
    localStorage.setItem('display_sidebar', 0);
    setOpen(0);
    setDialerSize('sm');
  };

  const sideBarToggle = (
    <div
      className={[
        'd-flex align-items-center',
        open ? 'justify-content-end' : '',
      ].join(' ')}
      style={{
        borderBottom: '.5px solid #293D63',
        borderTop: '.5px solid #293D63',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '3px 5px',
        marginTop: `${props.headerHeight}px`,
      }}
      onClick={() =>
        open && enableOfficeGroupChat ? handleDrawerClose() : handleDrawerOpen()
      }
    >
      {open ? <LeftArrowIcon /> : <RightArrowIcon />}
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
        paperAnchorDockedLeft: classes.noBorder,
      }}
    >
      <List className="list">
        {sideBarToggle}
        <div style={{ marginTop: '55px' }}>
          {menus.isLoading
            ? [...Array(8)].map((_, index) => (
                <SideBarItemSkeleton key={index} />
              ))
            : menus.menuItems
                .filter((item) => !item.hidden)
                .map((item) => (
                  <SideBarItem
                    key={item.name}
                    to={item.to}
                    icon={item.icon}
                    name={item.name}
                    enabled={item.enabled}
                    counter={item.counter}
                  />
                ))}
        </div>
      </List>
      {permissions.phoneAccess && <Dialer size={dialerSize} />}
    </Drawer>
  );
});

export default SideBar;

export const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .arrow-container': {
      height: '18px',
      '& .arrow': {
        height: 5,
        width: 10,
        cursor: 'pointer',
      },
    },
    '& .image': {
      height: 14,
      width: 14,
      padding: '2px 3px 2px 3px',
      cursor: 'pointer',
    },
    '& .list': {
      height: '100%',
      background: theme.palette.primary.dark,
      padding: 0,
    },
    '& a:hover': {
      textDecoration: 'none',
    },
  },
  appBar: {
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: '70px',
    [theme.breakpoints.up('sm')]: {
      width: '70px',
    },
  },
  noBorder: {
    border: '0px !important',
  },
}));
