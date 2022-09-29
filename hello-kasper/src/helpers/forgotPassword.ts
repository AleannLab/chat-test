import { Auth } from "aws-amplify";

const forgotPassword = ({ email }:any) => {
  Auth.forgotPassword(email.toLowerCase());
};

export { forgotPassword };
