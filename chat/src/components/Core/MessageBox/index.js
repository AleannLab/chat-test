import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from "assets/images/info-icon.svg";
import PropTypes from "prop-types";

import React from "react";

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: "#f3f5f9",
    padding: "0.9rem 1rem 1rem 1.4rem",
    display: "flex",
    alignItems: "flex-start",
  },
  text: {},
}));
const MessageBox = ({ messageText, showIcon }) => {
  const styles = useStyles();
  return (
    <Box className={styles.root}>
      {showIcon && (
        <Box component="span">
          <InfoIcon
            fill="#566F9F"
            width="1rem"
            height="1rem"
            className="me-2"
          />
        </Box>
      )}

      <Box component="span" className={styles.text}>
        {messageText}
      </Box>
    </Box>
  );
};

MessageBox.propTypes = {
  /** message text to render */
  messageText: PropTypes.string.isRequired,
  /** show the info icon */
  showIcon: PropTypes.bool,
};

MessageBox.defaultProps = {
  showIcon: false,
};

export default MessageBox;
