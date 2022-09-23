import React from "react";
import { useDispatch } from "react-redux";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  return (
    <button
      onClick={() => dispatch({ type: "INCREMENT-MICRO2" })}
      className="App"
    >
      Hello React1
    </button>
  );
}

export default App;
