import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import "./SentryOverride.css";
import Routes from "containers/index";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "./theme/index";
import "bootstrap/dist/css/bootstrap.css";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useFlags, withLDProvider } from "launchdarkly-react-client-sdk";
import CONSTANTS from "./helpers/constants";
import * as Sentry from "@sentry/react";
import Fallback from "./components/Fallback";
import { AuthenticationContextProvider } from "./context";

const TENANT_ID =
  CONSTANTS.TEST_TENANT_ID || window.location.hostname.split(".")[0];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { showSentryUserFeedback } = useFlags();

  return (
    <Sentry.ErrorBoundary
      fallback={() => <Fallback />}
      showDialog={showSentryUserFeedback}
    >
      <Router>
        <AuthenticationContextProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <CssBaseline />
                <Routes />
              </MuiPickersUtilsProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AuthenticationContextProvider>
      </Router>
    </Sentry.ErrorBoundary>
  );
};

export default withLDProvider({
  clientSideID: process.env.REACT_APP_LD_CLIENT_KEY,
  user: {
    key: `kasper-ui-${TENANT_ID}`,
    custom: {
      tenant: TENANT_ID,
    },
  },
})(App);
