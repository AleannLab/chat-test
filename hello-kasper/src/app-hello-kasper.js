import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import App from "./root.component";
import "./index.css";
import * as serviceWorker from "./serviceWorker";


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

if (process.env.NODE_ENV === "production") {
  console.log = function () {};
}

export const { bootstrap, mount, unmount } = lifecycles;
