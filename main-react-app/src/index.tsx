import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { registerMicroApps, start, setDefaultMountApp } from "qiankun";
import { store } from "./state";
import "./index.css";
import App from "./App";

let container: any = null;

document.addEventListener("DOMContentLoaded", function () {
  if (!container) {
    container = document.getElementById("root") as HTMLElement;
    const root = ReactDOM.createRoot(container);
    root.render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  }
});

registerMicroApps([
  {
    name: "micro-react1",
    entry: "//localhost:3001",
    container: "#subapp-viewport",
    activeRule: "/micro-react1",
    props: { store },
  },
  {
    name: "micro-react2",
    entry: "//localhost:3002",
    container: "#subapp-viewport",
    activeRule: "/micro-react2",
    props: { store },
  },
]);

setDefaultMountApp("/micro-react2");
start();
