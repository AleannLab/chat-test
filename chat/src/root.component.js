import React, { useEffect } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { useFlags, withLDProvider } from "launchdarkly-react-client-sdk";
import * as Sentry from "@sentry/react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import "./SentryOverride.css";
import Routes from "containers/index";
import theme from "./theme/index";
import "bootstrap/dist/css/bootstrap.css";
import CONSTANTS from "helpers/constants";
import { analyticsInitialize } from "helpers/analytics";
import Fallback from "./components/Fallback";
import { useCookies } from "hooks/useCookies";
import ErrorLogs from "helpers/errorLogs";

import { OfficeChatContextProvider } from "context";

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
  const { enableGoogleAnalytics, showSentryUserFeedback, enableLogRocket } =
    useFlags();
  const WORKSPACE = "workspace";
  const [valueCookie] = useCookies("", WORKSPACE);
  if (enableGoogleAnalytics) {
    analyticsInitialize();
  }

  useEffect(() => {
    if (enableLogRocket) {
      LogRocket.init(CONSTANTS.LOGROCKET_APP_ID);
      setupLogRocketReact(LogRocket);

      // Initialize LogRocket with user details
      LogRocket.identify("Kasper");
    }
  }, [enableLogRocket]);

  // Initialize error logs
  useEffect(() => {
    showSentryUserFeedback !== undefined &&
      ErrorLogs.init(showSentryUserFeedback);
  }, [showSentryUserFeedback]);
  useEffect(() => {
    if (!valueCookie) {
      // window.location.href = process.env.REACT_APP_LOGIN
    }
  }, []);
  return (
    <Sentry.ErrorBoundary
      fallback={() => <Fallback />}
      showDialog={showSentryUserFeedback}
    >
      <BrowserRouter>
        <OfficeChatContextProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <CssBaseline />
                <Routes />
              </MuiPickersUtilsProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </OfficeChatContextProvider>
      </BrowserRouter>
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
