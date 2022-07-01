import "./App.css";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const http = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
  });

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const csrf = await http.get("/sanctum/csrf-cookie");
    console.log("csrf = ", csrf);

    const login = await http.post("/api/login", {
      email: "test@example.com",
      password: "password",
    });
    console.log("login = ", login);

    const user = await http.get("/api/user");
    console.log("user = ", user);
  }

  return <div>...</div>;
}

export default App;
