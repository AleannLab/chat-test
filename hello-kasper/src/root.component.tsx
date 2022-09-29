import React, { FC } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { withLDProvider } from "launchdarkly-react-client-sdk";
import "./App.css";
import "./SentryOverride.css";
import Routes from "containers";
import theme from "./theme/index";
import CONSTANTS from "./helpers/constants";
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

const App: FC = () => {
  return (
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
})(App) as FC;
