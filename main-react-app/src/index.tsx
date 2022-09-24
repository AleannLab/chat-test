import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { registerMicroApps, start, setDefaultMountApp } from "qiankun";
import { store } from "./state";
import "./index.css";
import App from "./App";

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,

  document.getElementById("root")
);

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

setDefaultMountApp("/micro-react1");
start();
