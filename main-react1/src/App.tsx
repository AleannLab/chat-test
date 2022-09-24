import React from "react";
import { useDispatch } from "react-redux";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  return (
    <div>
      <button
        onClick={() => dispatch({ type: "INCREMENT-MICRO2" })}
        className="App"
      >
        Hello React1
      </button>
      <p className={"text"}>text-react-1</p>
    </div>
  );
}

export default App;
