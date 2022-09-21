import React from "react";

const Button = ({ text, children = "", ...props }) => {
  return <button {...props}>{text || children}</button>;
};

export default Button;
