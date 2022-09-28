import { Auth } from "aws-amplify";

const refreshAndGetSession = (setAuthData, user) => {
  let session;

  try {
    session = yield Auth.currentSession();
    setAuthData({ user, session });
  } catch (e) {
    session = null;
  }

  return session;
};


export { refreshAndGetSession }
