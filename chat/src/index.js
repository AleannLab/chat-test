import './public-path';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { firebaseInitialize } from 'helpers/firebase';
import ErrorLogs from 'helpers/errorLogs';

firebaseInitialize();

// Initialize error logs
ErrorLogs.init();

function render(props) {
  const { container } = props;
  ReactDOM.render(
    <App />,
    container
      ? container.querySelector('#root')
      : document.querySelector('#root'),
  );
}

export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(
    container
      ? container.querySelector('#root')
      : document.querySelector('#root'),
  );
}
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
