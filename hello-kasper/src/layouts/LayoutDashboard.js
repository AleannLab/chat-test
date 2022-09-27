import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

const isNotChrome = window.navigator.userAgent.indexOf('Chrome') === -1;

export default function LayoutDashboard(props) {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />
      <Grid container className={classes.content}>
        <Grid item xs>
          <Grid container className={classes.content}>
            {props.children}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

const useStyles = makeStyles(() => ({
  content: {
    height: `100vh`,
  },
}));
