import Cookies from "js-cookie";
import { NavLink, useNavigate } from "react-router-dom";
import "./CustomerNavbar.css";

const CustomerNavbar = () => {
  const navigate = useNavigate();

  const onClickLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");

    navigate("/login", { replace: true });
  };

  return (
    <nav className="customer-navbar">
      <NavLink to="/">
        <h1>Tomato</h1>
      </NavLink>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>

        <li>
          <NavLink to="/restaurants-menu">Restaurants-Menu</NavLink>
        </li>

        <li>
          <NavLink to="/cart">Cart</NavLink>
        </li>

        <li>
          <NavLink to="/my-orders">My Orders</NavLink>
        </li>
      </ul>

      <NavLink to="/customer/profile">
        <div className="profile">Profile</div>
      </NavLink>
      <div className="logout-container">
        <button className="logout-button" onClick={onClickLogout} type="button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
