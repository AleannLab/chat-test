import React, { Suspense, lazy, useEffect } from "react";
import {
  Route,
  Redirect,
  useHistory,
} from "react-router-dom";
import { observer } from "mobx-react";
import Loader from "../components/Core/Loader/index";
import { Auth } from "aws-amplify";
import { store } from "../stores";
import { useAuthenticationDispatch } from "../hooks/useAuthenticationDispatch";
import { useCookies } from "../hooks/useCookies";
import { useAuthenticationState } from "../hooks/useAuthenticationState";
import { assignWorkSpace } from "../helpers/assignWorkSpace";

const Login = lazy(() => import("./Auth/Login"));
const Workspace = lazy(() => import("./Auth/Workspace"));

const Routes = observer(() => {
  const WORKSPACE = "workspace";

  const {
    setAuthData,
    setInit,
    setStore,
    setInvalidTenant,
    setLoadedAuth,
    logOut,
  } = useAuthenticationDispatch();
  const { invalidTenant, loadedAuth, user } = useAuthenticationState();
  const history = useHistory();
  const [valueCookie] = useCookies("", WORKSPACE);

  const loaderHtml = (
    <div style={{ height: "100vh" }}>
      <Loader show={true} message="KASPER"></Loader>
    </div>
  );

  const setLogOut = async () => {
    logOut();
    await Auth.signOut();
    localStorage.clear();
    if (user?.phone_access) stores.dialer.disconnect();
  };

  const initAuth = async () => {
    await assignWorkSpace({}, setInvalidTenant);
    setStore(store);
    if (!invalidTenant) {
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        const session = await Auth.currentSession();
        const user = await store.users.userMe({});
        setInit(cognitoUser, user);
        await store.users.notificationSubscribe({});
        setAuthData(user, session);
      } catch (e) {
        console.log("hi error", e);
        // setLogOut();
      }
    }
    setLoadedAuth(true);
  };

  useEffect(() => {
    initAuth();
    if (!valueCookie) {
      history.push(`/${WORKSPACE}`);
    }
  }, []);

  return (
    <>
      {loadedAuth ? (
          <Suspense fallback={loaderHtml}>
            <Route path="/workspace" component={Workspace} />
            <Route exact path="/login" component={Login} />
            <PrivateRoute path="/" />
          </Suspense>
      ) : (
        loaderHtml
      )}
    </>
  );
});

export default Routes;

const PrivateRoute = observer(function ({ component: Component, ...rest }) {
  const { authenticatedData } = useAuthenticationState();
  const WORKSPACE = "workspace";
  const LOGIN = "login";
  const [valueCookie] = useCookies("", WORKSPACE);
  const PATH = valueCookie ? LOGIN : WORKSPACE;
  return (
    <Route
      {...rest}
      render={(props) =>
        authenticatedData ? <h1>Hello Kasper</h1> : <Redirect to={`/${PATH}`} />
      }
    />
  );
});
