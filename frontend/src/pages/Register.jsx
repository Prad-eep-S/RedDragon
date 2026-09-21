import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import api from "../api/api";

const roles = [
  { roleId: "CUSTOMER", role: "CUSTOMER" },
  { roleId: "RESTAURANT", role: "RESTAURANT" },
];

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      if (role === "CUSTOMER") {
        navigate("/", { replace: true });
      } else if (role === "RESTAURANT") {
        navigate("/restaurant", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      }
    }
  }, [navigate]);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

  const handleRegisterDetailsChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const onRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/register", formData);

      const { email, role } = response.data;
      navigate("/verify-email", {
        state: {
          email,
          role,
          requiresVerification: response.data.requires_verification,
        },
      });

    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);

        console.log("MESSAGE:", error.response.data.message);

        console.log("DATA:", error.response.data);
      } else {
        console.error("NETWORK ERROR:", error);
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <form onSubmit={onRegister}>
          <h1>Domato</h1>

          <p className="register-subtitle">Create your account</p>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your username"
              onChange={handleRegisterDetailsChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>

            <select
              value={formData.role}
              onChange={handleRegisterDetailsChange}
              id="role"
            >
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

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              onChange={handleRegisterDetailsChange}
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
            />
          </div>

          <button className="register-button" type="submit">
            Register
          </button>

          <Link className="login-link" to="/login">
            Already have an account? Sign in
          </Link>

          <p className="terms">
            By creating an account, I accept the Terms & Conditions and Privacy
            Policy.
          </p>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
