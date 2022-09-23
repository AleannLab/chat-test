import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start, setDefaultMountApp } from "qiankun";
import './index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { firebaseInitialize } from 'helpers/firebase';
import ErrorLogs from 'helpers/errorLogs';

firebaseInitialize();

// Initialize error logs
ErrorLogs.init();

ReactDOM.render(
  // <React.StrictMode>
  // </React.StrictMode>,
  <App />,
  document.getElementById('root'),
);
registerMicroApps([
  {
    name: "office-chat",
    entry: "//localhost:3001",
    container: "#office-chat",
    activeRule: "dashboard/office-chat",
  },
]);

setDefaultMountApp("dashboard/office-chat");
start();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

if (process.env.NODE_ENV === 'production') {
  console.log = function () {};
}

// const constantMock = window.fetch;
// window.fetch = function (url = "", data = { headers: {} }) {
//   const newHeaders = { ...data.headers , 'authorization'};
//   return constantMock(...args);
// };
