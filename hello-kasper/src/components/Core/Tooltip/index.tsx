import React, { FC } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

type Placement =
  | "top-start"
  | "top"
  | "top-end"
  | "right-start"
  | "right"
  | "right-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end";

type CustomTooltipProps = {
  title: string;
  placement: Placement;
  arrow: boolean;
  centerAlign: boolean;
  maxWidth: number;
  minHeight: number;
  color: string;
  textColor: string;
  children?: JSX.Element
};

const useStyles = ({ maxWidth, minHeight, centerAlign, color, textColor }) =>
  makeStyles((theme) => ({
    tooltip: {
      background: `${color} !important`,
      fontSize: "0.91rem",
      maxWidth: maxWidth,
      opacity: 1,
      display: centerAlign ? "flex" : "",
      alignItems: "center",
      fontWeight: "normal",
      minHeight: minHeight,
      maxHeight: "100%",
      color: textColor || theme.palette.common.white,
    },
    arrow: {
      color: `${color} !important`,
    },
  }));

const CustomTooltip: FC<CustomTooltipProps> = ({
  title,
  placement,
  arrow,
  centerAlign,
  maxWidth,
  minHeight,
  color,
  textColor,
  children,
  ...props
}) => {
  const classes = useStyles({
    maxWidth,
    minHeight,
    centerAlign,
    color,
    textColor,
  })();
  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      {...props}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      data-testid="tooltip-component"
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltip;
