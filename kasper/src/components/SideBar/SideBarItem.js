import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import { Link, useRouteMatch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import style from './SideBarItem.module.css';
import { ReactComponent as HelpIcon } from 'assets/images/help-outlined.svg';
import Tooltip from 'components/Core/Tooltip';

export const SideBarItem = ({
  to,
  icon: Icon,
  name,
  counter: Counter,
  enabled = 1,
}) => {
  const classes = useStyles();
  const match = useRouteMatch(to);
  const styles = useStyles({ selected: match });

  const Disabled = (
    <Link to={to} key={name}>
      <Tooltip
        title="Insufficient permissions to view this page.
        Please contact your administrator."
        color="#000000"
        maxWidth={300}
        placement="right-end"
      >
        <ListItem button className="mb-2">
          <ListItemIcon>
            <Grid container>
              <Grid item xs={8} className={classes.menuIcons}>
                {Counter && <Counter className={style.counter} />}
                <Icon className={styles.disabledIcon} />
              </Grid>
            </Grid>
          </ListItemIcon>
          <ListItemText className={styles.disabled} primary={name} />
          <HelpIcon className={style.helpIcon} />
        </ListItem>
      </Tooltip>
    </Link>
  );

  const Enabled = (
    <Link to={to} key={name}>
      <ListItem button className="mb-2">
        <ListItemIcon>
          <Grid container>
            <Grid item xs={8} className={classes.menuIcons}>
              {Counter && <Counter className={style.counter} />}
              <Icon className={styles.icon} />
            </Grid>
          </Grid>
        </ListItemIcon>
        <ListItemText
          className={styles.text}
          primary={name}
          id={`sidebar-${name.replaceAll(' ', '-')}`}
        />
      </ListItem>
    </Link>
  );

  return enabled ? Enabled : Disabled;
};

const useStyles = makeStyles(() => ({
  icon: {
    width: '1.4rem',
    color: (props) => (props.selected ? '#F4266E' : '#D3D3D4'),
    '& path': {
      fill: (props) => (props.selected ? '#F4266E' : '#D3D3D4'),
    },
  },
  text: {
    fontSize: 24,
    color: (props) => (props.selected ? '#F4266E' : '#D3D3D4'),
  },
  menuIcons: {
    display: 'block',
    margin: ' auto',
    justifyContent: 'center',
  },

  disabled: {
    color: '#999999',
  },
  disabledIcon: {
    width: '1.4rem',
    color: '#999999',
  },
  helpIcon: {
    cursor: 'pointer',
    position: 'absolute',
    right: '5px',
    top: '5px',
  },
}));
