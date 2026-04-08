import React, { useState } from "react";
import API from "../services/api";

function Login() {
  const [data, setData] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    const res = await API.post("login/", data);
    localStorage.setItem("token", res.data.access);
    alert("Login successful");
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="username"
        onChange={(e) => setData({ ...data, username: e.target.value })}
      />
      <input type="password" placeholder="password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;