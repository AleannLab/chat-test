import "./public-path";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

function root(props: any) {
  const { container } = props;
  const root = ReactDOM.createRoot(
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
  root(props).render(<App />);
}

export async function unmount(props: any) {
  root(props).unmount();
}

export async function update(props: any) {
  console.log("update props", props);
}
