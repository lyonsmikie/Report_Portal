import { useState } from "react";
import { login } from "../services/api";

export default function LoginForm({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    setToken(data.access_token);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input className="border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input type="password" className="border p-2 mt-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="bg-blue-500 text-white p-2 mt-2">Login</button>
    </form>
  );
}
