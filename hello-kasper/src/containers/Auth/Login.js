import React from "react";
import LoginForm from "../../components/Auth/FormLogin";
import OuterLayout from "../../layouts/LayoutOuter";

export default function Login() {
  return <OuterLayout Content={LoginForm} />;
}
