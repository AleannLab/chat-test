import { Auth } from "aws-amplify";

const refreshAndGetSession = async () => {
  let session;
  try {
    session = await Auth.currentSession();
  } catch (e) {
    session = null;
  }

  return session;
};


export { refreshAndGetSession }
