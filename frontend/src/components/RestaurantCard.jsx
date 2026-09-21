import { useNavigate } from "react-router-dom";
import "./RestaurantCard.css";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleRestaurantClick = () => {
    navigate(`/restaurants/${restaurant.restaurant_id}`);
  };

  return (
    <div className="restaurant-card" onClick={handleRestaurantClick}>
      <div className="restaurant-card-content">
        <h2>{restaurant.restaurant_name}</h2>

        {restaurant.description && <p>{restaurant.description}</p>}

        {restaurant.address && (
          <p className="restaurant-address">📍 {restaurant.address}</p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRestaurantClick();
          }}
        >
          View Menu
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
