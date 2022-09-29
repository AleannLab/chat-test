import { Auth } from "aws-amplify";

const changePassword = ({ currentPassword, newPassword }: any) => {
  let user = Auth.currentAuthenticatedUser();
  Auth.changePassword(user, currentPassword, newPassword);
};

export { changePassword };
