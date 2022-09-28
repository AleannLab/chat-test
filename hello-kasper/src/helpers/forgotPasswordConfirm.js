import { Auth } from "aws-amplify";

const forgotPasswordConfirm = ({ email, code, password }) => {
  Auth.forgotPasswordSubmit(email.toLowerCase(), code, password);
};

export { forgotPasswordConfirm };
