import { createContext } from "react";

const AuthenticationDispatch = createContext({
  setStore: (store: any) => {},
  setInit: (cognitoUser: any, user: any) => {},
  login: (cognitoUser: any, user: any) => {},
  setInvalidTenant: (invalidTenant: any) => {},
  setAuthData: (user: any, session: any) => {},
  refreshUser: () => {},
  forcePasswordChange: (cognitoUser: any) => {},
  setLoadedAuth: (isLoaded: boolean) => {},
  logOut: () => {},
});

export { AuthenticationDispatch };
