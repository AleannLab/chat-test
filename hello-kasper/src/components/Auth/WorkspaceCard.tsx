import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import CONSTANTS from "../../helpers/constants";
import Tooltip from "../Core/Tooltip";
// import { ReactComponent as HelpIcon } from "../../assets/images/help-outlined.svg";

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
    <div className={classes.root}>
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
                title=""
                color="#000000"
                maxWidth={300}
                placement="top-start" arrow={false} centerAlign={false} minHeight={0} textColor={""}            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 0C3.13306 0 0 3.16129 0 7C0 10.8669 3.13306 14 7 14C10.8387 14 14 10.8669 14 7C14 3.16129 10.8387 0 7 0ZM7 12.6452C3.86694 12.6452 1.35484 10.1331 1.35484 7C1.35484 3.89516 3.86694 1.35484 7 1.35484C10.1048 1.35484 12.6452 3.89516 12.6452 7C12.6452 10.1331 10.1048 12.6452 7 12.6452ZM10.0202 5.44758C10.0202 4.03629 8.52419 2.93548 7.14113 2.93548C5.81452 2.93548 4.96774 3.5 4.31855 4.4879C4.20565 4.62903 4.23387 4.82661 4.375 4.93952L5.16532 5.53226C5.30645 5.64516 5.53226 5.61694 5.64516 5.47581C6.06855 4.93952 6.37903 4.62903 7.02823 4.62903C7.53629 4.62903 8.15726 4.93952 8.15726 5.44758C8.15726 5.81452 7.84677 5.98387 7.33871 6.26613C6.77419 6.60484 6.0121 7 6.0121 8.01613V8.24193C6.0121 8.43952 6.15323 8.58064 6.35081 8.58064H7.62097C7.81855 8.58064 7.95968 8.43952 7.95968 8.24193V8.07258C7.95968 7.36694 10.0202 7.33871 10.0202 5.44758ZM8.18548 10.1613C8.18548 9.5121 7.64919 8.97581 7 8.97581C6.32258 8.97581 5.81452 9.5121 5.81452 10.1613C5.81452 10.8387 6.32258 11.3468 7 11.3468C7.64919 11.3468 8.18548 10.8387 8.18548 10.1613Z"
                  fill="#9A9A9A"
                />
              </svg>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
