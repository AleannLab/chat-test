import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { observer } from "mobx-react";
import Loader from "../components/Core/Loader/index";

const Login = lazy(() => import("./Auth/Login"));

const Routes = observer((props) => {
  const loaderHtml = (
    <div style={{ height: "100vh" }}>
      <Loader show={true} message="KASPER"></Loader>
    </div>
  );
  return (
    <>
      {true ? (
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
  return (
    <Route
      {...rest}
      render={(props) =>
        false ? <h1>hello world</h1> : <Redirect to="/login" />
      }
    />
  );
});
