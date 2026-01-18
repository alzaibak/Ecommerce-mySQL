import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { login } from "../../redux/apiCalls";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();

  const handleClick = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    try {
      await login(dispatch, { email, password });
      // Check if login was successful by checking Redux state
      setTimeout(() => {
        const state = JSON.parse(localStorage.getItem("persist:root"));
        if (state) {
          const userState = JSON.parse(state.user);
          if (userState?.currentUser) {
            history.push("/");
          } else {
            setError("Invalid credentials");
          }
        }
      }, 500);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Admin Login</h2>
      <input
        style={{ padding: 10, marginBottom: 20, width: 250 }}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={{ padding: 10, marginBottom: 20, width: 250 }}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <button onClick={handleClick} style={{ padding: 10, width: 250 }}>
        Login
      </button>
    </div>
  );
};

export default Login;
