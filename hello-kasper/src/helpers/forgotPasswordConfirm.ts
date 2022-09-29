import { Auth } from "aws-amplify";

const forgotPasswordConfirm = ({ email, code, password }:any) => {
  Auth.forgotPasswordSubmit(email.toLowerCase(), code, password);
};

export { forgotPasswordConfirm };
