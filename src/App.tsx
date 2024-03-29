import "./App.css";
import FfdCamera from "./components/FfdCamera";
import React, { useState } from "react";

function App() {
  const [predictResult, setPredictResult] = useState(null);

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          width: "100vw",
          justifyContent: "center",
        }}
      >
        <FfdCamera setPredictResult={setPredictResult} />
      </div>
    </div>
  );
}

export default App;
