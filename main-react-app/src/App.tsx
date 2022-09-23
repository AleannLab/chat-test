import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const { count1, count2 } = useSelector((state: any) => state);
  const dispatch = useDispatch();
  const increment1 = () => {
    dispatch({ type: "INCREMENT" });
  };
  return (
    <div className="App">
      <header>
        <Link to="/micro-react1">Sub-react1</Link>
        <Link to="/micro-react2">Sub-react2</Link>
        <button onClick={increment1}>Push</button>
      </header>
      <h1>{count1}</h1>
      <h2>{count2}</h2>
      <div id="subapp-viewport"></div>
    </div>
  );
}

export default App;
