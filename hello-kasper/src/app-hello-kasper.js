import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import App from "./root.component";
import * as serviceWorker from './serviceWorker';
import { firebaseInitialize } from 'helpers/firebase';
import ErrorLogs from 'helpers/errorLogs';
import './index.css';
import 'font-awesome/css/font-awesome.min.css';


firebaseInitialize();
ErrorLogs.init();

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

serviceWorker.unregister();
if (process.env.NODE_ENV === 'production') {
  console.log = function () {};
}
export const { bootstrap, mount, unmount } = lifecycles;
