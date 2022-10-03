import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import CONSTANTS from "helpers/constants";
import Tooltip from "components/Core/Tooltip";
import HelpIcon from "assets/images/help-outlined.svg";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 0.8rem",
    backgroundColor: "#F0F3F8",
    border: "1px solid #D9E2F3",
    borderRadius: "4px",
    width: "100%",
  },
  caption: {
    textTransform: "uppercase",
    fontSize: "0.65rem",
  },
  helpIcon: {
    cursor: "pointer",
  },
}));

export default function WorkspaceCard({ isValid }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <div className="me-2">
        {isValid ? (
          <CheckCircleIcon htmlColor="#3BAA53" />
        ) : (
          <CancelIcon htmlColor="#F42626" />
        )}
      </div>
      <div>
        <Typography variant="caption" className={classes.caption}>
          Workspace (Ready to connect)
        </Typography>
        {isValid ? (
          <Typography variant="body1">
            {CONSTANTS.TEST_TENANT_ID || window.location.hostname.split(".")[0]}
          </Typography>
        ) : (
          <div className="d-flex align-items-center">
            <Typography variant="body1" className="me-2">
              Invalid tenant name
            </Typography>
            <Tooltip
              title="Please type the correct subdomain in the URL or refresh the page to try again"
              color="#000000"
              maxWidth={300}
              placement="top-start"
            >
              <HelpIcon className={classes.helpIcon} />
            </Tooltip>
          </div>
        )}
      </div>
    </Box>
  );
}
