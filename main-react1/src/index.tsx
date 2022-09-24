import "./public-path";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";

function render(props: any) {
  const { container, store } = props;
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
}

export async function bootstrap() {
  console.log("[react16] react app bootstraped");
}

export async function mount(props: any) {
  console.log("[react16] props from main framework", props);
  render(props);
}

export async function unmount(props: any) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
}
