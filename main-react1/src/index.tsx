import "./public-path";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";

function root(props: any) {
  const { container } = props;
  const root = createRoot(
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
  return root;
}

export async function bootstrap() {
  console.log("react app bootstraped");
}

export async function mount(props: any) {
  const { store } = props;
  root(props).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export async function unmount(props: any) {
  root(props).unmount();
}

export async function update(props: any) {
  console.log("update props", props);
}
