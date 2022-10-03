import React from "react";
import NoSelectionIllustration from "assets/images/no-calls-selected.svg";
import styles from "./index.module.css";

const NoCallsSelected = () => {
  return (
    <div className="d-flex flex-grow-1 align-items-center justify-content-center">
      <div className={styles.innerContainer}>
        <NoSelectionIllustration />
        <span className={styles.text}>No Calls Selected</span>
      </div>
    </div>
  );
};

export default NoCallsSelected;
