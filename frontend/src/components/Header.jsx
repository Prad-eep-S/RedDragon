import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="restaurant-header">
      <div className="restaurant-header-left">
        <h2>Red Dragon</h2>
      </div>

      <div className="restaurant-header-right">
        <button
          type="button"
          className="profile-icon-button"
          onClick={() => navigate("/restaurant/profile")}
          title="Restaurant Profile"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
