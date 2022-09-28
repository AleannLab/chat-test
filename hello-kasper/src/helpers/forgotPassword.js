import { Auth } from "aws-amplify";

const forgotPassword = ({ email }) => {
  Auth.forgotPassword(email.toLowerCase());
};

export { forgotPassword };
