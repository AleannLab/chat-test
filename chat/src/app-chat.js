import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import App from "./root.component";
import './index.css';
import { firebaseInitialize } from 'helpers/firebase';
import ErrorLogs from 'helpers/errorLogs';

firebaseInitialize();

// Initialize error logs
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

export const { bootstrap, mount, unmount } = lifecycles;
