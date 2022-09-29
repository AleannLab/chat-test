import React, { useReducer, FC, PropsWithChildren } from "react";
import { authenticationReducer } from "./authenticationReducer";
import {
  AuthenticationActionType,
  StateAuthentication,
} from "./authentication";
import { AuthenticationContext } from "./AuthenticationContext";
import { AuthenticationDispatch } from "./AuthenticationDispatch";
type AuthenticationContextProviderProps = PropsWithChildren<{}>;
const initialState = {
  stores: null,
  user: null,
  authenticatedData: null,
  loadedAuth: false,
  invalidTenant: false,
  cognitoUser: null,
};

const AuthenticationContextProvider: FC<AuthenticationContextProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authenticationReducer, initialState);
  const context: StateAuthentication = state;
  const setStore = (stores: any) => {
    dispatch({
      type: AuthenticationActionType.setStore,
      payload: stores,
    });
  };

  const setInit = (cognitoUser: any, user: any) => {
    dispatch({
      type: AuthenticationActionType.setInit,
      payload: { cognitoUser, user },
    });
  };

  const login = (cognitoUser: any, user: any) => {
    dispatch({
      type: AuthenticationActionType.login,
      payload: { cognitoUser, user },
    });
  };

  const setInvalidTenant = (invalidTenant: any) => {
    dispatch({
      type: AuthenticationActionType.setInvalidTenant,
      payload: invalidTenant,
    });
  };

  const setAuthData = (user: any, session: any) => {
    dispatch({
      type: AuthenticationActionType.setAuthData,
      payload: { user, session },
    });
  };

  const refreshUser = () => {
    dispatch({
      type: AuthenticationActionType.refreshUser,
    });
  };
  const forcePasswordChange = (cognitoUser: any) => {
    dispatch({
      type: AuthenticationActionType.forcePasswordChange,
      payload: cognitoUser,
    });
  };
  const setLoadedAuth = (isLoaded: boolean) => {
    dispatch({
      type: AuthenticationActionType.setLoadedAuth,
      payload: isLoaded,
    });
  };
  const logOut = () => {
    dispatch({
      type: AuthenticationActionType.logOut,
    });
  };

  return (
    <AuthenticationContext.Provider value={context}>
      <AuthenticationDispatch.Provider
        value={{
          setStore,
          setInit,
          login,
          setInvalidTenant,
          setAuthData,
          refreshUser,
          forcePasswordChange,
          setLoadedAuth,
          logOut,
        }}
      >
        {children}
      </AuthenticationDispatch.Provider>
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContextProvider };
