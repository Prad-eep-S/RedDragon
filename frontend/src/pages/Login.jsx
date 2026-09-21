import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../api/api";

const roles = [
  { roleId: "CUSTOMER", role: "CUSTOMER" },
  { roleId: "RESTAURANT", role: "RESTAURANT" },
  { roleId: "ADMIN", role: "ADMIN" },
];

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    role: "CUSTOMER",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      if (role === "CUSTOMER") {
        navigate("/", { replace: true });
      } else if (role === "RESTAURANT") {
        navigate("/restaurant/dashboard", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      }
    }
  }, [navigate]);

  const onLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);
      const token = response.data.id_token;
      const role = response.data.role;
      // console.log(response.data);

      Cookies.set("token", token, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });
      setLoading(false);
      if (role === "CUSTOMER") {
        navigate("/", { replace: true });
      } else if (role === "RESTAURANT") {
        navigate("/restaurant", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin", {replace: true})
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    }
  };

  const handleRegisterDetailsChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <form onSubmit={onLogin}>
          <h1>Tomato</h1>

          <p className="login-subtitle">
            Welcome back! Please login to your account.
          </p>

          <div className="form-group">
            <label htmlFor="role">Role</label>

            <select onChange={handleRegisterDetailsChange} id="role">
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              onChange={handleRegisterDetailsChange}
              id="email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              onChange={handleRegisterDetailsChange}
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button className="login-button" type="submit">
            {loading ? "logging....." : "Login"}
          </button>

          <Link className="register-link" to="/register">
            Don't have an account? Register here
          </Link>
          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
