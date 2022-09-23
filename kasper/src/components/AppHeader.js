import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
// import { makeStyles } from "@material-ui/core/styles";
// import useMediaQuery from "@material-ui/core/useMediaQuery";
// import Button from '@material-ui/core/Button';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UserMenu from './MenuForUser';
import Logo from 'assets/images/logo.svg';

export default React.memo(function AppHeader(props) {
  //const matches = useMediaQuery("(min-width:600px)");
  //const classes = useStyles();
  //const [anchorEl, setAnchorEl] = React.useState(null);

  // <div className={classes.root}>
  return (
    <AppBar position="relative" elevation={0}>
      <Toolbar>
        <Box ml={-1.8} mt={0.5}>
          <img className="logo-image" name="image" src={Logo} alt={'kasper'} />
        </Box>
        <div className="title"></div>
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
});
