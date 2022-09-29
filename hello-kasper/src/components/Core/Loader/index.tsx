import React, { FC, PropsWithChildren } from "react";
import LoaderIcon from "../../../assets/images/loader.gif";
import styles from "./index.module.css";

type LoaderProps = PropsWithChildren<{
  show: boolean;
  message?: string;
  showMessage?: boolean;
}>;

const Loader: FC<LoaderProps> = ({
  children,
  show,
  message = "Loading...",
  showMessage = true,
}) => {
  return (
    <div className={styles.container}>
      {show ? (
        <div className={styles.loaderContainer}>
          <img src={LoaderIcon} alt="loader" />
          {showMessage ? <div>{message}</div> : null}
        </div>
      ) : (
        <div className={styles.childContainer}>{children}</div>
      )}
    </div>
  );
};

export default Loader;
