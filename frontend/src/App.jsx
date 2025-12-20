import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.text())
      .then(console.log);
  }, []);

  return <h1>Frontend running</h1>;
}

export default App;
