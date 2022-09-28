import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { observer } from "mobx-react";
import Loader from "../components/Core/Loader/index";
import { useStores } from "../hooks/useStores";
import { store } from "../stores";

const Login = lazy(() => import("./Auth/Login"));

const Routes = observer((props) => {
  const [newStore, setNewStore] = useState(store);
  const { authentication } = newStore;
  const loaderHtml = (
    <div style={{ height: "100vh" }}>
      <Loader show={true} message="KASPER"></Loader>
    </div>
  );
  useEffect(() => {
    setNewStore(store);
  }, [store]);
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
  const { authentication } = useStores();

  return (
    <Route
      {...rest}
      render={(props) =>
        authentication.authenticatedData ? (
          <h1>Hello Kasper</h1>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
});
