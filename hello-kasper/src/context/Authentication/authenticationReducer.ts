import { AuthenticationActionType } from "./authentication";
import { StateAuthentication, AuthenticationActions } from "./authentication";
const authenticationReducer = (
  state: StateAuthentication,
  action: AuthenticationActions
) => {
  const { type, payload } = action;

  switch (type) {
    case AuthenticationActionType.setStore: {
      return {
        ...state,
        stores: payload,
      };
    }
    case AuthenticationActionType.setInit: {
      const { cognitoUser, user } = payload;
      return {
        ...state,
        authenticatedData: JSON.parse(localStorage.getItem("token")),
        cognitoUser,
        user,
      };
    }
    case AuthenticationActionType.setInvalidTenant: {
      return {
        ...state,
        invalidTenant: payload,
      };
    }
    case AuthenticationActionType.setAuthData: {
      const { user, session } = payload;
      const authenticatedData = {
        data: user,
        ...session,
      };
      localStorage.setItem("token", JSON.stringify(authenticatedData));
      return {
        ...state,
        authenticatedData,
      };
    }
    case AuthenticationActionType.login: {
      const { user, cognitoUser } = payload;
      return {
        ...state,
        cognitoUser,
        user,
      };
    }
    case AuthenticationActionType.refreshUser: {
      state.stores.users.notificationSubscribe({});
      return {
        ...state,
        user: state.stores.users.userMe({}),
      };
    }
    case AuthenticationActionType.logOut: {
      return {
        ...state,
        authenticatedData: null,
      };
    }
    case AuthenticationActionType.forcePasswordChange: {
      return {
        ...state,
        cognitoUser: payload,
      };
    }
    case AuthenticationActionType.setLoadedAuth: {
      return {
        ...state,
        loadedAuth: payload,
      };
    }
    default:
      return state;
  }
};

export { authenticationReducer };
