import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>RedDragon</h2>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>📦</span>
            Orders
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>👥</span>
            Customers
          </NavLink>

          <NavLink
            to="/admin/restaurants"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span>🍴</span>
            Restaurants
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Admin Panel</h1>
            <p>Manage RedDragon platform</p>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
