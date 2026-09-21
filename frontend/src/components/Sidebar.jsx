import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Grid2X2,
  LayoutGrid,
  Utensils,
  ClipboardList,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/restaurant/dashboard",
      icon: <Grid2X2 size={24} />,
    },
    {
      label: "Categories",
      path: "/restaurant/categories",
      icon: <LayoutGrid size={24} />,
    },
    {
      label: "Food Items",
      path: "/restaurant/fooditems",
      icon: <Utensils size={24} />,
    },
    {
      label: "Orders",
      path: "/restaurant/orders",
      icon: <ClipboardList size={24} />,
    },
  ];

  const isActive = (path) => {
    if (path === "/restaurant/dashboard") {
      return location.pathname === path;
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    Cookies.remove("token");

    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>

            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-item logout-item" onClick={handleLogout}>
          <span className="sidebar-icon">
            <LogOut size={24} />
          </span>

          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
