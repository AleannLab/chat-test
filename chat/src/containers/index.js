import React, { Suspense, lazy } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import Loader from 'components/Core/Loader';

const Login = lazy(() => import('./Auth/Login'));
const Dashboard = lazy(() => import('./Dashboard'));

const Routes = observer((props) => {
  const { authentication } = useStores();
  const loaderHtml = (
    <div style={{ height: '100vh' }}>
      <Loader show={true} message="KASPER"></Loader>
    </div>
  );

  if (authentication.loadedAuth === false) {
    return loaderHtml;
  } else {
    return (
        <Suspense fallback={loaderHtml}>
          <Route exact path="/login" component={Login} />
          <PrivateRoute path="/" component={Dashboard} />
        </Suspense>
    );
  }
});

export default Routes;

const PrivateRoute = observer(function ({ component: Component, ...rest }) {
  const { authentication } = useStores();

  return (
    <Route
      {...rest}
      render={(props) =>
        authentication.authenticatedData ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
});
