import { observable, flow } from "mobx";
import Amplify, { Auth } from "aws-amplify";

// import moment from "moment";
import CONSTANTS, { AUTHORIZATION_TYPE } from "helpers/constants";
import { getFcmToken } from "helpers/firebase";
import * as Sentry from "@sentry/react";
import LogRocket from "logrocket";

// window.LOG_LEVEL = 'DEBUG';

export class Authentication {
  @observable user = null;
  @observable authenticatedData = null;
  @observable loadedAuth = false;
  @observable invalidTenant = false;
  @observable cognitoUser = null;

  constructor(stores) {
    this.stores = stores;
    this.init();
  }

  init = flow(function* () {
    this.authenticatedData = JSON.parse(localStorage.getItem("token"));
    console.log("this.authenticatedData", this.authenticatedData);
    yield this.assignWorkSpace({});

    if (this.invalidTenant === false) {
      try {
        this.cognitoUser = yield Auth.currentAuthenticatedUser();
        const session = yield Auth.currentSession();

        this.user = yield this.stores.users.userMe({});

        yield this.stores.users.notificationSubscribe({});

        console.log("auth init", this.cognitoUser, session);
        this._setAuthData({ user: this.user, session });
      } catch (e) {
        console.log(e);
        console.log("Call from auth catch");
        this.logout({});
      }
    }

    this.loadedAuth = true;
  });

  login = flow(function* ({ email, password }) {
    this.cognitoUser = yield Auth.signIn(email.toLowerCase(), password);

    console.log("login cognitoUser", this.cognitoUser, yield getFcmToken());
    Sentry.setUser({ email: email });

    const { signInUserSession } = this.cognitoUser;
    if (this.cognitoUser.challengeName === "NEW_PASSWORD_REQUIRED") {
      throw new Error("NEW_PASSWORD_REQUIRED");
    }

    this.user = yield this.stores.users.userMe({});
    yield this.stores.users.notificationSubscribe({});
    this._setAuthData({ user: this.user, signInUserSession });

    // Initialize LogRocket with user details
    LogRocket.identify(this.user.id, {
      name: this.user.username,
      email: this.user.email,
    });
  });

  refreshUser = flow(function* (_params) {
    this.user = yield this.stores.users.userMe({});

    this._setAuthData({
      user: this.user,
      session: this.authenticatedData.session,
    });

    yield this.stores.users.notificationSubscribe({});
  });

  logout = flow(function* (args) {
    this.authenticatedData = null;
    yield Auth.signOut();
    console.log("logout cleared");
    localStorage.clear();
    if (this.user?.phone_access) this.stores.dialer.disconnect();
  });

  forgotPassword = flow(function* ({ email }) {
    yield Auth.forgotPassword(email.toLowerCase());
  });

  forgotPasswordConfirm = flow(function* ({ email, code, password }) {
    yield Auth.forgotPasswordSubmit(email.toLowerCase(), code, password);
  });

  changePassword = flow(function* ({ currentPassword, newPassword }) {
    let user = yield Auth.currentAuthenticatedUser();
    yield Auth.changePassword(user, currentPassword, newPassword);
  });

  assignWorkSpace = flow(function* (args) {
    let tenantId =
      args.tenantId ||
      CONSTANTS.TEST_TENANT_ID ||
      window.location.hostname.split(".")[0];
    const data = yield this._getTenantApiHandler({
      tenantId: tenantId,
    });

    if (data) {
      const { clientId, userPoolId } = data;
      Amplify.configure({
        Auth: {
          userPoolWebClientId: clientId,
          userPoolId: userPoolId,
          authenticationFlowType: "USER_PASSWORD_AUTH",
        },
      });
    } else {
      this.invalidTenant = true;
    }
  });

  forcePasswordChange = flow(function* ({ email, newPassword, oldPassword }) {
    try {
      this.cognitoUser = yield Auth.signIn(email.toLowerCase(), oldPassword);
      this.cognitoUser = yield Auth.completeNewPassword(
        this.cognitoUser,
        newPassword
      );

      console.log("*** this.cognitoUser", this.cognitoUser);
    } catch (e) {
      console.debug(e);
    }
  });

  refreshAndGetSession = flow(function* (params) {
    let session;

    try {
      session = yield Auth.currentSession();

      this._setAuthData({ user: this.user, session });
    } catch (e) {
      console.log("refreshAndGetSession", e);
      session = null;
    }

    return session;
  });

  _setAuthData = ({ user, session }) => {
    this.authenticatedData = {
      data: user,
      ...session,
    };

    localStorage.setItem("token", JSON.stringify(this.authenticatedData));
  };

  _getTenantApiHandler = async ({ tenantId }) => {
    console.log("_getTenantApiHandler called");
    const result = await fetch(`${CONSTANTS.ADMIN_API_URL}/office/aws`, {
      method: "GET",
      headers: {
        "x-custom-tenant-id": tenantId,
        Authorization: `Bearer ${CONSTANTS.ENV}-${tenantId}-tenant`,
        AuthorizationType: AUTHORIZATION_TYPE.TENANT,
        "Content-Type": "application/json",
      },
    }).then((r) => r.json());

    if (result.status === 403) {
      console.log("_getTenantApiHandler error", result);
      this.stores.notification.showError("Invalid office.");
      return null;
    } else {
      console.log("_getTenantApiHandler", result);
      return result.data;
    }
  };
}
