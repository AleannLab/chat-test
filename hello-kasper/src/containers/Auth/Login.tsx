import React, { FC } from "react";
import LoginForm from "../../components/Auth/FormLogin";
import OuterLayout from "../../layouts/LayoutOuter";

const Login: FC = () => {
  return <OuterLayout content={LoginForm} />;
};

export default Login;
