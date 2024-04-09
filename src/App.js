import "./App.css";
import FfdCamera from "./components/FfdCamera";

function App() {
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
        <FfdCamera />
      </div>
    </div>
  );
}

export default App;
