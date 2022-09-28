import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { observer } from "mobx-react";
import Loader from "../components/Core/Loader/index";
import { Auth } from "aws-amplify";
import { store } from "../stores";
import { useAuthenticationDispatch } from "../hooks/useAuthenticationDispatch";
import { useAuthenticationState } from "../hooks/useAuthenticationState";
import { assignWorkSpace } from "../helpers/assignWorkSpace";

const Login = lazy(() => import("./Auth/Login"));

const Routes = observer(() => {
  const {
    setAuthData,
    setInit,
    setStore,
    setInvalidTenant,
    setLoadedAuth,
    logOut,
  } = useAuthenticationDispatch();
  const { invalidTenant, loadedAuth, user } = useAuthenticationState();

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
        setLogOut();
      }
    }
    setLoadedAuth(true);
  };

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <>
      {loadedAuth ? (
        <Router>
          <Suspense fallback={loaderHtml}>
            <Route exact path="/login" component={Login} />
            <PrivateRoute path="/" />
          </Suspense>
        </Router>
      ) : (
        loaderHtml
      )}
    </>
  );
});

export default Routes;

const PrivateRoute = observer(function ({ component: Component, ...rest }) {
  const { authenticatedData } = useAuthenticationState();

  return (
    <Route
      {...rest}
      render={(props) =>
        authenticatedData ? <h1>Hello Kasper</h1> : <Redirect to="/login" />
      }
    />
  );
});
