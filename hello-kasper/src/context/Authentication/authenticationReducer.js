import {
  SET_STORE,
  INIT,
  SET_INVALID_TENANT,
  SET_AUTH_DATA,
  LOGIN,
  REFRESH_USER,
  LOG_OUT,
  FORCE_PASSWORD_CHANGE,
  SET_LOADED_AUTH,
} from "./authenticationActions";

const authenticationReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_STORE: {
      return {
        ...state,
        stores: payload,
      };
    }
    case INIT: {
      const { cognitoUser, user } = payload;
      return {
        ...state,
        authenticatedData: JSON.parse(localStorage.getItem("token")),
        cognitoUser,
        user,
      };
    }
    case SET_INVALID_TENANT: {
      return {
        ...state,
        invalidTenant: payload,
      };
    }
    case SET_AUTH_DATA: {
      const {user, session} = payload
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
    case LOGIN: {
      state.stores.users.notificationSubscribe({});
      return {
        ...state,
        cognitoUser: payload,
        user: state.store.users.userMe({}),
      };
    }
    case REFRESH_USER: {
      state.stores.users.notificationSubscribe({});
      return {
        ...state,
        user: state.store.users.userMe({}),
      };
    }
    case LOG_OUT: {
      return {
        ...state,
        authenticatedData: null,
      };
    }
    case FORCE_PASSWORD_CHANGE: {
      return {
        ...state,
        cognitoUser: payload,
      };
    }
    case SET_LOADED_AUTH: {
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
