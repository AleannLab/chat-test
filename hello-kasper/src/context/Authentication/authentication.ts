export type StateAuthentication = {
  stores: any;
  user: any;
  authenticatedData: any;
  loadedAuth: boolean;
  invalidTenant: boolean;
  cognitoUser: any;
};

export enum AuthenticationActionType {
  setStore,
  setInit,
  login,
  setInvalidTenant,
  setAuthData,
  refreshUser,
  forcePasswordChange,
  setLoadedAuth,
  logOut,
}

export type AuthenticationActions =
  | {
      readonly type: AuthenticationActionType.setStore;
      readonly payload: any;
    }
  | {
      readonly type: AuthenticationActionType.setInit;
      readonly payload: any;
    }
  | {
      readonly type: AuthenticationActionType.login;
      readonly payload: any;
    }
  | {
      readonly type: AuthenticationActionType.setInvalidTenant;
      readonly payload: any;
    }
  | {
      readonly type: AuthenticationActionType.setAuthData;
      readonly payload: any;
    }
  | {
      readonly type: AuthenticationActionType.refreshUser;
      readonly payload?: any;
    }
  | {
      readonly type: AuthenticationActionType.forcePasswordChange;
      readonly payload: any;
    }
  | {
      readonly type: AuthenticationActionType.setLoadedAuth;
      readonly payload: boolean;
    }
  | {
      readonly type: AuthenticationActionType.logOut;
      readonly payload?: any;
    };
