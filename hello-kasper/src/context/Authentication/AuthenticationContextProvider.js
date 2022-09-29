import React, { useReducer, createContext } from "react";
import { authenticationReducer } from "./authenticationReducer";
import {
  SET_STORE,
  INIT,
  SET_INVALID_TENANT,
  SET_AUTH_DATA,
  LOGIN,
  REFRESH_USER,
  FORCE_PASSWORD_CHANGE,
  SET_LOADED_AUTH,
  LOG_OUT,
} from "./authenticationActions";

export const AuthenticationContext = createContext();
export const AuthenticationDispatch = createContext();

const initialState = {
  stores: null,
  user: null,
  authenticatedData: null,
  loadedAuth: false,
  invalidTenant: false,
  cognitoUser: null,
};

const AuthenticationContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authenticationReducer, initialState);

  const setStore = (stores) => {
    dispatch({
      type: SET_STORE,
      payload: stores,
    });
  };

  const setInit = (cognitoUser, user) => {
    dispatch({
      type: INIT,
      payload: { cognitoUser, user },
    });
  };

  const login = (cognitoUser, user) => {
    dispatch({
      type: LOGIN,
      payload: { cognitoUser, user },
    });
  };

  const setInvalidTenant = (invalidTenant) => {
    dispatch({
      type: SET_INVALID_TENANT,
      payload: invalidTenant,
    });
  };

  const setAuthData = (user, session) => {
    dispatch({
      type: SET_AUTH_DATA,
      payload: { user, session },
    });
  };

  const refreshUser = () => {
    dispatch({
      type: REFRESH_USER,
    });
  };
  const forcePasswordChange = (cognitoUser) => {
    dispatch({
      type: FORCE_PASSWORD_CHANGE,
      payload: cognitoUser,
    });
  };
  const setLoadedAuth = (isLoaded) => {
    dispatch({
      type: SET_LOADED_AUTH,
      payload: isLoaded,
    });
  };
  const logOut = () => {
    dispatch({
      type: LOG_OUT,
    });
  };

  return (
    <AuthenticationContext.Provider value={state}>
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
